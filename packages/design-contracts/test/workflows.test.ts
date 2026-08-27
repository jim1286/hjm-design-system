import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("GitHub Actions runtime contracts", () => {
  it("uses Node 24-native Pages actions without the insecure Node 20 escape hatch", async () => {
    const workflow = await readFile(
      new URL("../../../.github/workflows/showcase.yml", import.meta.url),
      "utf8",
    );

    expect(workflow).toContain("actions/checkout@v7");
    expect(workflow).toContain("pnpm/action-setup@v6");
    expect(workflow).toContain("actions/setup-node@v7");
    expect(workflow).toMatch(/node-version:\s*24\b/);
    expect(workflow).toContain("actions/upload-pages-artifact@v5");
    expect(workflow).toContain("actions/deploy-pages@v5");
    expect(workflow).not.toContain("ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION");
  });

  it("tags only after immutable private-consumer dispatch evidence succeeds", async () => {
    const [workflow, checker] = await Promise.all([
      readFile(
        new URL("../../../.github/workflows/version-packages.yml", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../../../scripts/check-consumer-release.mjs", import.meta.url),
        "utf8",
      ),
    ]);

    expect(workflow).toContain(
      "require('./packages/design-contracts/package.json').version",
    );
    expect(workflow).not.toContain("require('./package.json').version");
    expect(workflow).toContain("pnpm release:check");
    expect(workflow).toContain("scripts/check-consumer-release.mjs");
    expect(workflow).toContain("HJM_CONSUMER_SYNC_TOKEN");
    expect(workflow).not.toContain("workflow_dispatch");
    expect(workflow).not.toContain("HJM_RELEASE_TOKEN");
    expect(workflow).toContain("GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}");
    expect(workflow).not.toContain("HJM_CANONICAL_READ_TOKEN");
    expect(workflow).not.toContain("uses: jim1286/BurnTok/");
    expect(workflow).not.toContain("uses: jim1286/yajalal/");
    expect(checker).toContain('repository: "jim1286/BurnTok"');
    expect(checker).toContain('repository: "jim1286/yajalal"');
    const targetConfiguration = checker.slice(
      checker.indexOf("export const consumerReleaseTargets"),
      checker.indexOf("function parseArguments"),
    );
    expect(targetConfiguration).not.toContain("consumerRef");
    expect(checker).toContain("async function resolveConsumerRepository");
    expect(checker).toContain("async function resolveConsumerTargets");
    expect(checker).toContain("return targets.map((target) => ({ ...target, consumerRef }))");
    expect(checker).toContain("resolveConsumerTargets(client, consumerReleaseTargets)");
    expect(checker).toContain('artifactPrefix: "hjm-consumer-evidence-burntok-"');
    expect(checker).toContain('artifactPrefix: "hjm-consumer-evidence-yajalal-"');
    expect(checker).toContain('run.display_title === expectedTitle');
    expect(checker).toContain('run.head_sha === target.consumerRef');
    expect(checker).toContain('wrongRevision.head_sha');
    expect(checker).toContain("evidence.source?.revision, target.consumerRef");
    expect(checker).toContain('const ARTIFACT_TIMEOUT_MS = 45_000');
    expect(checker).toContain('artifact.expired !== false');
    expect(checker).toContain('assertExactInventoryStoryIds');
    expect(checker).toContain("validateEvidenceDocuments");
    expect(checker).toContain('"HEAD^{commit}"');
    expect(checker).toContain("does not match current local HEAD");
    expect(workflow.indexOf("pnpm release:check")).toBeLessThan(
      workflow.indexOf("scripts/check-consumer-release.mjs"),
    );
    expect(workflow.indexOf("scripts/check-consumer-release.mjs")).toBeLessThan(
      workflow.indexOf("git tag -a \"${TAG}\""),
    );
    expect(workflow).toContain("git diff --exit-code -- packages/design-contracts/dist");
    expect(workflow).toContain("github.event.before");
    expect(workflow).toContain("git rev-list --first-parent");
    expect(workflow).toContain("LATEST_RELEASE_COMMIT");
    expect(workflow).toContain("TAG_COMMIT=\"$(git rev-list -n 1 \"${TAG}\")\"");
    expect(workflow).toContain("git tag -a \"${TAG}\"");
  });

  it("separates authored Changeset PRs from generated version PRs", async () => {
    const workflow = await readFile(
      new URL("../../../.github/workflows/showcase.yml", import.meta.url),
      "utf8",
    );

    expect(workflow).toContain("github.event.pull_request.head.repo.full_name == github.repository");
    expect(workflow).toContain("startsWith(github.head_ref, 'changeset-release/')");
    expect(workflow).toContain("pnpm release:version-pr:check");
    expect(workflow).toContain("pnpm changeset:check");
  });

  it("joins non-default renderer evidence to structured executed-scenario registries", async () => {
    const checker = await readFile(
      new URL("../../../scripts/check-workspace-sync.mjs", import.meta.url),
      "utf8",
    );

    expect(checker).toContain("scenarioRegistry.executions");
    expect(checker).toContain("executionByProofFile");
    expect(checker).toContain("is not joined to its executed-scenario registry");
    expect(checker).toContain("has no registered ${scenario} execution");
  });
});
