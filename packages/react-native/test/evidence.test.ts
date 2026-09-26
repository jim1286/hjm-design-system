import * as agreement from "../src/agreement.js";
import * as calendar from "../src/calendar.js";
import * as providerButton from "../src/provider-button.js";
import * as authScreen from "../src/auth-screen.js";
import * as headingModule from "../src/heading.js";
import * as bottomInfo from "../src/bottom-info.js";
import * as collapsible from "../src/collapsible.js";
import * as asset from "../src/asset.js";
import * as tagsInput from "../src/tags-input.js";
import * as dateRange from "../src/date-range.js";
import * as mentions from "../src/mentions.js";
import * as transferList from "../src/transfer-list.js";
import * as toggleGroup from "../src/toggle-group.js";
import * as top from "../src/top.js";
import * as floatingActionButton from "../src/floating-action-button.js";
import * as carousel from "../src/carousel.js";
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
  "./carousel": carousel,
  "./floating-action-button": floatingActionButton,
  "./actions": actions,
  "./data-display": dataDisplay,
  "./date-picker": datePicker,
  "./calendar": calendar,
  "./agreement": agreement,
  "./top": top,
  "./heading": headingModule,
  "./toggle-group": toggleGroup,
  "./bottom-info": bottomInfo,
  "./collapsible": collapsible,
  "./asset": asset,
  "./tags-input": tagsInput,
  "./date-range": dateRange,
  "./mentions": mentions,
  "./transfer-list": transferList,
  "./provider-button": providerButton,
  "./auth-screen": authScreen,
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
    expect(componentIds).toHaveLength(79);
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
        // Cases may live in the shared fixture module the proof imports (1.5.0).
        const importedFixtures = await Promise.all(
          [...proofText.matchAll(/from "\.\/([\w.-]+)\.js"/g)].map(([, name]) =>
            readFile(fileURLToPath(new URL(`./${name}.tsx`, import.meta.url)), "utf8").catch(() => ""),
          ),
        );
        expect([proofText, ...importedFixtures].join("\n"), proof.file).toContain(`componentId: "${proof.caseId}"`);
      }
      for (const exportName of component.exportNames) {
        expect(publicModule, component.subpath).toHaveProperty(exportName);
      }
    }
  });
});
