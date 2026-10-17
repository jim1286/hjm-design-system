import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { assertContractsPeerTrain } from "../../../scripts/contracts-peer-train.mjs";

describe("GitHub Actions runtime contracts", () => {
  it("pins every third-party action to a full commit SHA", async () => {
    // Discover the current workflows; retired CI files are not required artifacts.
    const directory = new URL("../../../.github/workflows/", import.meta.url);
    for (const file of (await readdir(directory)).filter((name) => /\.ya?ml$/.test(name))) {
      const workflow = await readFile(
        new URL(`../../../.github/workflows/${file}`, import.meta.url),
        "utf8",
      );
      for (const [, ref] of workflow.matchAll(/uses:\s*[^\s@]+@(\S+)/g)) {
        expect(ref, file).toMatch(/^[0-9a-f]{40}$/);
      }
    }
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
