import assert from "node:assert/strict";
import test from "node:test";
import { loadReleaseGovernance, validateReleaseGovernance } from "./check-release-governance.mjs";

const current = await loadReleaseGovernance();
test("current internal release gates are connected without claiming external consumer validation", () => {
  assert.deepEqual(validateReleaseGovernance(current), { scope: "internal-package-and-showcase", consumerDispatchGate: "not-implemented", pass: true });
});

for (const [name, mutate, expected] of [
  ["public API map gate is removed", (s) => { s.packages.root.scripts.check = s.packages.root.scripts.check.replace(" && pnpm api-map:check", ""); }, /check/],
  ["public API map gate hides drift in write mode", (s) => { s.packages.root.scripts["api-map:check"] += " --write"; }, /api-map:check/],
  ["usage guide gate is removed", (s) => { s.packages.root.scripts.check = s.packages.root.scripts.check.replace(" && pnpm usage:check", ""); }, /check/],
  ["usage guide gate hides drift in write mode", (s) => { s.packages.root.scripts["usage:check"] += " --write"; }, /usage:check/],
  ["Storybook navigation gate is removed", (s) => { s.packages.root.scripts.check = s.packages.root.scripts.check.replace(" && pnpm storybook:check", ""); }, /check/],
  ["Storybook gate registers new story ids instead of failing", (s) => { s.packages.root.scripts["storybook:check"] += " --write-ids"; }, /storybook:check/],
  ["release bypasses canonical CI", (s) => { s.packages.root.scripts["release:check"] = "node scripts/check-release-artifacts.mjs"; }, /release:check/],
  ["scenario registry checks are removed", (s) => { s.packages.root.scripts.check = s.packages.root.scripts.check.replace(" && pnpm workspace:check", ""); }, /check/],
  ["generated drift check becomes write mode", (s) => { s.packages.root.scripts["evidence:check"] += " --write"; }, /evidence:check/],
  ["contract projection gate disappears", (s) => { s.packages.contracts.scripts.check = "pnpm typecheck && pnpm test && pnpm build"; }, /contracts check/],
  ["renderer runtime tests become a no-op", (s) => { s.packages.native.scripts.test = "echo passed"; }, /Native proof runner/],
  ["browser proof runner skips tests", (s) => { s.packages.react.scripts["test:browser"] = "true"; }, /browser proof runner/],
  ["release verification is conditional", (s) => { s.releaseWorkflow = s.releaseWorkflow.replace("        run: pnpm release:check", "        if: false\n        run: pnpm release:check"); }, /must not skip/],
  ["release verification ignores failure", (s) => { s.releaseWorkflow = s.releaseWorkflow.replace("        run: pnpm release:check", "        continue-on-error: true\n        run: pnpm release:check"); }, /must not skip/],
  ["release workflow calls a weaker command", (s) => { s.releaseWorkflow = s.releaseWorkflow.replace("run: pnpm release:check", "run: pnpm typecheck"); }, /release:check/],
  ["ci:check drops the web showcase tests", (s) => { s.packages.root.scripts["ci:check"] = s.packages.root.scripts["ci:check"].replace(" && pnpm showcase:web:check", ""); }, /ci:check/],
  ["showcase workflow skips canonical check", (s) => { s.showcaseWorkflow = s.showcaseWorkflow.replace("run: pnpm ci:check", "run: pnpm showcase:web:build"); }, /ci:check/],
  ["showcase restores ordinary PR checks", (s) => { s.showcaseWorkflow = s.showcaseWorkflow.replace("  workflow_dispatch:", "  pull_request:\n    branches:\n      - main\n  workflow_dispatch:"); }, /CI events/],
  ["showcase removes version paths", (s) => { s.showcaseWorkflow = s.showcaseWorkflow.replace("      - packages/react/package.json\n", ""); }, /version paths/],
  ["showcase removes push path filtering", (s) => { s.showcaseWorkflow = s.showcaseWorkflow.replace("    paths:\n", "    paths-ignore:\n"); }, /only main and version paths/],
  ["visual broadens automatic branch checks", (s) => { s.visualWorkflow = s.visualWorkflow.replace("      - main\n", "      - main\n      - feature\n"); }, /only main and version paths/],
  ["visual restores ordinary PR checks", (s) => { s.visualWorkflow = s.visualWorkflow.replace("  workflow_dispatch:", "  pull_request:\n  workflow_dispatch:"); }, /CI events/],
  ["showcase bypasses version intent", (s) => { s.showcaseWorkflow = s.showcaseWorkflow.replace("    if: needs.intent.outputs.run == 'true'", "    if: true"); }, /require version intent/],
  ["visual detaches version intent", (s) => { s.visualWorkflow = s.visualWorkflow.replace("    needs: intent\n", ""); }, /require version intent/],
  ["version intent compares HEAD parent instead of push base", (s) => { s.showcaseWorkflow = s.showcaseWorkflow.replace("${{ github.event.before }}", "HEAD^"); }, /actual push base/],
  ["version intent hides failures", (s) => { s.visualWorkflow = s.visualWorkflow.replace("        run: node scripts/ci-version-intent.mjs", "        continue-on-error: true\n        run: node scripts/ci-version-intent.mjs"); }, /must not skip/],
  ["scenario registry is missing", (s) => { delete s.registries.native; }, /registry is required/],
  ["scenario proof is detached", (s) => { const file = s.registries.native.executions[0].proofFile; delete s.proofs[`native/${file}`]; }, /consume its scenario registry/],
  ["consumer dispatch is added without a validated consumer contract", (s) => { s.releaseWorkflow += "\n      - name: Dispatch consumer\n        run: gh api repos/owner/product/dispatches --field event_type=repository_dispatch\n"; }, /Consumer dispatch needs/],
]) {
  test(name, () => {
    const fixture = structuredClone(current);
    mutate(fixture);
    assert.throws(() => validateReleaseGovernance(fixture), expected);
  });
}
