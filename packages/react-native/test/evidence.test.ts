import { readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import * as actions from "../src/actions.js";
import * as dataDisplay from "../src/data-display.js";
import {
  reactNativeRendererEvidence,
  reactNativeRendererEvidenceSchemaVersion,
} from "../src/evidence.js";
import * as feedback from "../src/feedback.js";
import * as forms from "../src/forms.js";
import * as inputs from "../src/inputs.js";
import * as navigation from "../src/navigation.js";
import * as overlays from "../src/overlays.js";
import * as primitives from "../src/primitives.js";
import * as provider from "../src/provider.js";

const publicModules: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  "./actions": actions,
  "./data-display": dataDisplay,
  "./feedback": feedback,
  "./forms": forms,
  "./inputs": inputs,
  "./navigation": navigation,
  "./overlays": overlays,
  "./primitives": primitives,
  "./provider": provider,
};

describe("@hjm/react-native renderer evidence", () => {
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
    expect(componentIds).toHaveLength(37);
    expect(componentIds).not.toContain("combobox");
    expect(new Set(componentIds).size).toBe(componentIds.length);
  });

  it("only claims real granular exports and executable proof for every scenario", async () => {
    for (const component of reactNativeRendererEvidence.components) {
      const publicModule = publicModules[component.subpath];
      expect(publicModule, component.subpath).toBeDefined();
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
        expect(proofText, proof.file).toContain(`componentId: "${proof.caseId}"`);
      }
      for (const exportName of component.exportNames) {
        expect(publicModule, component.subpath).toHaveProperty(exportName);
      }
    }
  });
});
