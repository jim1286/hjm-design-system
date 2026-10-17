import { readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { componentCatalog, getComponentSurfaceStatus, type ComponentCatalogEntry } from "@hjmds/design-contracts";
// This test checks real public exports, not native binary loading; installed linkage
// is covered by the documented iOS/Android showcase smoke.
vi.mock("react-native-reanimated", () => ({ useSharedValue: vi.fn() }));
vi.mock("@shopify/react-native-skia", () => ({}));
vi.mock("react-native-svg", () => ({}));

import {
  reactNativeRendererEvidence,
  reactNativeRendererEvidenceSchemaVersion,
} from "../src/evidence.js";

// Resolve a claim's subpath through package.json exports to its source module, so the test does not keep a
// second hand-written subpath → module map that every new entry had to extend (2026-10-18).
const sourceModules = import.meta.glob<Readonly<Record<string, unknown>>>("../src/*.{ts,tsx}");
const packageExports = (JSON.parse(await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8")) as {
  exports: Record<string, { import?: string }>;
}).exports;
async function publicModule(subpath: string): Promise<Readonly<Record<string, unknown>> | undefined> {
  const target = packageExports[subpath]?.import;
  if (!target) return undefined;
  const base = target.replace(/^\.\/dist\//, "../src/").replace(/\.js$/, "");
  const loader = sourceModules[`${base}.tsx`] ?? sourceModules[`${base}.ts`];
  return loader ? loader() : undefined;
}

describe("@hjmds/react-native renderer evidence", () => {
  it("is versioned, unique, and tied to the package release", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as { name: string; version: string };
    expect(reactNativeRendererEvidence).toMatchObject({
      schemaVersion: reactNativeRendererEvidenceSchemaVersion,
      packageName: packageJson.name,
      packageVersion: packageJson.version,
      surface: "native",
    });

    const componentIds = reactNativeRendererEvidence.components.map(
      ({ componentId }) => componentId,
    );
    // One claim per active Native row of the catalog (evidence.ts derives them); the count is not a second list.
    const activeNativeRows = (componentCatalog as readonly ComponentCatalogEntry[]).filter((entry) => ["stable", "beta"].includes(getComponentSurfaceStatus(entry, "native")));
    expect(componentIds).toHaveLength(activeNativeRows.length);
    expect(componentIds).toContain("thinking-orb");
    expect(componentIds).toContain("combobox");
    expect(componentIds).toContain("load-more");
    expect(new Set(componentIds).size).toBe(componentIds.length);
  });

  it("only claims real granular exports and executable proof for every scenario", async () => {
    for (const component of reactNativeRendererEvidence.components) {
      const module = await publicModule(component.subpath);
      expect(module, component.subpath).toBeDefined();
      expect(component.exportNames.length, component.componentId).toBeGreaterThan(0);
      expect(component.scenarios.length, component.componentId).toBeGreaterThan(0);
      expect(new Set(component.exportNames).size, component.componentId).toBe(
        component.exportNames.length,
      );
      expect(new Set(component.scenarios).size, component.componentId).toBe(
        component.scenarios.length,
      );
      expect(component.proofs.length, component.componentId).toBeGreaterThan(0);
      for (const scenario of component.scenarios) {
        expect(
          component.proofs.some((proof) => proof.scenarios.includes(scenario)),
          `${component.componentId}:${scenario}`,
        ).toBe(true);
      }
      for (const proof of component.proofs) {
        const proofText = await readFile(
          fileURLToPath(new URL(`../${proof.file}`, import.meta.url)),
          "utf8",
        );
        // Cases may live in the shared fixture module the proof imports (1.5.0).
        const importedFixtures = await Promise.all(
          [...proofText.matchAll(/from "\.\/([\w.-]+)\.js"/g)].map(([, name]) =>
            readFile(fileURLToPath(new URL(`./${name}.tsx`, import.meta.url)), "utf8").catch(() => ""),
          ),
        );
        expect([proofText, ...importedFixtures].join("\n"), proof.file).toContain(`componentId: "${proof.caseId}"`);
      }
      for (const exportName of component.exportNames) {
        expect(module, component.subpath).toHaveProperty(exportName);
      }
    }
  });
});
