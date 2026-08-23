import { readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("@hjm/react package boundary", () => {
  it("exposes distinct family-level entry points and an explicit stylesheet", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as {
      exports: Record<string, unknown>;
      sideEffects: readonly string[];
    };
    const executableExportPaths = [
      ".",
      "./provider",
      "./layout",
      "./actions",
      "./forms",
      "./password-field",
      "./otp-field",
      "./number-field",
      "./slider",
      "./selection",
      "./navigation",
      "./display",
      "./overlays",
      "./feedback",
      "./toast",
      "./evidence",
    ];

    expect(Object.keys(packageJson.exports)).toEqual([
      ...executableExportPaths,
      "./styles.css",
    ]);
    const familyTargets = executableExportPaths.slice(1).map((exportPath) => {
      const definition = packageJson.exports[exportPath] as Record<string, string>;
      expect(definition.import).toMatch(/^\.\/dist\/.+\.js$/);
      expect(definition.import).not.toBe("./dist/index.js");
      return definition.import;
    });
    expect(new Set(familyTargets).size).toBe(familyTargets.length);
    expect(packageJson.exports["./styles.css"]).toBe("./dist/styles.css");
    expect(packageJson.sideEffects).toEqual(["**/*.css"]);
  });
});
