import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

type ExportConditions = Readonly<{
  types: string;
  "react-native": string;
  import: string;
  default: string;
}>;

type JsonExportConditions = Readonly<{ default: string }>;

type ContractPackage = Readonly<{
  name: string;
  description: string;
  repository: Readonly<{ type: string; url: string; directory: string }>;
  sideEffects: boolean;
  files: readonly string[];
  dependencies?: Readonly<Record<string, string>>;
  exports: Readonly<Record<string, ExportConditions | JsonExportConditions>>;
  scripts: Readonly<Record<string, string>>;
}>;

const packageJsonUrl = new URL("../package.json", import.meta.url);
// 2026-10-18: this test used to pin the whole exports map as a literal list. The list drifted as soon as
// another change added entries (11 entries behind on 2026-10-18) and guarded the copy, not the rule. The rule
// is structural: every entry stays Metro-compatible and points at a real source, and the root stays index.js.
const staticExports = {
  "./manifest.json": "./docs/generated/showcase-manifest.json",
  "./renderer-evidence.json": "./docs/generated/renderer-evidence.json",
  "./consumer-policy.md": "./docs/consumer-policy.md",
} as const;

async function readPackageJson(): Promise<ContractPackage> {
  return JSON.parse(await readFile(packageJsonUrl, "utf8")) as ContractPackage;
}

describe("package boundaries", () => {
  it("names the renderer-neutral contract instead of implying a bundled UI kit", async () => {
    const packageJson = await readPackageJson();

    expect(packageJson.name).toBe("@hjmds/design-contracts");
    expect(packageJson.description).toMatch(/Renderer-neutral design contracts/);
    expect(packageJson.repository).toEqual({
      type: "git",
      url: "git+https://github.com/jim1286/hjm-design-system.git",
      directory: "packages/design-contracts",
    });
    expect(packageJson.sideEffects).toBe(false);
    expect(packageJson.files).toEqual(["dist", "docs", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md"]);
    expect(packageJson.dependencies).toBeUndefined();
  });

  it("publishes Metro-compatible granular entry points without changing the root", async () => {
    const packageJson = await readPackageJson();
    const exportPaths = Object.keys(packageJson.exports);
    expect(exportPaths[0]).toBe(".");
    expect(exportPaths).toContain("./components/form");
    expect(exportPaths).toContain("./showcase");

    for (const exportPath of exportPaths) {
      const definition = packageJson.exports[exportPath];
      expect(definition).toBeDefined();
      if (definition === undefined) continue;

      if (exportPath in staticExports) {
        expect(definition.default).toBe(staticExports[exportPath as keyof typeof staticExports]);
        continue;
      }

      const conditions = definition as ExportConditions;
      expect(conditions["react-native"]).toBe(conditions.import);
      expect(conditions.default).toBe(conditions.import);
      expect(conditions.types).toMatch(/^\.\/dist\/.*\.d\.ts$/);

      const sourcePath = conditions.import
        .replace(/^\.\/dist\//, "../src/")
        .replace(/\.js$/, ".ts");
      await expect(access(new URL(sourcePath, import.meta.url))).resolves.toBeUndefined();
    }

    expect((packageJson.exports["."] as ExportConditions).import).toBe("./dist/index.js");
  });

  it("does not let the component namespace expose internal barrels", () => {
    expect(import.meta.resolve("@hjmds/design-contracts/components/form")).toMatch(/dist\/form\.js$/);
    for (const internalName of [
      "catalog",
      "component-definitions",
      "evidence",
      "recipes",
      "responsive",
      "version",
    ]) {
      expect(
        () => import.meta.resolve(`@hjmds/design-contracts/components/${internalName}`),
      ).toThrow();
    }
  });

  it("runs graph budgets as part of the default verification path", async () => {
    const packageJson = await readPackageJson();

    expect(packageJson.scripts["bundle:check"]).toBe("node scripts/check-bundle-budget.mjs");
    expect(packageJson.scripts["contracts:sync"]).toContain("sync-contract-artifacts.mjs --write");
    expect(packageJson.scripts["contracts:check"]).toBe("node scripts/sync-contract-artifacts.mjs");
    expect(packageJson.scripts.check).toContain("pnpm contracts:check");
    expect(packageJson.scripts.check).toContain("pnpm bundle:check");
  });
});
