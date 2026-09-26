import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { assertContractsPeerTrain } from "../../../scripts/contracts-peer-train.mjs";

/**
 * Actions are pinned to a full commit SHA with the version as a comment
 * (portfolio baseline ci.actionPinning, 2026-09-26). This package publishes to
 * npm with provenance, so a re-pointed tag would run in the publishing job.
 */
const pinned = (action: string, major: number) =>
  new RegExp(`${action.replace("/", "\\/")}@[0-9a-f]{40} # v${major}\\b`);

describe("GitHub Actions runtime contracts", () => {
  it("pins every third-party action to a full commit SHA", async () => {
    for (const file of ["showcase.yml", "version-packages.yml", "visual.yml"]) {
      const workflow = await readFile(
        new URL(`../../../.github/workflows/${file}`, import.meta.url),
        "utf8",
      );
      for (const [, ref] of workflow.matchAll(/uses:\s*[^\s@]+@(\S+)/g)) {
        expect(ref, file).toMatch(/^[0-9a-f]{40}$/);
      }
    }
  });

  it("keeps one canonical CI command for packages and both showcases", async () => {
    const workspacePackage = JSON.parse(
      await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
    ) as { scripts: Record<string, string> };

    // showcase-web의 vitest(`showcase:web:check`)는 2026-09-15에 이 명령에 들어왔다.
    // 그전에는 CI가 그 스위트를 한 번도 돌리지 않아 main에서 실패하는 테스트를 안은 채
    // 릴리스가 통과했다 (#21).
    expect(workspacePackage.scripts["ci:check"]).toBe(
      "pnpm check && pnpm showcase:native:check && pnpm showcase:web:check && pnpm showcase:web:build",
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
    expect(workflow).toMatch(pinned("actions/checkout", 7));
    expect(workflow).toMatch(pinned("pnpm/action-setup", 6));
    expect(workflow).toMatch(pinned("actions/setup-node", 7));
    expect(workflow).toMatch(/node-version:\s*24\b/);
    expect(workflow).toContain("pnpm ci:check");
    expect(workflow).toContain(
      "pnpm --filter @hjmds/react exec playwright install --with-deps chromium",
    );
    expect(workflow).toMatch(pinned("actions/upload-pages-artifact", 5));
    expect(workflow).toMatch(pinned("actions/deploy-pages", 5));
    // A PR push used to cancel main's verify and Pages deploy (one group, cancel-in-progress).
    expect(workflow).toContain("group: design-system-showcase-${{ github.ref }}");
    expect(workflow).toContain("cancel-in-progress: ${{ github.event_name == 'pull_request' }}");
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

  /**
   * RELEASE_GOVERNANCE.md requires the contracts peer range to be exactly one
   * minor train, authored ahead of the version PR. The checker only expressed
   * that for 0.x, so the first major train failed a correctly authored range.
   * These cases pin both halves of the rule so widening it once does not turn
   * into "any range near the current version is fine".
   */
  describe("contracts peer train", () => {
    const accepts = (range: string, fixed: string) => () =>
      assertContractsPeerTrain("@hjmds/react", range, fixed);

    it("accepts the current train and the authored next minor or major", () => {
      expect(accepts(">=0.10.0 <0.11.0", "0.10.0")).not.toThrow();
      expect(accepts(">=0.11.0 <0.12.0", "0.10.0")).not.toThrow();
      expect(accepts(">=1.0.0 <1.1.0", "0.10.0")).not.toThrow();
      expect(accepts(">=2.0.0 <2.1.0", "1.4.0")).not.toThrow();
    });

    it("rejects a range that skips, trails, or spans more than one train", () => {
      expect(accepts(">=1.1.0 <1.2.0", "0.10.0")).toThrow(/not aligned/);
      expect(accepts(">=2.0.0 <2.1.0", "0.10.0")).toThrow(/not aligned/);
      expect(accepts(">=0.9.0 <0.10.0", "0.10.0")).toThrow(/not aligned/);
      expect(accepts(">=0.10.0 <0.12.0", "0.10.0")).toThrow(/spans more than one/);
      expect(accepts("^0.10.0", "0.10.0")).toThrow(/one explicit minor train/);
    });
  });
});
