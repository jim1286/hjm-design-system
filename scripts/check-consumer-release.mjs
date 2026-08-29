import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const API_VERSION = "2026-03-10";
const DEFAULT_POLL_INTERVAL_MS = 10_000;
const DEFAULT_TIMEOUT_MS = 45 * 60_000;
const ARTIFACT_POLL_INTERVAL_MS = 2_000;
const ARTIFACT_TIMEOUT_MS = 45_000;
const WORKFLOW_FILE = "hjm-release-candidate.yml";
const EVENT_TYPE = "hjm-release-candidate";
const WORKSPACE_ROOT = fileURLToPath(new URL("..", import.meta.url));

export const consumerReleaseTargets = [
  {
    id: "burntok-web",
    repository: "jim1286/BurnTok",
    defaultBranch: "main",
    surface: "web",
    artifactPrefix: "hjm-consumer-evidence-burntok-",
    evidenceSuffix: "hjm-evidence.json",
    releaseBinding: "canonicalRelease",
  },
  {
    id: "burntok-native",
    repository: "jim1286/BurnTok",
    defaultBranch: "main",
    surface: "native",
    artifactPrefix: "hjm-consumer-evidence-burntok-native-",
    evidenceSuffix: "native-storybook.json",
    dispatchSuffix: "dispatch.json",
    releaseBinding: "releaseCandidate",
  },
  {
    id: "yajalal-native",
    repository: "jim1286/yajalal",
    defaultBranch: "main",
    surface: "native",
    artifactPrefix: "hjm-consumer-evidence-yajalal-",
    evidenceSuffix: "native-storybook.json",
    dispatchSuffix: "dispatch.json",
    releaseBinding: "releaseCandidate",
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

function assertLocalReleaseCommit(releaseSha) {
  let resolvedCommit;
  try {
    resolvedCommit = execFileSync(
      "git",
      ["rev-parse", "--verify", `${releaseSha}^{commit}`],
      {
        cwd: WORKSPACE_ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).trim();
  } catch {
    throw new Error(`release-sha ${releaseSha} does not resolve to a local Git commit`);
  }

  const headCommit = execFileSync("git", ["rev-parse", "--verify", "HEAD^{commit}"], {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  if (resolvedCommit !== releaseSha.toLowerCase()) {
    throw new Error(`release-sha ${releaseSha} did not resolve exactly to ${resolvedCommit}`);
  }
  if (headCommit !== resolvedCommit) {
    throw new Error(
      `release-sha ${releaseSha} does not match current local HEAD ${headCommit}`,
    );
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

function bindTargetCorrelation(target, baseCorrelationId) {
  const correlationId = `${baseCorrelationId}-${target.id}`;
  if (!/^[0-9A-Za-z.-]{1,180}$/.test(correlationId)) {
    throw new Error(`Target correlation id for ${target.id} is not artifact-safe or exceeds 180 characters`);
  }
  return { ...target, correlationId };
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

async function resolveConsumerRepository(client, targets) {
  const [firstTarget] = targets;
  if (!firstTarget) return [];
  if (targets.some(
    (target) =>
      target.repository !== firstTarget.repository ||
      target.defaultBranch !== firstTarget.defaultBranch,
  )) {
    throw new Error("Consumer repository group contains mixed repository or branch values");
  }
  const repositoryPath = encodedRepository(firstTarget.repository);
  const metadata = await client.json(`/repos/${repositoryPath}`);
  if (metadata.default_branch !== firstTarget.defaultBranch) {
    throw new Error(
      `${firstTarget.repository} default branch changed from ${firstTarget.defaultBranch} to ${metadata.default_branch}`,
    );
  }
  const commit = await client.json(
    `/repos/${repositoryPath}/commits/${encodeURIComponent(firstTarget.defaultBranch)}`,
  );
  const consumerRef = commit.sha;
  if (!/^[0-9a-f]{40}$/.test(consumerRef ?? "")) {
    throw new Error(`${firstTarget.repository}@${firstTarget.defaultBranch} did not resolve to a full Git SHA`);
  }
  const workflow = await client.json(
    `/repos/${repositoryPath}/contents/.github/workflows/${WORKFLOW_FILE}?ref=${consumerRef}`,
  );
  const source = Buffer.from(workflow.content ?? "", workflow.encoding ?? "base64").toString("utf8");
  const invariants = [
    "repository_dispatch",
    EVENT_TYPE,
    "consumer_ref",
    "github.event.client_payload.surface",
    ...targets.flatMap((target) => [target.artifactPrefix, target.evidenceSuffix]),
  ];
  for (const invariant of new Set(invariants)) {
    if (!source.includes(invariant)) {
      throw new Error(`${firstTarget.repository}@${consumerRef} workflow is missing required invariant ${invariant}`);
    }
  }
  console.log(
    `Captured ${firstTarget.repository}@${firstTarget.defaultBranch} at ${consumerRef} for ` +
    `${targets.map(({ surface }) => surface).join(", ")}.`,
  );
  return targets.map((target) => ({ ...target, consumerRef }));
}

async function resolveConsumerTargets(client, targets) {
  const groups = new Map();
  for (const target of targets) {
    const key = `${target.repository}\0${target.defaultBranch}`;
    const group = groups.get(key) ?? [];
    group.push(target);
    groups.set(key, group);
  }
  return (await Promise.all(
    [...groups.values()].map((group) => resolveConsumerRepository(client, group)),
  )).flat();
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
        correlation_id: target.correlationId,
        consumer_ref: target.consumerRef,
        surface: target.surface,
      },
    }),
  });
  console.log(`Dispatched ${target.id} at captured consumer ${target.consumerRef}.`);
  return dispatchedAt;
}

async function findCorrelatedRun(client, target, release, dispatchedAt) {
  const repositoryPath = encodedRepository(target.repository);
  const expectedTitle = `HJM ${release.version} · ${target.correlationId}`;
  const response = await client.json(
    `/repos/${repositoryPath}/actions/workflows/${encodeURIComponent(WORKFLOW_FILE)}/runs?event=repository_dispatch&per_page=100`,
  );
  const correlatedRuns = (response.workflow_runs ?? []).filter((run) =>
    run.event === "repository_dispatch" &&
    run.display_title === expectedTitle &&
    Date.parse(run.created_at) >= dispatchedAt - 5_000
  );
  const wrongRevision = correlatedRuns.find((run) => run.head_sha !== target.consumerRef);
  if (wrongRevision) {
    throw new Error(
      `${target.repository} correlated run ${wrongRevision.html_url} used consumer revision ${wrongRevision.head_sha}, expected ${target.consumerRef}`,
    );
  }
  const matches = correlatedRuns.filter((run) => run.head_sha === target.consumerRef);
  if (matches.length > 1) {
    throw new Error(`${target.id} produced multiple runs for correlation ${target.correlationId}`);
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

function assertExactInventoryStoryIds(target, evidence, manifest, surface) {
  if (!Array.isArray(manifest.components)) {
    throw new Error(`${target.id} manifest components must be an array`);
  }
  const manifestStoryIds = new Set();
  const expected = [];
  for (const component of manifest.components) {
    if (
      typeof component?.storyId !== "string" ||
      component.storyId.length === 0 ||
      !Array.isArray(component.requirements)
    ) {
      throw new Error(`${target.id} manifest contains an invalid component projection`);
    }
    if (manifestStoryIds.has(component.storyId)) {
      throw new Error(`${target.id} manifest repeats story id ${component.storyId}`);
    }
    manifestStoryIds.add(component.storyId);
    if (component.requirements.some((requirement) => requirement?.surface === surface)) {
      expected.push(component.storyId);
    }
  }

  const actual = evidence.inventory?.storyIds;
  if (!Array.isArray(actual) || actual.some((storyId) => typeof storyId !== "string")) {
    throw new Error(`${target.id} inventory storyIds must be an array of strings`);
  }
  const occurrences = new Map();
  for (const storyId of actual) {
    occurrences.set(storyId, (occurrences.get(storyId) ?? 0) + 1);
  }
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const duplicates = [...occurrences]
    .filter(([, count]) => count > 1)
    .map(([storyId]) => storyId)
    .sort();
  const missing = expected.filter((storyId) => !actualSet.has(storyId)).sort();
  const unexpected = actual.filter((storyId) => !expectedSet.has(storyId)).sort();
  if (duplicates.length > 0 || missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `${target.id} inventory story IDs do not match canonical ${surface} projection; ` +
      `duplicates: ${duplicates.join(", ") || "none"}; ` +
      `missing: ${missing.join(", ") || "none"}; ` +
      `unexpected: ${unexpected.join(", ") || "none"}`,
    );
  }
}

export function validateEvidenceDocuments(target, documents, release) {
  const { evidence, manifest, dispatch } = documents;
  requireEqual(evidence.schemaVersion, 1, `${target.id} evidence schemaVersion`);
  requireEqual(evidence.designSystemVersion, release.version, `${target.id} evidence designSystemVersion`);
  requireEqual(evidence.source?.revision, target.consumerRef, `${target.id} evidence consumer revision`);
  requireEqual(manifest.schemaVersion, 2, `${target.id} manifest schemaVersion`);
  requireEqual(manifest.packageName, "@hjmds/design-contracts", `${target.id} manifest packageName`);
  requireEqual(manifest.designSystemVersion, release.version, `${target.id} manifest version`);

  requireEqual(evidence.source?.id, target.id, `${target.id} evidence source id`);
  requireEqual(evidence.source?.surface, target.surface, `${target.id} evidence source surface`);
  requireEqual(evidence.inventory?.surface, target.surface, `${target.id} inventory surface`);
  assertExactInventoryStoryIds(target, evidence, manifest, target.surface);

  if (target.releaseBinding === "canonicalRelease") {
    requireEqual(evidence.canonicalRelease?.repository, release.repository, `${target.id} canonical repository`);
    requireEqual(evidence.canonicalRelease?.revision, release.releaseSha, `${target.id} release SHA`);
    requireEqual(evidence.canonicalRelease?.version, release.version, `${target.id} release version`);
    requireEqual(
      evidence.canonicalRelease?.correlationId,
      target.correlationId,
      `${target.id} correlation id`,
    );
  } else if (target.releaseBinding === "releaseCandidate") {
    const candidate = evidence.inventory?.releaseCandidate;
    requireEqual(candidate?.repository, release.repository, `${target.id} canonical repository`);
    requireEqual(candidate?.release_sha, release.releaseSha, `${target.id} release SHA`);
    requireEqual(candidate?.version, release.version, `${target.id} release version`);
    requireEqual(candidate?.correlation_id, target.correlationId, `${target.id} correlation id`);
    requireEqual(candidate?.surface, target.surface, `${target.id} release-candidate surface`);
    requireEqual(dispatch?.repository, release.repository, `${target.id} dispatch repository`);
    requireEqual(dispatch?.release_sha, release.releaseSha, `${target.id} dispatch release SHA`);
    requireEqual(dispatch?.consumer_ref, target.consumerRef, `${target.id} dispatch consumer ref`);
    requireEqual(dispatch?.version, release.version, `${target.id} dispatch version`);
    requireEqual(dispatch?.correlation_id, target.correlationId, `${target.id} dispatch correlation id`);
    requireEqual(dispatch?.surface, target.surface, `${target.id} dispatch surface`);
  } else {
    throw new Error(`Unsupported release binding for ${target.id}: ${target.releaseBinding}`);
  }
}

async function waitForConsumerArtifact(client, target, run, expectedName) {
  const repositoryPath = encodedRepository(target.repository);
  const deadline = Date.now() + ARTIFACT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const response = await client.json(
      `/repos/${repositoryPath}/actions/runs/${run.id}/artifacts?per_page=100`,
    );
    const matches = (response.artifacts ?? []).filter((artifact) => artifact.name === expectedName);
    if (matches.length > 1) {
      throw new Error(`${target.id} must upload exactly one ${expectedName}; found ${matches.length}`);
    }
    if (matches.length === 1) {
      const [artifact] = matches;
      if (
        artifact.expired !== false ||
        !Number.isSafeInteger(artifact.size_in_bytes) ||
        artifact.size_in_bytes <= 0
      ) {
        throw new Error(`${target.id} evidence artifact is expired or empty`);
      }
      return artifact;
    }
    await sleep(ARTIFACT_POLL_INTERVAL_MS);
  }
  throw new Error(
    `${target.id} did not expose ${expectedName} within ${ARTIFACT_TIMEOUT_MS}ms after its successful run`,
  );
}

async function verifyConsumerArtifact(client, target, run, release) {
  const repositoryPath = encodedRepository(target.repository);
  const expectedName = `${target.artifactPrefix}${target.correlationId}`;
  const artifact = await waitForConsumerArtifact(client, target, run, expectedName);

  const temporaryDirectory = await mkdtemp(join(tmpdir(), `hjm-${target.id}-evidence-`));
  const archivePath = join(temporaryDirectory, "evidence.zip");
  try {
    const archive = await client.bytes(`/repos/${repositoryPath}/actions/artifacts/${artifact.id}/zip`);
    if (archive.length === 0) {
      throw new Error(`${target.id} evidence artifact archive is empty`);
    }
    await writeFile(archivePath, archive);
    const evidence = readJsonFromZip(archivePath, target.evidenceSuffix);
    const manifest = readJsonFromZip(archivePath, "showcase-manifest.json");
    const dispatch = target.dispatchSuffix
      ? readJsonFromZip(archivePath, target.dispatchSuffix)
      : undefined;
    validateEvidenceDocuments(target, { evidence, manifest, dispatch }, release);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
  console.log(`${target.id} evidence artifact ${expectedName} is bound to the release payload.`);
}

async function selfTest() {
  const release = {
    repository: "jim1286/hjm-design-system",
    releaseSha: "a".repeat(40),
    version: "0.6.0",
    correlationId: `hjm-0.6.0-${"a".repeat(40)}-test`,
  };
  const manifest = {
    schemaVersion: 2,
    packageName: "@hjmds/design-contracts",
    designSystemVersion: release.version,
    components: [
      {
        storyId: "foundation/text",
        requirements: [{ surface: "web" }, { surface: "native" }],
      },
      { storyId: "input/checkbox", requirements: [{ surface: "web" }] },
      { storyId: "layout/divider", requirements: [{ surface: "native" }] },
      { storyId: "contract/planned", requirements: [{ surface: "contract" }] },
    ],
  };
  requireEqual(
    JSON.stringify(consumerReleaseTargets.map(({ id }) => id)),
    JSON.stringify(["burntok-web", "burntok-native", "yajalal-native"]),
    "Self-test consumer surface target matrix",
  );
  const burntokConfigs = consumerReleaseTargets.filter(
    ({ repository }) => repository === "jim1286/BurnTok",
  );
  const yajalalConfigs = consumerReleaseTargets.filter(
    ({ repository }) => repository === "jim1286/yajalal",
  );
  const burntokRef = "b".repeat(40);
  const yajalalRef = "c".repeat(40);
  const burntokRepositoryPath = encodedRepository("jim1286/BurnTok");
  const yajalalRepositoryPath = encodedRepository("jim1286/yajalal");
  const revisionRequests = new Map();
  const workflowSource = (targets) => Buffer.from([
    "repository_dispatch",
    EVENT_TYPE,
    "consumer_ref",
    "github.event.client_payload.surface",
    ...targets.flatMap((target) => [target.artifactPrefix, target.evidenceSuffix]),
  ].join("\n")).toString("base64");
  const resolvedTargets = await resolveConsumerTargets(
    {
      json: async (path) => {
        if (path === `/repos/${burntokRepositoryPath}`) {
          return { default_branch: "main" };
        }
        if (path === `/repos/${burntokRepositoryPath}/commits/main`) {
          revisionRequests.set("burntok", (revisionRequests.get("burntok") ?? 0) + 1);
          return { sha: burntokRef };
        }
        if (path.endsWith(`${WORKFLOW_FILE}?ref=${burntokRef}`)) {
          return {
            content: workflowSource(burntokConfigs),
            encoding: "base64",
          };
        }
        if (path === `/repos/${yajalalRepositoryPath}`) {
          return { default_branch: "main" };
        }
        if (path === `/repos/${yajalalRepositoryPath}/commits/main`) {
          revisionRequests.set("yajalal", (revisionRequests.get("yajalal") ?? 0) + 1);
          return { sha: yajalalRef };
        }
        if (path.endsWith(`${WORKFLOW_FILE}?ref=${yajalalRef}`)) {
          return {
            content: workflowSource(yajalalConfigs),
            encoding: "base64",
          };
        }
        throw new Error(`Unexpected self-test API request ${path}`);
      },
    },
    consumerReleaseTargets,
  );
  requireEqual(revisionRequests.get("burntok"), 1, "Self-test BurnTok HEAD resolution count");
  requireEqual(revisionRequests.get("yajalal"), 1, "Self-test Yajalal HEAD resolution count");
  const targets = resolvedTargets.map((target) =>
    bindTargetCorrelation(target, release.correlationId)
  );
  const targetById = new Map(targets.map((target) => [target.id, target]));
  const burntokWeb = targetById.get("burntok-web");
  const burntokNative = targetById.get("burntok-native");
  const yajalalNative = targetById.get("yajalal-native");
  if (!burntokWeb || !burntokNative || !yajalalNative) {
    throw new Error("Self-test failed to resolve the complete consumer surface target matrix");
  }

  let dispatchedPayload;
  await dispatchConsumer(
    {
      json: async (_path, options) => {
        dispatchedPayload = JSON.parse(options.body);
      },
    },
    burntokNative,
    release,
  );
  requireEqual(dispatchedPayload?.client_payload?.surface, "native", "Self-test dispatch surface");
  requireEqual(
    dispatchedPayload?.client_payload?.correlation_id,
    burntokNative.correlationId,
    "Self-test target correlation id",
  );

  function createEvidenceDocuments(target) {
    const storyIds = target.surface === "web"
      ? ["foundation/text", "input/checkbox"]
      : ["foundation/text", "layout/divider"];
    const evidence = {
      schemaVersion: 1,
      designSystemVersion: release.version,
      source: { id: target.id, surface: target.surface, revision: target.consumerRef },
      inventory: { surface: target.surface, storyIds },
    };
    if (target.releaseBinding === "canonicalRelease") {
      evidence.canonicalRelease = {
        repository: release.repository,
        revision: release.releaseSha,
        version: release.version,
        correlationId: target.correlationId,
      };
      return { evidence, manifest };
    }
    const dispatch = {
      repository: release.repository,
      release_sha: release.releaseSha,
      consumer_ref: target.consumerRef,
      version: release.version,
      correlation_id: target.correlationId,
      surface: target.surface,
    };
    evidence.inventory.releaseCandidate = dispatch;
    return { evidence, manifest, dispatch };
  }

  for (const target of targets) {
    validateEvidenceDocuments(target, createEvidenceDocuments(target), release);
  }
  const burntokWebDocuments = createEvidenceDocuments(burntokWeb);
  const burntokEvidence = burntokWebDocuments.evidence;

  function expectRejected(label, evidence, pattern) {
    try {
      validateEvidenceDocuments(burntokWeb, { evidence, manifest }, release);
    } catch (error) {
      if (pattern.test(String(error))) return;
      throw error;
    }
    throw new Error(`Consumer release evidence self-test accepted ${label}`);
  }
  expectRejected(
    "a mismatched release SHA",
    {
      ...burntokEvidence,
      canonicalRelease: { ...burntokEvidence.canonicalRelease, revision: "b".repeat(40) },
    },
    /burntok-web release SHA/,
  );
  expectRejected(
    "a mismatched consumer revision",
    {
      ...burntokEvidence,
      source: { ...burntokEvidence.source, revision: "d".repeat(40) },
    },
    /evidence consumer revision/,
  );
  expectRejected(
    "a mismatched evidence surface",
    {
      ...burntokEvidence,
      source: { ...burntokEvidence.source, surface: "native" },
    },
    /burntok-web evidence source surface/,
  );
  const burntokNativeDocuments = createEvidenceDocuments(burntokNative);
  try {
    validateEvidenceDocuments(
      burntokNative,
      {
        ...burntokNativeDocuments,
        dispatch: { ...burntokNativeDocuments.dispatch, surface: "web" },
      },
      release,
    );
    throw new Error("Consumer release evidence self-test accepted a cross-surface dispatch");
  } catch (error) {
    if (!/burntok-native dispatch surface/.test(String(error))) throw error;
  }
  expectRejected(
    "a missing inventory story",
    { ...burntokEvidence, inventory: { ...burntokEvidence.inventory, storyIds: ["foundation/text"] } },
    /missing: input\/checkbox/,
  );
  expectRejected(
    "an unexpected inventory story",
    {
      ...burntokEvidence,
      inventory: {
        ...burntokEvidence.inventory,
        storyIds: [...burntokEvidence.inventory.storyIds, "layout/divider"],
      },
    },
    /unexpected: layout\/divider/,
  );
  expectRejected(
    "a duplicate inventory story",
    {
      ...burntokEvidence,
      inventory: {
        ...burntokEvidence.inventory,
        storyIds: [...burntokEvidence.inventory.storyIds, "foundation/text"],
      },
    },
    /duplicates: foundation\/text/,
  );
  try {
    await findCorrelatedRun(
      {
        json: async () => ({
          workflow_runs: [{
            event: "repository_dispatch",
            display_title: `HJM ${release.version} · ${burntokWeb.correlationId}`,
            created_at: new Date().toISOString(),
            head_sha: "d".repeat(40),
            html_url: "https://example.invalid/wrong-head",
          }],
        }),
      },
      burntokWeb,
      release,
      Date.now(),
    );
    throw new Error("Consumer release evidence self-test accepted a wrong-head run");
  } catch (error) {
    if (!/used consumer revision/.test(String(error))) throw error;
  }
  console.log(
    "Consumer release evidence self-test passed for burntok-web, burntok-native, and yajalal-native, including dynamic revision resolution, binding, wrong-head, and inventory rejection.",
  );
}

async function main() {
  if (process.argv.includes("--self-test")) {
    await selfTest();
    return;
  }

  const args = parseArguments(process.argv.slice(2));
  const release = {
    repository: args.repository,
    releaseSha: args["release-sha"],
    version: args.version,
  };
  assertReleaseInputs(release);
  assertLocalReleaseCommit(release.releaseSha);
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

  const resolvedTargets = (await resolveConsumerTargets(client, consumerReleaseTargets))
    .map((target) => bindTargetCorrelation(target, release.correlationId));
  const dispatchTimes = await Promise.all(
    resolvedTargets.map((target) => dispatchConsumer(client, target, release)),
  );
  const runs = await Promise.all(
    resolvedTargets.map((target, index) =>
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
    resolvedTargets.map((target, index) =>
      verifyConsumerArtifact(client, target, runs[index], release),
    ),
  );
  console.log(
    `Verified ${resolvedTargets.map(({ id }) => id).join(", ")} private consumer evidence ` +
    `for ${release.version}@${release.releaseSha}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
