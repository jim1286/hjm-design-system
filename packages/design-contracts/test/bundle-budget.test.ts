import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

// The production budget checker is intentionally a Node script rather than a
// published contract module. Vitest executes it as ESM while this directive
// documents that it has no generated TypeScript declaration.
// @ts-expect-error -- private build script with focused runtime tests.
import * as budgetChecker from "../scripts/check-bundle-budget.mjs";

const { budgetExemptions, getBudgetCoverageFailures, getCheckedBudgets } = budgetChecker;

const executable = (target: string) => ({
  "react-native": target,
  import: target,
  default: target,
});

describe("contract bundle-budget coverage", () => {
  it("accounts for the current executable package surface, including metadata helpers", async () => {
    const packageJson = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8"),
    ) as { exports: Readonly<Record<string, unknown>> };
    const checkedBudgets = getCheckedBudgets(packageJson) as readonly {
      exportPath: string;
    }[];
    const budgetPaths = checkedBudgets.map(({ exportPath }) => exportPath);

    expect(budgetPaths).toEqual(expect.arrayContaining(["./evidence", "./showcase"]));
    expect(
      getBudgetCoverageFailures(packageJson.exports, budgetPaths, budgetExemptions),
    ).toEqual([]);
  });

  it("requires every executable export to have exactly one reviewed disposition", () => {
    const exports = {
      ".": executable("./dist/index.js"),
      "./evidence": executable("./dist/evidence.js"),
      "./manifest.json": { default: "./docs/generated/showcase-manifest.json" },
    };

    expect(getBudgetCoverageFailures(exports, ["."], {})).toEqual([
      "./evidence: missing explicit budget or justified exemption",
    ]);
    expect(
      getBudgetCoverageFailures(exports, ["."], {
        "./evidence": "Measured by an external runtime-specific budget.",
      }),
    ).toEqual([]);
    expect(
      getBudgetCoverageFailures(exports, [".", "./evidence"], {
        "./evidence": "No longer exclusive.",
      }),
    ).toEqual(["./evidence: cannot have both a budget and an exemption"]);
  });

  it("rejects stale, duplicate, and unjustified declarations", () => {
    const exports = { ".": executable("./dist/index.js") };

    expect(
      getBudgetCoverageFailures(exports, [".", ".", "./removed"], {
        "./removed-exemption": "Stale declaration.",
        ".": "   ",
      }),
    ).toEqual([
      ".: duplicate budget declarations",
      ".: cannot have both a budget and an exemption",
      "./removed: budget has no executable package export",
      "./removed-exemption: exemption has no executable package export",
      ".: exemption must include a justification",
    ]);
  });
});

describe("byte sizes are reported, not enforced (2026-10-06 policy)", () => {
  it("never fails or warns on bytes", () => {
    const { classifyBytes } = budgetChecker;
    expect(classifyBytes(1000, 1000)).toBe("pass");
    expect(classifyBytes(5000, 1000)).toBe("pass");
  });

  it("still fails module growth and metadata leaks immediately", () => {
    const budget = { exportPath: "./x", maxModules: 2, maxRawBytes: 1000, maxGzipBytes: 500, forbiddenModules: ["catalog.js"] };
    const warnings: string[] = [];
    const failures = budgetChecker.checkBudget(
      budget,
      { modules: ["a.js", "b.js", "catalog.js"], rawBytes: 9050, gzipBytes: 5000 },
      warnings,
    );
    expect(failures).toEqual(["3 modules > 2", "metadata leak: catalog.js"]);
    expect(warnings).toHaveLength(0);
  });
});
