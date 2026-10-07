import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const releaseManifestPaths = Object.freeze([
  "packages/design-contracts/package.json",
  "packages/react/package.json",
  "packages/react-native/package.json",
]);

function fixedVersion(versions, label) {
  if (!Array.isArray(versions) || versions.length !== releaseManifestPaths.length) {
    throw new Error(`${label} must contain all three fixed-train versions`);
  }
  for (const version of versions) {
    if (typeof version !== "string" || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
      throw new Error(`${label} must use stable package versions`);
    }
  }
  if (new Set(versions).size !== 1) throw new Error(`${label} fixed-train versions must agree`);
  return versions[0];
}

export function assessVersionIntent({ eventName, beforeVersions, afterVersions }) {
  const after = fixedVersion(afterVersions, "Current");
  // 사용자 결정(2026-10-07, RELEASE_GOVERNANCE.md): manifest의 의존성 수정도 push 경로
  // 필터에 걸린다. 파일 변경만으로 전량 검사를 실행하지 않고 실제 버전 상승을 비교한다.
  if (eventName === "workflow_dispatch") return { run: true, reason: "manual", after };
  if (eventName !== "push") throw new Error(`Unsupported CI event: ${eventName}`);
  const before = fixedVersion(beforeVersions, "Previous");
  const previous = before.split(".").map(BigInt);
  const current = after.split(".").map(BigInt);
  const changed = current.findIndex((value, index) => value !== previous[index]);
  if (changed < 0) return { run: false, reason: "version-unchanged", before, after };
  if (current[changed] < previous[changed]) throw new Error("Package version decreased; no automatic quality run");
  return { run: true, reason: "version-increased", before, after };
}

export function readVersionsAt(repositoryRoot, revision) {
  // Fixed paths + commit SHA avoid interpreting event data as Git options or shell code.
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(revision ?? "") || /^0+$/.test(revision)) {
    throw new Error("A real commit SHA is required to determine version intent");
  }
  return releaseManifestPaths.map((path) => {
    const source = execFileSync("git", ["show", `${revision}:${path}`], {
      cwd: repositoryRoot, encoding: "utf8", maxBuffer: 1024 * 1024, stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(source).version;
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const eventName = process.env.GITHUB_EVENT_NAME;
    const result = assessVersionIntent({
      eventName,
      beforeVersions: eventName === "push" ? readVersionsAt(repositoryRoot, process.env.VERSION_BASE_SHA) : undefined,
      afterVersions: readVersionsAt(repositoryRoot, process.env.GITHUB_SHA),
    });
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `run=${result.run}\n`);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
