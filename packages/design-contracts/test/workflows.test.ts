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
    expect(workflow).not.toContain("HJM_CANONICAL_READ_TOKEN");
    expect(workflow).not.toContain("uses: jim1286/BurnTok/");
    expect(workflow).not.toContain("uses: jim1286/yajalal/");
    expect(checker).toContain('repository: "jim1286/BurnTok"');
    expect(checker).toContain('repository: "jim1286/yajalal"');
    expect(checker).toContain(
      'consumerRef: "58794d4bbd5597ab6d6101f8888307eea08f67ee"',
    );
    expect(checker).toContain(
      'consumerRef: "e4164cc5207e48faf4a164dea3ce9475e63c0242"',
    );
    expect(checker).toContain('artifactPrefix: "hjm-consumer-evidence-burntok-"');
    expect(checker).toContain('artifactPrefix: "hjm-consumer-evidence-yajalal-"');
    expect(checker).toContain('run.display_title === expectedTitle');
    expect(checker).toContain('run.head_sha === target.consumerRef');
    expect(checker).toContain('artifact.size_in_bytes <= 0');
    expect(checker).toContain("validateEvidenceDocuments");
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

  it("rejects non-default renderer evidence until executed results are structurally joined", async () => {
    const checker = await readFile(
      new URL("../../../scripts/check-workspace-sync.mjs", import.meta.url),
      "utf8",
    );

    expect(checker).toContain('claim.scenarios.filter((scenario) => scenario !== "default")');
    expect(checker).toContain("cannot claim non-default scenarios without a");
    expect(checker).toContain("structured executed-result registry");
  });
});
