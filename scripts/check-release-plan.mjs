import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const expectedPackages = [
  "@hjm/design-contracts",
  "@hjm/react",
  "@hjm/react-native",
];
const expectedVersion = process.argv.find((value) => value.startsWith("--expected-version="))?.split("=")[1];
const expectedType = process.argv.find((value) => value.startsWith("--expected-type="))?.split("=")[1];
const matchAuthoredType = process.argv.includes("--match-authored-type");
const directory = await mkdtemp(join(tmpdir(), "hjm-release-plan-"));
const outputPath = join(directory, "status.json");

async function getHighestAuthoredType() {
  const rank = { patch: 0, minor: 1, major: 2 };
  let highest;
  const entries = await readdir(".changeset");
  for (const entry of entries) {
    if (entry === "README.md" || !entry.endsWith(".md")) continue;
    const source = await readFile(join(".changeset", entry), "utf8");
    const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/)?.[1] ?? "";
    for (const line of frontmatter.split("\n")) {
      const release = line.match(
        /^\s*["']?@hjm\/(?:design-contracts|react|react-native)["']?\s*:\s*(patch|minor|major)\s*$/,
      );
      const type = release?.[1];
      if (type !== undefined && (highest === undefined || rank[type] > rank[highest])) {
        highest = type;
      }
    }
  }
  return highest;
}

try {
  execFileSync("pnpm", ["exec", "changeset", "status", "--output", outputPath], {
    stdio: "inherit",
  });
  const status = JSON.parse(await readFile(outputPath, "utf8"));
  const releases = status.releases.filter(({ type }) => type !== "none");
  const actualNames = releases.map(({ name }) => name).sort();
  const expectedNames = [...expectedPackages].sort();
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    throw new Error(
      `Release plan must contain only the three fixed packages:\nexpected ${expectedNames.join(", ")}\nactual ${actualNames.join(", ") || "none"}`,
    );
  }
  const versions = new Set(releases.map(({ newVersion }) => newVersion));
  if (versions.size !== 1) {
    throw new Error("Fixed package release versions are not aligned");
  }
  const types = new Set(releases.map(({ type }) => type));
  if (types.size !== 1) {
    throw new Error(
      `Fixed package release types are not aligned: ${releases.map(({ name, type }) => `${name}:${type}`).join(", ")}`,
    );
  }
  const [version] = versions;
  const [type] = types;
  if (expectedVersion !== undefined && version !== expectedVersion) {
    throw new Error(`Expected release version ${expectedVersion}, received ${version}`);
  }
  if (expectedType !== undefined && type !== expectedType) {
    throw new Error(`Expected release type ${expectedType}, received ${type}`);
  }
  if (matchAuthoredType) {
    const authoredType = await getHighestAuthoredType();
    if (authoredType === undefined) {
      throw new Error("Release plan has no authored public-package Changeset");
    }
    if (type !== authoredType) {
      throw new Error(
        `Computed ${type} release exceeds the highest authored ${authoredType} Changeset; check peer ranges and fixed-package policy`,
      );
    }
  }
  console.log(`Verified fixed ${type} release plan ${version} for three public packages.`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
