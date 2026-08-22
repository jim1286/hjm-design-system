import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const API_VERSION = "2026-03-10";
const DEFAULT_POLL_INTERVAL_MS = 10_000;
const DEFAULT_TIMEOUT_MS = 45 * 60_000;
const WORKFLOW_FILE = "hjm-release-candidate.yml";
const EVENT_TYPE = "hjm-release-candidate";

export const consumerReleaseTargets = [
  {
    id: "burntok",
    repository: "jim1286/BurnTok",
    defaultBranch: "main",
    consumerRef: "58794d4bbd5597ab6d6101f8888307eea08f67ee",
    artifactPrefix: "hjm-consumer-evidence-burntok-",
    evidenceSuffix: "hjm-evidence.json",
  },
  {
    id: "yajalal",
    repository: "jim1286/yajalal",
    defaultBranch: "develop",
    consumerRef: "e4164cc5207e48faf4a164dea3ce9475e63c0242",
    artifactPrefix: "hjm-consumer-evidence-yajalal-",
    evidenceSuffix: "native-storybook.json",
  },
];

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${argument}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${argument}`);
    }
    values.set(argument.slice(2), value);
    index += 1;
  }
  return Object.fromEntries(values);
}

function assertReleaseInputs({ repository, releaseSha, version }) {
  if (repository !== "jim1286/hjm-design-system") {
    throw new Error(`Canonical repository must be jim1286/hjm-design-system, received ${repository || "missing"}`);
  }
  if (!/^[0-9a-f]{40}$/i.test(releaseSha ?? "")) {
    throw new Error("release-sha must be a full 40-character Git SHA");
  }
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version ?? "")) {
    throw new Error("version must be an exact stable SemVer without a v prefix");
  }
}

function createCorrelationId(version, releaseSha) {
  const runIdentity = process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || "1"}`
    : randomUUID();
  const correlationId = `hjm-${version}-${releaseSha}-${runIdentity}`;
  if (!/^[0-9A-Za-z.-]{1,180}$/.test(correlationId)) {
    throw new Error("Generated correlation id is not artifact-safe or exceeds 180 characters");
  }
  return correlationId;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function createGitHubClient(token, apiBaseUrl) {
  async function request(path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": API_VERSION,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const body = (await response.text()).slice(0, 1_000);
      throw new Error(`GitHub API ${options.method || "GET"} ${path} failed (${response.status}): ${body}`);
    }
    return response;
  }

  return {
    async json(path, options) {
      const response = await request(path, options);
      return response.status === 204 ? undefined : response.json();
    },
    async bytes(path) {
      const response = await request(path);
      return Buffer.from(await response.arrayBuffer());
    },
  };
}

function encodedRepository(repository) {
  return repository.split("/").map(encodeURIComponent).join("/");
}

async function verifyConsumerRevision(client, target) {
  const repositoryPath = encodedRepository(target.repository);
  const metadata = await client.json(`/repos/${repositoryPath}`);
  if (metadata.default_branch !== target.defaultBranch) {
    throw new Error(
      `${target.repository} default branch changed from ${target.defaultBranch} to ${metadata.default_branch}`,
    );
  }
  const commit = await client.json(
    `/repos/${repositoryPath}/commits/${encodeURIComponent(target.defaultBranch)}`,
  );
  if (commit.sha !== target.consumerRef) {
    throw new Error(
      `${target.repository}@${target.defaultBranch} is ${commit.sha}, but the reviewed consumer gate is pinned to ${target.consumerRef}`,
    );
  }
  const workflow = await client.json(
    `/repos/${repositoryPath}/contents/.github/workflows/${WORKFLOW_FILE}?ref=${target.consumerRef}`,
  );
  const source = Buffer.from(workflow.content ?? "", workflow.encoding ?? "base64").toString("utf8");
  for (const invariant of ["repository_dispatch", EVENT_TYPE, "consumer_ref", target.artifactPrefix]) {
    if (!source.includes(invariant)) {
      throw new Error(`${target.repository} pinned workflow is missing required invariant ${invariant}`);
    }
  }
}

async function dispatchConsumer(client, target, release) {
  const dispatchedAt = Date.now();
  await client.json(`/repos/${encodedRepository(target.repository)}/dispatches`, {
    method: "POST",
    body: JSON.stringify({
      event_type: EVENT_TYPE,
      client_payload: {
        repository: release.repository,
        release_sha: release.releaseSha,
        version: release.version,
        correlation_id: release.correlationId,
        consumer_ref: target.consumerRef,
      },
    }),
  });
  console.log(`Dispatched ${target.repository} at immutable consumer ${target.consumerRef}.`);
  return dispatchedAt;
}

async function findCorrelatedRun(client, target, release, dispatchedAt) {
  const repositoryPath = encodedRepository(target.repository);
  const expectedTitle = `HJM ${release.version} · ${release.correlationId}`;
  const response = await client.json(
    `/repos/${repositoryPath}/actions/workflows/${encodeURIComponent(WORKFLOW_FILE)}/runs?event=repository_dispatch&per_page=100`,
  );
  const matches = (response.workflow_runs ?? []).filter((run) =>
    run.event === "repository_dispatch" &&
    run.display_title === expectedTitle &&
    run.head_sha === target.consumerRef &&
    Date.parse(run.created_at) >= dispatchedAt - 5_000
  );
  if (matches.length > 1) {
    throw new Error(`${target.repository} produced multiple runs for correlation ${release.correlationId}`);
  }
  return matches[0];
}

