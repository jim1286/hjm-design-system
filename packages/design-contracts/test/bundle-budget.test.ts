import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

// The production budget checker is intentionally a Node script rather than a
// published contract module. Vitest executes it as ESM while this directive
// documents that it has no generated TypeScript declaration.
// @ts-expect-error -- private build script with focused runtime tests.
import * as budgetChecker from "../scripts/check-bundle-budget.mjs";

const { getCheckedBudgets } = budgetChecker;

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
  });

  it("checks new exports without requiring a handwritten baseline", () => {
    const checked = getCheckedBudgets({ exports: {
      "./new-component": executable("./dist/new-component.js"),
      "./manifest.json": { default: "./docs/generated/showcase-manifest.json" },
    }});
    expect(checked.map((entry: {exportPath: string}) => entry.exportPath)).toEqual(["./new-component"]);
    expect(budgetChecker.checkBudget(checked[0], {modules: ["catalog.js"], rawBytes: 100, gzipBytes: 50})).toEqual(["metadata leak: catalog.js"]);
  });
});

describe("byte sizes are reported, not enforced (2026-10-06 policy)", () => {
  it("never fails or warns on bytes", () => {
    const { classifyBytes } = budgetChecker;
    expect(classifyBytes(1000, 1000)).toBe("pass");
    expect(classifyBytes(5000, 1000)).toBe("pass");
  });

  it("permits module growth but rejects metadata leaks", () => {
    const budget = { exportPath: "./x", maxModules: 2, maxRawBytes: 1000, maxGzipBytes: 500, forbiddenModules: ["catalog.js"] };
    const warnings: string[] = [];
    const failures = budgetChecker.checkBudget(
      budget,
      { modules: ["a.js", "b.js", "catalog.js"], rawBytes: 9050, gzipBytes: 5000 },
      warnings,
    );
    expect(failures).toEqual(["metadata leak: catalog.js"]);
    expect(warnings).toHaveLength(0);
  });
});
