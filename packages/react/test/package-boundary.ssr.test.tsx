import { access, readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("@hjmds/react package boundary", () => {
  it("exposes distinct family-level entry points and an explicit stylesheet", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as {
      exports: Record<string, unknown>;
      sideEffects: readonly string[];
    };
    // Read the advertised entry points, then verify their files and isolation instead of duplicating the manifest list.
    const executable = Object.entries(packageJson.exports).filter(([, definition]) => typeof definition === "object" && definition !== null);
    expect(executable.length).toBeGreaterThan(1);
    const familyTargets = await Promise.all(executable.map(async ([exportPath, entry]) => {
      const definition = entry as Record<string, string>;
      expect(definition.import).toMatch(/^\.\/dist\/.+\.js$/);
      expect(definition.types).toMatch(/^\.\/dist\/.+\.d\.ts$/);
      await access(new URL(`../${definition.import}`, import.meta.url));
      await access(new URL(`../${definition.types}`, import.meta.url));
      if (exportPath !== ".") expect(definition.import).not.toBe("./dist/index.js");
      return definition.import;
    }));
    expect(new Set(familyTargets).size).toBe(familyTargets.length);
    expect(packageJson.exports["./styles.css"]).toBe("./dist/styles.css");
    expect(packageJson.exports["./styles.layered.css"]).toBe("./dist/styles.layered.css");
    expect(packageJson.sideEffects).toEqual(["**/*.css"]);
  });
});
