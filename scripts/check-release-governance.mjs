import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requireEqual = (actual, expected, label) => {
  if (actual !== expected) throw new Error(`${label} must be ${JSON.stringify(expected)}`);
};

// This is a constrained audit of this repository's workflow layout, not a YAML
// parser or a claim that GitHub required checks are installed remotely.
function requiredStep(source, name, command) {
  const marker = `      - name: ${name}\n`;
  if (source.split(marker).length !== 2) throw new Error(`Workflow must contain exactly one ${name} step`);
  const start = source.indexOf(marker);
  const tail = source.slice(start + marker.length);
  const nextStep = tail.search(/^ {6}- /m);
  const step = nextStep < 0 ? tail : tail.slice(0, nextStep);
  if (/^ {8}(?:if|continue-on-error):/m.test(step)) throw new Error(`${name} must not skip or ignore failures`);
  const runs = [...step.matchAll(/^ {8}run: (.+)$/gm)];
  if (runs.length !== 1) throw new Error(`${name} must have one canonical run command`);
  requireEqual(runs[0][1], command, name);
  return start;
}

export function validateReleaseGovernance({ packages, releaseWorkflow, showcaseWorkflow, registries, proofs }) {
  const releaseCode = releaseWorkflow.split("\n").filter((line) => !/^\s*#/.test(line)).join("\n");
  if (/repository_dispatch/.test(releaseCode)) throw new Error("Consumer dispatch needs an explicit validated release contract before it can be claimed");
  const scripts = packages.root.scripts;
  requireEqual(scripts["ci:check"], "pnpm check && pnpm showcase:native:check && pnpm showcase:web:build", "ci:check");
  requireEqual(scripts["check"], "pnpm -r --filter './packages/**' run check && pnpm bundle:renderer:check && pnpm workspace:check && pnpm evidence:check && pnpm docs:check && pnpm governance:check", "check");
  requireEqual(scripts["release:check"], "pnpm ci:check && node scripts/check-release-artifacts.mjs", "release:check");
  requireEqual(scripts["governance:check"], "node --test scripts/check-release-governance.test.mjs && node scripts/check-release-governance.mjs", "governance:check");
  requireEqual(scripts["workspace:check"], "node scripts/check-workspace-sync.mjs", "workspace:check");
  requireEqual(scripts["evidence:check"], "node scripts/sync-renderer-evidence.mjs", "evidence:check");
  requireEqual(packages.contracts.scripts.check, "pnpm typecheck && pnpm test && pnpm build && pnpm contracts:check && pnpm bundle:check", "contracts check");
  requireEqual(packages.contracts.scripts["contracts:check"], "node scripts/sync-contract-artifacts.mjs", "contracts projection check");
  requireEqual(packages.react.scripts.check, "pnpm typecheck && pnpm test && pnpm build", "React check");
  requireEqual(packages.react.scripts.test, "pnpm test:ssr && pnpm test:browser", "React tests");
  requireEqual(packages.react.scripts["test:ssr"], "vitest run --config vitest.ssr.config.ts", "React SSR proof runner");
  requireEqual(packages.react.scripts["test:browser"], "vitest run --config vitest.browser.config.ts", "React browser proof runner");
  requireEqual(packages.native.scripts.check, "pnpm typecheck && pnpm test && pnpm bundle:check", "Native check");
  requireEqual(packages.native.scripts.test, "vitest run", "Native proof runner");

  const commitStep = requiredStep(releaseWorkflow, "Verify release commit", 'pnpm release:commit:check "$(git rev-parse HEAD^)"');
  const releaseStep = requiredStep(releaseWorkflow, "Verify packages, evidence, and release artifacts", "pnpm release:check");
  const publishStep = releaseWorkflow.indexOf("      - name: Publish packages\n");
  const tagStep = releaseWorkflow.indexOf("      - name: Tag release\n");
  if (!(commitStep < releaseStep && releaseStep < publishStep && publishStep < tagStep)) throw new Error("Release gates must precede publishing and tagging");
  if (/continue-on-error:\s*true/.test(releaseWorkflow)) throw new Error("Release job must not ignore failures");
  requiredStep(showcaseWorkflow, "Verify packages, evidence, and both showcases", "pnpm ci:check");

  for (const surface of ["react", "native"]) {
    const registry = registries[surface];
    if (registry?.schemaVersion !== 1 || !Array.isArray(registry.executions) || registry.executions.length === 0) throw new Error(`${surface} executed-scenario registry is required`);
    for (const execution of registry.executions) {
      if (execution.coverageMode !== "all-cases" || !execution.scenarios?.length) throw new Error(`${surface} registry must execute all cases`);
      const proof = proofs[`${surface}/${execution.proofFile}`];
      if (!proof?.includes("executed-scenarios.json")) throw new Error(`${surface} ${execution.proofFile} must consume its scenario registry`);
    }
  }
  return { scope: "internal-package-and-showcase", consumerDispatchGate: "not-implemented", pass: true };
}

export async function loadReleaseGovernance(repositoryRoot = root) {
  const text = (path) => readFile(resolve(repositoryRoot, path), "utf8");
  const json = async (path) => JSON.parse(await text(path));
  const packages = Object.fromEntries(await Promise.all(Object.entries({ root: "package.json", contracts: "packages/design-contracts/package.json", react: "packages/react/package.json", native: "packages/react-native/package.json" }).map(async ([key, path]) => [key, await json(path)])));
  const registries = { react: await json("packages/react/test/executed-scenarios.json"), native: await json("packages/react-native/test/executed-scenarios.json") };
  const proofs = {};
  for (const [surface, registry] of Object.entries(registries)) {
    const directory = surface === "react" ? "react" : "react-native";
    for (const execution of registry.executions ?? []) {
      if (!/^test\/[a-z0-9.-]+\.tsx$/.test(execution.proofFile ?? "")) throw new Error("Scenario proof must be a local test file");
      proofs[`${surface}/${execution.proofFile}`] = await text(`packages/${directory}/${execution.proofFile}`);
    }
  }
  return { packages, registries, proofs, releaseWorkflow: await text(".github/workflows/version-packages.yml"), showcaseWorkflow: await text(".github/workflows/showcase.yml") };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(validateReleaseGovernance(await loadReleaseGovernance()), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