async function waitForConsumerRun(client, target, release, dispatchedAt, pollIntervalMs, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let observedRun;
  while (Date.now() < deadline) {
    observedRun = await findCorrelatedRun(client, target, release, dispatchedAt);
    if (observedRun?.status === "completed") {
      if (observedRun.conclusion !== "success") {
        throw new Error(
          `${target.repository} consumer gate ${observedRun.html_url} completed with ${observedRun.conclusion}`,
        );
      }
      console.log(`${target.repository} consumer gate succeeded: ${observedRun.html_url}`);
      return observedRun;
    }
    await sleep(pollIntervalMs);
  }
  const detail = observedRun ? `last observed status ${observedRun.status}` : "no correlated run appeared";
  throw new Error(`${target.repository} consumer gate timed out after ${timeoutMs}ms (${detail})`);
}

function zipEntries(zipPath) {
  return execFileSync("unzip", ["-Z1", zipPath], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  }).trim().split("\n").filter(Boolean);
}

function readJsonFromZip(zipPath, suffix) {
  const matches = zipEntries(zipPath).filter(
    (entry) => entry === suffix || entry.endsWith(`/${suffix}`),
  );
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${suffix} in consumer artifact, found ${matches.length}`);
  }
  if (matches[0].split("/").includes("..")) {
    throw new Error(`Unsafe artifact entry path: ${matches[0]}`);
  }
  const source = execFileSync("unzip", ["-p", zipPath, matches[0]], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  return JSON.parse(source);
}

function requireEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} must be ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

export function validateEvidenceDocuments(target, documents, release) {
  const { evidence, manifest, dispatch } = documents;
  requireEqual(evidence.schemaVersion, 1, `${target.id} evidence schemaVersion`);
  requireEqual(evidence.designSystemVersion, release.version, `${target.id} evidence designSystemVersion`);
  requireEqual(evidence.source?.revision, target.consumerRef, `${target.id} evidence consumer revision`);
  requireEqual(manifest.schemaVersion, 2, `${target.id} manifest schemaVersion`);
  requireEqual(manifest.designSystemVersion, release.version, `${target.id} manifest version`);

  if (target.id === "burntok") {
    requireEqual(evidence.source?.id, "burntok-web", "BurnTok evidence source id");
    requireEqual(evidence.source?.surface, "web", "BurnTok evidence surface");
    requireEqual(evidence.inventory?.surface, "web", "BurnTok inventory surface");
    requireEqual(evidence.canonicalRelease?.repository, release.repository, "BurnTok canonical repository");
    requireEqual(evidence.canonicalRelease?.revision, release.releaseSha, "BurnTok release SHA");
    requireEqual(evidence.canonicalRelease?.version, release.version, "BurnTok release version");
    requireEqual(
      evidence.canonicalRelease?.correlationId,
      release.correlationId,
      "BurnTok correlation id",
    );
  } else if (target.id === "yajalal") {
    requireEqual(evidence.source?.id, "yajalal-native", "Yajalal evidence source id");
    requireEqual(evidence.source?.surface, "native", "Yajalal evidence surface");
    requireEqual(evidence.inventory?.surface, "native", "Yajalal inventory surface");
    const candidate = evidence.inventory?.releaseCandidate;
    requireEqual(candidate?.repository, release.repository, "Yajalal canonical repository");
    requireEqual(candidate?.release_sha, release.releaseSha, "Yajalal release SHA");
    requireEqual(candidate?.version, release.version, "Yajalal release version");
    requireEqual(candidate?.correlation_id, release.correlationId, "Yajalal correlation id");
    requireEqual(dispatch?.repository, release.repository, "Yajalal dispatch repository");
    requireEqual(dispatch?.release_sha, release.releaseSha, "Yajalal dispatch release SHA");
    requireEqual(dispatch?.consumer_ref, target.consumerRef, "Yajalal dispatch consumer ref");
    requireEqual(dispatch?.version, release.version, "Yajalal dispatch version");
    requireEqual(dispatch?.correlation_id, release.correlationId, "Yajalal dispatch correlation id");
  } else {
    throw new Error(`Unknown consumer target ${target.id}`);
  }
}

async function verifyConsumerArtifact(client, target, run, release) {
  const repositoryPath = encodedRepository(target.repository);
  const response = await client.json(
    `/repos/${repositoryPath}/actions/runs/${run.id}/artifacts?per_page=100`,
  );
  const expectedName = `${target.artifactPrefix}${release.correlationId}`;
  const matches = (response.artifacts ?? []).filter((artifact) => artifact.name === expectedName);
  if (matches.length !== 1) {
    throw new Error(`${target.repository} must upload exactly one ${expectedName}; found ${matches.length}`);
  }
  const [artifact] = matches;
  if (artifact.expired || artifact.size_in_bytes <= 0) {
    throw new Error(`${target.repository} evidence artifact is expired or empty`);
  }

  const temporaryDirectory = await mkdtemp(join(tmpdir(), `hjm-${target.id}-evidence-`));
  const archivePath = join(temporaryDirectory, "evidence.zip");
  try {
    await writeFile(
      archivePath,
      await client.bytes(`/repos/${repositoryPath}/actions/artifacts/${artifact.id}/zip`),
    );
    const evidence = readJsonFromZip(archivePath, target.evidenceSuffix);
    const manifest = readJsonFromZip(archivePath, "showcase-manifest.json");
    const dispatch = target.id === "yajalal"
      ? readJsonFromZip(archivePath, "dispatch.json")
      : undefined;
    validateEvidenceDocuments(target, { evidence, manifest, dispatch }, release);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
  console.log(`${target.repository} evidence artifact ${expectedName} is bound to the release payload.`);
}

function selfTest() {
  const release = {
    repository: "jim1286/hjm-design-system",
    releaseSha: "a".repeat(40),
    version: "0.6.0",
    correlationId: `hjm-0.6.0-${"a".repeat(40)}-test`,
  };
  const manifest = { schemaVersion: 2, designSystemVersion: release.version };
  const burntok = consumerReleaseTargets[0];
  const burntokEvidence = {
    schemaVersion: 1,
    designSystemVersion: release.version,
    source: { id: "burntok-web", surface: "web", revision: burntok.consumerRef },
    inventory: { surface: "web" },
    canonicalRelease: {
      repository: release.repository,
      revision: release.releaseSha,
      version: release.version,
      correlationId: release.correlationId,
    },
  };
  validateEvidenceDocuments(burntok, { evidence: burntokEvidence, manifest }, release);
  const yajalal = consumerReleaseTargets[1];
  const dispatch = {
    repository: release.repository,
    release_sha: release.releaseSha,
    consumer_ref: yajalal.consumerRef,
    version: release.version,
    correlation_id: release.correlationId,
  };
  const yajalalEvidence = {
    schemaVersion: 1,
    designSystemVersion: release.version,
    source: { id: "yajalal-native", surface: "native", revision: yajalal.consumerRef },
    inventory: {
      surface: "native",
      releaseCandidate: dispatch,
    },
  };
  validateEvidenceDocuments(yajalal, { evidence: yajalalEvidence, manifest, dispatch }, release);
  try {
    validateEvidenceDocuments(
      burntok,
      { evidence: { ...burntokEvidence, canonicalRelease: { ...burntokEvidence.canonicalRelease, revision: "b".repeat(40) } }, manifest },
      release,
    );
  } catch (error) {
    if (/BurnTok release SHA/.test(String(error))) {
      console.log("Consumer release evidence self-test passed.");
      return;
    }
    throw error;
  }
  throw new Error("Consumer release evidence self-test accepted a mismatched release SHA");
}

async function main() {
  if (process.argv.includes("--self-test")) {
    selfTest();
    return;
  }

  const args = parseArguments(process.argv.slice(2));
  const release = {
    repository: args.repository,
    releaseSha: args["release-sha"],
    version: args.version,
  };
  assertReleaseInputs(release);
  const manifest = JSON.parse(
    await readFile(new URL("../packages/design-contracts/package.json", import.meta.url), "utf8"),
  );
  requireEqual(manifest.version, release.version, "Local design-contracts package version");

  const token = process.env.HJM_CONSUMER_SYNC_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "HJM_CONSUMER_SYNC_TOKEN is required; refusing to create a release tag without private consumer verification",
    );
  }
  release.correlationId = createCorrelationId(release.version, release.releaseSha);
  const pollIntervalMs = Number(process.env.HJM_CONSUMER_POLL_INTERVAL_MS || DEFAULT_POLL_INTERVAL_MS);
  const timeoutMs = Number(process.env.HJM_CONSUMER_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  if (!Number.isFinite(pollIntervalMs) || pollIntervalMs < 250 || !Number.isFinite(timeoutMs) || timeoutMs < 1_000) {
    throw new Error("Consumer poll interval or timeout is invalid");
  }
  const client = createGitHubClient(
    token,
    (process.env.HJM_GITHUB_API_URL || "https://api.github.com").replace(/\/$/, ""),
  );

  await Promise.all(consumerReleaseTargets.map((target) => verifyConsumerRevision(client, target)));
  const dispatchTimes = await Promise.all(
    consumerReleaseTargets.map((target) => dispatchConsumer(client, target, release)),
  );
  const runs = await Promise.all(
    consumerReleaseTargets.map((target, index) =>
      waitForConsumerRun(
        client,
        target,
        release,
        dispatchTimes[index],
        pollIntervalMs,
        timeoutMs,
      ),
    ),
  );
  await Promise.all(
    consumerReleaseTargets.map((target, index) =>
      verifyConsumerArtifact(client, target, runs[index], release),
    ),
  );
  console.log(`Verified all private consumer evidence for ${release.version}@${release.releaseSha}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
