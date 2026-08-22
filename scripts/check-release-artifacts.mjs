import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const workspacePackage = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
if (
  workspacePackage.name !== "@hjm/design-system-workspace" ||
  workspacePackage.private !== true ||
  workspacePackage.version !== "0.0.0"
) {
  throw new Error("Root workspace must remain an unversioned private 0.0.0 orchestrator");
}
const packagePaths = [
  "packages/design-contracts/package.json",
  "packages/react/package.json",
  "packages/react-native/package.json",
];
const packages = await Promise.all(
  packagePaths.map(async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"))),
);
const versions = new Set(packages.map(({ version }) => version));
if (versions.size !== 1) throw new Error("HJM package versions are not aligned");
const [version] = versions;

const versionSource = await readFile(
  new URL("packages/design-contracts/src/version.ts", root),
  "utf8",
);
if (!versionSource.includes(`"${version}"`)) {
  throw new Error(`contracts source version does not match package version ${version}`);
}
const generatedManifest = JSON.parse(
  await readFile(
    new URL("packages/design-contracts/docs/generated/showcase-manifest.json", root),
    "utf8",
  ),
);
if (generatedManifest.designSystemVersion !== version) {
  throw new Error(`generated manifest does not match package version ${version}`);
}
const rendererEvidence = JSON.parse(
  await readFile(
    new URL("packages/design-contracts/docs/generated/renderer-evidence.json", root),
    "utf8",
  ),
);
if (rendererEvidence.designSystemVersion !== version) {
  throw new Error(`renderer evidence does not match package version ${version}`);
}
for (const surface of ["web", "native"]) {
  if (rendererEvidence.surfaces?.[surface]?.packageVersion !== version) {
    throw new Error(`${surface} renderer evidence does not match package version ${version}`);
  }
}

await Promise.all([
  "packages/design-contracts/dist/index.js",
  "packages/design-contracts/dist/index.d.ts",
  "packages/react/dist/index.js",
  "packages/react/dist/index.d.ts",
  "packages/react/dist/styles.css",
  "packages/react-native/dist/index.js",
  "packages/react-native/dist/index.d.ts",
  "packages/design-contracts/docs/generated/renderer-evidence.md",
].map((path) => access(new URL(path, root))));

console.log(`Verified release artifacts for HJM ${version}.`);
