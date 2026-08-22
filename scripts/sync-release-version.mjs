import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const packagePaths = [
  "packages/design-contracts/package.json",
  "packages/react/package.json",
  "packages/react-native/package.json",
];

const packages = await Promise.all(
  packagePaths.map(async (path) => ({
    path,
    value: JSON.parse(await readFile(new URL(path, root), "utf8")),
  })),
);
const versions = new Set(packages.map(({ value }) => value.version));
if (versions.size !== 1) {
  throw new Error(
    `HJM fixed release packages must share one version:\n${packages
      .map(({ path, value }) => `${path}: ${value.version}`)
      .join("\n")}`,
  );
}

const [version] = versions;
if (typeof version !== "string" || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Invalid release version: ${String(version)}`);
}

const versionUrl = new URL("packages/design-contracts/src/version.ts", root);
const source = await readFile(versionUrl, "utf8");
const next = source.replace(
  /export const designSystemVersion = "[^"]+" as const;/,
  `export const designSystemVersion = "${version}" as const;`,
);
if (next === source && !source.includes(`"${version}"`)) {
  throw new Error("Could not locate designSystemVersion in contracts source");
}
await writeFile(versionUrl, next, "utf8");

for (const evidencePath of [
  "packages/react/src/evidence.ts",
  "packages/react-native/src/evidence.ts",
]) {
  const evidenceUrl = new URL(evidencePath, root);
  const evidenceSource = await readFile(evidenceUrl, "utf8");
  const nextEvidence = evidenceSource.replace(
    /packageVersion: "[^"]+",/,
    `packageVersion: "${version}",`,
  );
  if (nextEvidence === evidenceSource && !evidenceSource.includes(`packageVersion: "${version}"`)) {
    throw new Error(`Could not locate packageVersion in ${evidencePath}`);
  }
  await writeFile(evidenceUrl, nextEvidence, "utf8");
}
console.log(`Synchronized HJM fixed release version ${version}.`);
