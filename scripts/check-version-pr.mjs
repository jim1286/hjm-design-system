import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const baseRevision = process.argv[2] || process.env.GITHUB_BASE_SHA;
if (!baseRevision) {
  throw new Error("Pass the pull request base revision to check-version-pr.mjs");
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

function incrementVersion(version, type) {
  const [major, minor, patch] = version;
  if (type === "major") return [major + 1, 0, 0];
  if (type === "minor") return [major, minor + 1, 0];
  return [major, minor, patch + 1];
}

function parseChangesetReleases(source) {
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/)?.[1] ?? "";
  return frontmatter
    .split("\n")
    .map((line) => {
      const release = line.match(
        /^\s*["']?(@hjm\/(?:design-contracts|react|react-native))["']?\s*:\s*(patch|minor|major)\s*$/,
      );
      return release ? { packageName: release[1], type: release[2] } : undefined;
    })
    .filter(Boolean);
}

const rawDiff = git("diff", "--name-status", `${baseRevision}...HEAD`);
const changes = rawDiff.length === 0
  ? []
  : rawDiff.split("\n").map((line) => {
      const [status = "", ...paths] = line.split("\t");
      return { status, path: paths.at(-1) ?? "" };
    });

const deletedChangesets = changes.filter(
  ({ status, path }) =>
    status.startsWith("D") && /^\.changeset\/(?!README\.md$)[^/]+\.md$/.test(path),
);
const addedChangesets = changes.filter(
  ({ status, path }) =>
    status.startsWith("A") && /^\.changeset\/(?!README\.md$)[^/]+\.md$/.test(path),
);
if (deletedChangesets.length === 0) {
  throw new Error("Generated version PR must consume at least one non-empty Changeset");
}
if (addedChangesets.length > 0) {
  throw new Error("Generated version PR must not add authored Changesets");
}

const scheduledPackages = new Set();
const authoredTypes = [];
for (const { path } of deletedChangesets) {
  const source = git("show", `${baseRevision}:${path}`);
  for (const { packageName, type } of parseChangesetReleases(source)) {
    scheduledPackages.add(packageName);
    authoredTypes.push(type);
  }
}
if (scheduledPackages.size === 0) {
  throw new Error("Deleted Changesets do not schedule an HJM public package");
}

const allowedPath = (path) =>
  path === "pnpm-lock.yaml" ||
  /^\.changeset\/(?!README\.md$)[^/]+\.md$/.test(path) ||
  publicPackagePaths.includes(path) ||
  path === "packages/design-contracts/src/version.ts" ||
  path === "packages/react/src/evidence.ts" ||
  path === "packages/react-native/src/evidence.ts" ||
  /^packages\/(?:design-contracts|react|react-native)\/dist\//.test(path) ||
  /^packages\/design-contracts\/docs\/generated\//.test(path);

const unexpectedPaths = changes.map(({ path }) => path).filter((path) => !allowedPath(path));
if (unexpectedPaths.length > 0) {
  throw new Error(
    `Generated version PR contains non-release source changes: ${unexpectedPaths.join(", ")}`,
  );
}

for (const packagePath of publicPackagePaths) {
  if (!changes.some(({ path }) => path === packagePath)) {
    throw new Error(`Generated version PR did not update fixed package manifest ${packagePath}`);
  }
}

const currentPackages = await Promise.all(
  publicPackagePaths.map(async (path) => JSON.parse(await readFile(path, "utf8"))),
);
const previousPackages = publicPackagePaths.map((path) =>
  JSON.parse(git("show", `${baseRevision}:${path}`)),
);
const currentVersions = new Set(currentPackages.map(({ version }) => version));
const previousVersions = new Set(previousPackages.map(({ version }) => version));
if (currentVersions.size !== 1 || previousVersions.size !== 1) {
  throw new Error("Fixed package versions must be aligned before and after a version PR");
}
const [currentVersion] = currentVersions;
const [previousVersion] = previousVersions;
const typeRank = { patch: 0, minor: 1, major: 2 };
const authoredType = authoredTypes.reduce(
  (highest, type) => typeRank[type] > typeRank[highest] ? type : highest,
  "patch",
);
const expectedVersion = incrementVersion(
  parseVersion(previousVersion, "Base version"),
  authoredType,
).join(".");
parseVersion(currentVersion, "Current version");
if (currentVersion !== expectedVersion) {
  throw new Error(
    `Version PR must apply the highest authored ${authoredType} bump ${previousVersion} -> ${expectedVersion}; received ${currentVersion}`,
  );
}

const contractsVersion = await readFile("packages/design-contracts/src/version.ts", "utf8");
const reactEvidence = await readFile("packages/react/src/evidence.ts", "utf8");
const nativeEvidence = await readFile("packages/react-native/src/evidence.ts", "utf8");
if (!contractsVersion.includes(`designSystemVersion = "${currentVersion}"`)) {
  throw new Error("Contracts source version is not synchronized with the version PR");
}
for (const [label, source] of [["React", reactEvidence], ["React Native", nativeEvidence]]) {
  if (!source.includes(`packageVersion: "${currentVersion}"`)) {
    throw new Error(`${label} evidence version is not synchronized with the version PR`);
  }
}

console.log(
  `Verified generated fixed-package version PR ${previousVersion} -> ${currentVersion} from ${deletedChangesets.length} consumed Changeset(s).`,
);
