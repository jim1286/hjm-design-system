import * as popover from "../src/popover.js";
import * as anchor from "../src/anchor.js";
import * as pagination from "../src/pagination.js";
import * as breadcrumb from "../src/breadcrumb.js";
import * as calendar from "../src/calendar.js";
import * as floatingActionButton from "../src/floating-action-button.js";
import * as topBar from "../src/top-bar.js";
import * as bottomCta from "../src/bottom-cta.js";
import * as carousel from "../src/carousel.js";
import { readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import * as actions from "../src/actions.js";
import * as datePicker from "../src/date-picker.js";
import * as display from "../src/display-public.js";
import {
  reactRendererEvidence,
  reactRendererEvidenceSchemaVersion,
} from "../src/evidence.js";
import * as feedback from "../src/feedback.js";
import * as filePicker from "../src/file-picker.js";
import * as forms from "../src/forms-public.js";
import * as layout from "../src/layout.js";
import * as navigation from "../src/navigation-public.js";
import * as numberField from "../src/number-field.js";
import * as overlays from "../src/overlays.js";
import * as otpField from "../src/otp-field.js";
import * as passwordField from "../src/password-field.js";
import * as provider from "../src/provider.js";
import * as selection from "../src/selection.js";
import * as slider from "../src/slider.js";
import * as steps from "../src/steps.js";
import * as sidePanel from "../src/side-panel.js";
import * as splitter from "../src/splitter.js";
import * as tour from "../src/tour.js";
import * as tree from "../src/tree.js";
import * as transferList from "../src/transfer-list.js";
import * as mentions from "../src/mentions.js";
import * as commandPalette from "../src/command-palette.js";
import * as agreement from "../src/agreement.js";
import * as top from "../src/top.js";
import * as headingModule from "../src/heading.js";
import * as textFormats from "../src/text-formats.js";
import * as toggleGroup from "../src/toggle-group.js";
import * as tagsInput from "../src/tags-input.js";
import * as skipNav from "../src/skip-nav.js";
import * as bottomInfo from "../src/bottom-info.js";
import * as sidebar from "../src/sidebar.js";
import * as dateRange from "../src/date-range.js";
import * as providerButton from "../src/provider-button.js";
import * as dataTable from "../src/data-table.js";
import * as collapsible from "../src/collapsible.js";
import * as contextMenu from "../src/context-menu.js";
import * as menubar from "../src/menubar.js";
import * as asset from "../src/asset.js";
import * as toast from "../src/toast.js";
import * as uploadItem from "../src/upload-item.js";

const publicModules: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  "./top-bar": topBar,
  "./bottom-cta": bottomCta,
  "./carousel": carousel,
  "./floating-action-button": floatingActionButton,
  "./actions": actions,
  "./date-picker": datePicker,
  "./calendar": calendar,
  "./anchor": anchor,
  "./side-panel": sidePanel,
  "./splitter": splitter,
  "./tour": tour,
  "./tree": tree,
  "./transfer-list": transferList,
  "./mentions": mentions,
  "./command-palette": commandPalette,
  "./agreement": agreement,
  "./top": top,
  "./heading": headingModule,
  "./text-formats": textFormats,
  "./toggle-group": toggleGroup,
  "./tags-input": tagsInput,
  "./skip-nav": skipNav,
  "./bottom-info": bottomInfo,
  "./sidebar": sidebar,
  "./date-range": dateRange,
  "./provider-button": providerButton,
  "./data-table": dataTable,
  "./collapsible": collapsible,
  "./context-menu": contextMenu,
  "./menubar": menubar,
  "./asset": asset,
  "./popover": popover,
  "./pagination": pagination,
  "./breadcrumb": breadcrumb,
  "./display": display,
  "./feedback": feedback,
  "./file-picker": filePicker,
  "./forms": forms,
  "./layout": layout,
  "./navigation": navigation,
  "./number-field": numberField,
  "./overlays": overlays,
  "./otp-field": otpField,
  "./password-field": passwordField,
  "./provider": provider,
  "./selection": selection,
  "./slider": slider,
  "./steps": steps,
  "./toast": toast,
  "./upload-item": uploadItem,
};

describe("@hjmds/react renderer evidence", () => {
  it("is versioned, unique, and tied to the package release", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as { name: string; version: string };
    expect(reactRendererEvidence).toMatchObject({
      schemaVersion: reactRendererEvidenceSchemaVersion,
      packageName: packageJson.name,
      packageVersion: packageJson.version,
      surface: "web",
    });

    const componentIds = reactRendererEvidence.components.map(({ componentId }) => componentId);
    expect(componentIds).toHaveLength(95);
    expect(new Set(componentIds).size).toBe(componentIds.length);
  });

  it("only claims real granular exports and executable proof for every scenario", async () => {
    for (const component of reactRendererEvidence.components) {
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
