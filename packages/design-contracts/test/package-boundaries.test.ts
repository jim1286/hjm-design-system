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
const publicComponentContractNames = [
  "alert-dialog",
  "bottom-navigation",
  "breadcrumb",
  "calendar",
  "card",
  "carousel",
  "collection",
  "command-palette",
  "content-state",
  "data-table",
  "date-picker",
  "description-list",
  "design-system-provider",
  "file-picker",
  "floating-action-button",
  "form",
  "icon",
  "image",
  "layout",
  "link",
  "load-more",
  "mentions",
  "number-field",
  "otp-field",
  "pagination",
  "password-field",
  "popover",
  "result",
  "sheet",
  "side-panel",
  "slider",
  "splitter",
  "statistic",
  "steps",
  "tag",
  "timeline",
  "toast",
  "tooltip",
  "tour",
  "transfer-list",
  "tree",
  "tree-select",
  "upload-item",
] as const;

async function readPackageJson(): Promise<ContractPackage> {
  return JSON.parse(await readFile(packageJsonUrl, "utf8")) as ContractPackage;
}

describe("package boundaries", () => {
  it("names the renderer-neutral contract instead of implying a bundled UI kit", async () => {
    const packageJson = await readPackageJson();

    expect(packageJson.name).toBe("@hjm/design-contracts");
    expect(packageJson.description).toMatch(/Renderer-neutral design contracts/);
    expect(packageJson.repository).toEqual({
      type: "git",
      url: "git+https://github.com/jim1286/hjm-design-system.git",
      directory: "packages/design-contracts",
    });
    expect(packageJson.sideEffects).toBe(false);
    expect(packageJson.files).toEqual(["dist", "docs", "README.md"]);
    expect(packageJson.dependencies).toBeUndefined();
  });

  it("publishes Metro-compatible granular entry points without changing the root", async () => {
    const packageJson = await readPackageJson();
    const expectedExports = [
      ".",
      "./tokens",
      "./foundations",
      "./colors",
      "./responsive",
      "./grid",
      "./recipes",
      "./recipes/base",
      "./recipes/all",
      "./behaviors",
      "./contracts",
      "./catalog",
      "./evidence",
      "./version",
      "./manifest.json",
      "./renderer-evidence.json",
      ...publicComponentContractNames.map((name) => `./components/${name}`),
      "./showcase",
    ] as const;

    expect(Object.keys(packageJson.exports)).toEqual(expectedExports);

    for (const exportPath of expectedExports) {
      const definition = packageJson.exports[exportPath];
      expect(definition).toBeDefined();
      if (definition === undefined) continue;

      if (exportPath === "./manifest.json" || exportPath === "./renderer-evidence.json") {
        expect(definition.default).toBe(
          exportPath === "./manifest.json"
            ? "./docs/generated/showcase-manifest.json"
            : "./docs/generated/renderer-evidence.json",
        );
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
    expect(import.meta.resolve("@hjm/design-contracts/components/form")).toMatch(/dist\/form\.js$/);
    for (const internalName of [
      "catalog",
      "component-definitions",
      "evidence",
      "recipes",
      "responsive",
      "version",
    ]) {
      expect(
        () => import.meta.resolve(`@hjm/design-contracts/components/${internalName}`),
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
