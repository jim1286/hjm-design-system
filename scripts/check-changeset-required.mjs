import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const baseRevision = process.argv[2] || process.env.GITHUB_BASE_SHA;
if (!baseRevision) {
  throw new Error("Pass the pull request base revision to check-changeset-required.mjs");
}

const diff = execFileSync(
  "git",
  ["diff", "--name-status", `${baseRevision}...HEAD`],
  { encoding: "utf8" },
).trim();
const changes = diff.length === 0
  ? []
  : diff.split("\n").map((line) => {
      const [status = "", ...pathParts] = line.split("\t");
      return { status, path: pathParts.at(-1) ?? "" };
    });

const packageByDirectory = new Map([
  ["design-contracts", "@hjm/design-contracts"],
  ["react", "@hjm/react"],
  ["react-native", "@hjm/react-native"],
]);
const changedPackages = new Set();
for (const { path } of changes) {
  const match = path.match(
    /^packages\/(design-contracts|react|react-native)\/(?:src\/|package\.json$|README\.md$)/,
  );
  if (match?.[1]) changedPackages.add(packageByDirectory.get(match[1]));
}
const addedChangesets = changes.filter(
  ({ status, path }) =>
    status.startsWith("A") &&
    /^\.changeset\/(?!README\.md$)[^/]+\.md$/.test(path),
);

if (changedPackages.size > 0 && addedChangesets.length === 0) {
  throw new Error(
    "Public package source changed without a new Changeset. Run `pnpm changeset` and commit the generated .changeset/*.md file.",
  );
}

const scheduledPackages = new Set();
for (const { path } of addedChangesets) {
  const source = readFileSync(path, "utf8");
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/)?.[1] ?? "";
  for (const line of frontmatter.split("\n")) {
    const release = line.match(
      /^\s*["']?(@hjm\/(?:design-contracts|react|react-native))["']?\s*:\s*(patch|minor|major)\s*$/,
    );
    if (release?.[1]) scheduledPackages.add(release[1]);
  }
}

if (changedPackages.size > 0) {
  const missing = [...changedPackages].filter(
    (packageName) => packageName !== undefined && !scheduledPackages.has(packageName),
  );
  if (missing.length > 0) {
    throw new Error(
      `Changeset must schedule every changed public package; missing: ${missing.join(", ")}. Empty Changesets do not satisfy the release gate.`,
    );
  }
  execFileSync(
    process.execPath,
    ["scripts/check-release-plan.mjs", "--match-authored-type"],
    { stdio: "inherit" },
  );
}

console.log(
  changedPackages.size > 0
    ? `Verified releasable Changeset entries for: ${[...changedPackages].join(", ")}.`
    : "No public package source change requires a Changeset.",
);
