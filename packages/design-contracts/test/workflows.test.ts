import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("GitHub Actions runtime contracts", () => {
  it("keeps one canonical CI command for packages and both showcases", async () => {
    const workspacePackage = JSON.parse(
      await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
    ) as { scripts: Record<string, string> };

    expect(workspacePackage.scripts["ci:check"]).toBe(
      "pnpm check && pnpm showcase:native:check && pnpm showcase:web:build",
    );
    expect(workspacePackage.scripts["release:check"]).toContain("pnpm ci:check");
  });

  it("gates pull requests and deploys the verified Storybook from main", async () => {
    const workflow = await readFile(
      new URL("../../../.github/workflows/showcase.yml", import.meta.url),
      "utf8",
    );

    expect(workflow).toMatch(/on:\n\s+push:\n\s+branches:\n\s+- main\n/);
    expect(workflow).toMatch(/\n\s+pull_request:\n\s+branches:\n\s+- main\n/);
    expect(workflow).toContain("actions/checkout@v7");
    expect(workflow).toContain("pnpm/action-setup@v6");
    expect(workflow).toContain("actions/setup-node@v7");
    expect(workflow).toMatch(/node-version:\s*24\b/);
    expect(workflow).toContain("pnpm ci:check");
    expect(workflow).toContain(
      "pnpm --filter @hjmds/react exec playwright install --with-deps chromium",
    );
    expect(workflow).toContain("actions/upload-pages-artifact@v5");
    expect(workflow).toContain("actions/deploy-pages@v5");
    expect(workflow).not.toContain("changeset:check");
  });

  it("publishes packages only when the release workflow is dispatched", async () => {
    const workflow = await readFile(
      new URL("../../../.github/workflows/version-packages.yml", import.meta.url),
      "utf8",
    );

    expect(workflow).toMatch(/on:\n\s+workflow_dispatch:\s*\n/);
    expect(workflow).not.toMatch(/\n\s+push:/);
    expect(workflow).toContain("github.ref == 'refs/heads/main'");
    expect(workflow).toContain('pnpm release:commit:check "$(git rev-parse HEAD^)"');
    expect(workflow).toContain("pnpm release:check");
    expect(workflow).toContain(
      "pnpm --filter @hjmds/react exec playwright install --with-deps chromium",
    );
    expect(workflow).toContain("publish --access public --no-git-checks --provenance");
    expect(workflow).toContain('git tag -a "${TAG}"');
    expect(workflow).not.toContain("check-consumer-release");
  });

  it("verifies a generated release commit against the authored Changeset plan", async () => {
    const checker = await readFile(
      new URL("../../../scripts/check-release-commit.mjs", import.meta.url),
      "utf8",
    );

    expect(checker).toContain("Release commit must consume");
    expect(checker).toContain("Release commit contains");
    expect(checker).toContain("Release commit must apply");
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
