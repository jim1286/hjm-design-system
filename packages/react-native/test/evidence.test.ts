import { readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import * as actions from "../src/actions.js";
import * as dataDisplay from "../src/data-display.js";
import * as datePicker from "../src/date-picker.js";
import {
  reactNativeRendererEvidence,
  reactNativeRendererEvidenceSchemaVersion,
} from "../src/evidence.js";
import * as feedback from "../src/feedback.js";
import * as filePicker from "../src/file-picker.js";
import * as forms from "../src/forms.js";
import * as inputs from "../src/inputs.js";
import * as navigation from "../src/navigation.js";
import * as numberField from "../src/number-field.js";
import * as overlays from "../src/overlays.js";
import * as otpField from "../src/otp-field.js";
import * as passwordField from "../src/password-field.js";
import * as primitives from "../src/primitives.js";
import * as provider from "../src/provider.js";
import * as slider from "../src/slider.js";
import * as steps from "../src/steps.js";
import * as uploadItem from "../src/upload-item.js";

const publicModules: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  "./actions": actions,
  "./data-display": dataDisplay,
  "./date-picker": datePicker,
  "./feedback": feedback,
  "./file-picker": filePicker,
  "./forms": forms,
  "./inputs": inputs,
  "./navigation": navigation,
  "./number-field": numberField,
  "./overlays": overlays,
  "./otp-field": otpField,
  "./password-field": passwordField,
  "./primitives": primitives,
  "./provider": provider,
  "./slider": slider,
  "./steps": steps,
  "./upload-item": uploadItem,
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
    expect(componentIds).toHaveLength(61);
    expect(componentIds).toContain("combobox");
    expect(componentIds).toContain("load-more");
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
