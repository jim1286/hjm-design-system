import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const baseRevision = process.argv[2] || process.env.GITHUB_BASE_SHA;
if (!baseRevision) {
  throw new Error("Pass the release commit base revision to check-release-commit.mjs");
}

const publicPackagePaths = [
  "packages/design-contracts/package.json",
  "packages/react/package.json",
  "packages/react-native/package.json",
];

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function parseVersion(value, label) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) throw new Error(`${label} must be a stable SemVer, received ${value}`);
  return match.slice(1).map(Number);
}

// Owner request, 2026-10-12: validate the publishable versions, not commit shape.
// Documentation or fixes after version preparation must not block a valid release.
const currentPackages = await Promise.all(
  publicPackagePaths.map(async (path) => JSON.parse(await readFile(path, "utf8"))),
);
const previousPackages = publicPackagePaths.map((path) =>
  JSON.parse(git("show", `${baseRevision}:${path}`)),
);
const currentVersions = new Set(currentPackages.map(({ version }) => version));
const previousVersions = new Set(previousPackages.map(({ version }) => version));
if (currentVersions.size !== 1 || previousVersions.size !== 1) {
  throw new Error("Fixed package versions must be aligned before and after a release commit");
}
const [currentVersion] = currentVersions;
const [previousVersion] = previousVersions;
// 2026-10-02 user decision: release version is chosen by the maintainer.
// Verify synchronized stable identifiers here; do not infer major/minor from Changeset labels.
parseVersion(previousVersion, "Base version");
parseVersion(currentVersion, "Current version");

const contractsVersion = await readFile("packages/design-contracts/src/version.ts", "utf8");
const reactEvidence = await readFile("packages/react/src/evidence.ts", "utf8");
const nativeEvidence = await readFile("packages/react-native/src/evidence.ts", "utf8");
if (!contractsVersion.includes(`designSystemVersion = "${currentVersion}"`)) {
  throw new Error("Contracts source version is not synchronized with the release commit");
}
for (const [label, source] of [["React", reactEvidence], ["React Native", nativeEvidence]]) {
  if (!source.includes(`packageVersion: "${currentVersion}"`)) {
    throw new Error(`${label} evidence version is not synchronized with the release commit`);
  }
}

console.log(
  `Verified generated fixed-package release commit ${previousVersion} -> ${currentVersion} (commit layout is unrestricted).`,
);
