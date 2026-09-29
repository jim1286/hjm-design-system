import { describe, expect, it } from "vitest";

import { behaviorRegistry } from "../src/behaviors.js";
import { componentCatalog } from "../src/catalog.js";
import {
  assertShowcaseCoverage,
  createShowcaseCoverage,
  createShowcaseManifest,
  getRequiredShowcaseEvidence,
  getRequiredShowcaseScenarios,
  getRequiredShowcaseSurfaces,
  getShowcaseEnvironmentInput,
  showcaseEnvironmentMatrix,
  showcaseScenarios,
  summarizeShowcaseMaturity,
} from "../src/showcase.js";

describe("showcase contract", () => {
  it("defines unique environment and scenario identifiers", () => {
    expect(new Set(showcaseEnvironmentMatrix.map(({ id }) => id)).size).toBe(
      showcaseEnvironmentMatrix.length,
    );
    expect(new Set(showcaseScenarios.map(({ id }) => id)).size).toBe(showcaseScenarios.length);
  });

  it("maps every fixture to the canonical Provider environment", () => {
    expect(
      showcaseEnvironmentMatrix.map((environment) =>
        getShowcaseEnvironmentInput(environment),
      ),
    ).toEqual([
      { theme: "light", direction: "ltr", textScale: 1, reducedMotion: false },
      { theme: "dark", direction: "ltr", textScale: 1, reducedMotion: false },
      { theme: "light", direction: "ltr", textScale: 2, reducedMotion: false },
      { theme: "light", direction: "rtl", textScale: 1, reducedMotion: false },
      { theme: "light", direction: "ltr", textScale: 1, reducedMotion: true },
    ]);
  });

  it("creates one stable story id for every catalog entry", () => {
    const manifest = createShowcaseManifest();
    expect(manifest).toHaveLength(componentCatalog.length);
    expect(new Set(manifest.map(({ storyId }) => storyId)).size).toBe(manifest.length);
    expect(manifest.find(({ component }) => component.name === "BottomNavigation")?.storyId).toBe(
      "navigation/bottom-navigation",
    );
    expect(manifest.find(({ component }) => component.name === "Select")?.surfaceMaturity).toEqual({
      web: "stable",
      native: "stable",
    });
    expect(manifest.find(({ component }) => component.name === "Combobox")?.surfaceMaturity).toEqual({
      web: "stable",
      native: "stable",
    });
  });

  it("keeps planned entries contract-only", () => {
    const planned = { name: "FutureExample", status: "planned", category: "utility", platform: "web" } as const;
    expect(getRequiredShowcaseScenarios(planned)).toEqual(["contract"]);
  });

  it("requires interaction evidence without a duplicate cross-platform gate", () => {
    const dialog = componentCatalog.find(({ name }) => name === "Dialog");
    expect(dialog).toBeDefined();
    expect(getRequiredShowcaseScenarios(dialog!)).toEqual(
      expect.arrayContaining(["keyboard", "accessibility", "large-text"]),
    );
  });

  it("requires renderer evidence after a surface is promoted", () => {
    const select = componentCatalog.find(({ name }) => name === "Select")!;
    const form = componentCatalog.find(({ name }) => name === "Form")!;

    expect(getRequiredShowcaseSurfaces(select)).toEqual(["contract", "web", "native"]);
    expect(getRequiredShowcaseScenarios(select)).not.toContain("platform-parity");
    expect(getRequiredShowcaseScenarios(select)).toContain("keyboard");
    expect(getRequiredShowcaseSurfaces(form)).toEqual(["contract", "web", "native"]);
    expect(getRequiredShowcaseScenarios(form)).toEqual(
      expect.arrayContaining(["default", "dark", "large-text", "accessibility"]),
    );
  });

  it("does not require visible long-copy layout from media, count, or hidden-text primitives", () => {
    for (const name of ["Avatar", "Asset", "CounterBadge", "Image", "VisuallyHidden"]) {
      const entry = componentCatalog.find((item) => item.name === name)!;
      for (const evidence of getRequiredShowcaseEvidence(entry)) {
        if (evidence.surface === "contract") continue;
        expect(evidence.scenarios, name).not.toContain("long-copy");
      }
    }
  });

  it("assigns keyboard and Native action evidence to their owning surfaces", () => {
    for (const entry of componentCatalog) {
      if (!("behavior" in entry)) continue;
      const behavior = behaviorRegistry[entry.behavior];
      const evidence = getRequiredShowcaseEvidence(entry);
      const web = evidence.find(({ surface }) => surface === "web");
      const native = evidence.find(({ surface }) => surface === "native");
      if (web) expect(web.scenarios.includes("keyboard"), `${entry.name} Web`).toBe(behavior.web.keyboard.length > 0);
      if (native) {
        expect(native.scenarios.includes("native-actions"), `${entry.name} Native`).toBe(behavior.native.actions.length > 0);
        expect(native.scenarios).not.toContain("keyboard");
      }
      if (web && behavior.web.keyboard.length > 0) expect(getRequiredShowcaseScenarios(entry)).toContain("keyboard");
      if (native && behavior.native.actions.length > 0) expect(getRequiredShowcaseScenarios(entry)).toContain("native-actions");
    }
  });

  it("summarizes every catalog entry exactly once", () => {
    const summary = summarizeShowcaseMaturity();
    expect(summary.stable + summary.beta + summary.planned + summary.deprecated).toBe(
      componentCatalog.length,
    );
  });

  it("requires renderer evidence only on supported surfaces", () => {
    expect(getRequiredShowcaseSurfaces(componentCatalog.find(({ name }) => name === "Button")!)).toEqual([
      "contract",
      "web",
      "native",
    ]);
    expect(getRequiredShowcaseSurfaces(componentCatalog.find(({ name }) => name === "Tooltip")!)).toEqual([
      "contract",
      "web",
    ]);
    expect(getRequiredShowcaseSurfaces(componentCatalog.find(({ name }) => name === "TopBar")!)).toEqual([
      "contract",
      "web",
      "native",
    ]);
    expect(getRequiredShowcaseSurfaces(componentCatalog.find(({ name }) => name === "Stack")!)).toEqual([
      "contract",
      "web",
      "native",
    ]);
  });

  it("keeps evidence requirements paired to each renderer surface", () => {
    const button = componentCatalog.find(({ name }) => name === "Button")!;
    expect(getRequiredShowcaseEvidence(button)).toEqual([
      { surface: "contract", scenarios: ["contract"] },
      {
        surface: "web",
        scenarios: [
          "default",
          "dark",
          "long-copy",
          "large-text",
          "rtl",
          "reduced-motion",
          "accessibility",
        ],
      },
      {
        surface: "native",
        scenarios: [
          "default",
          "dark",
          "long-copy",
          "large-text",
          "rtl",
          "reduced-motion",
          "accessibility",
        ],
      },
    ]);
  });

  it("does not combine evidence from different surfaces into a false pass", () => {
    const buttonManifest = createShowcaseManifest().filter(
      ({ component }) => component.name === "Button",
    );
    const storyId = buttonManifest[0]!.storyId;
    const coverage = createShowcaseCoverage(
      [
        { storyId, surface: "contract", scenarios: ["contract"] },
        { storyId, surface: "web", scenarios: ["default"] },
        { storyId, surface: "native", scenarios: ["dark"] },
      ],
      buttonManifest,
    )[0]!;

    expect(coverage.complete).toBe(false);
    expect(coverage.missingEvidence).toEqual(
      expect.arrayContaining([
        { surface: "web", scenario: "dark" },
        { surface: "native", scenario: "default" },
      ]),
    );
  });

  it("reports missing surfaces and scenarios before accepting evidence", () => {
    const button = createShowcaseManifest().filter(({ component }) => component.name === "Button");
    const evidence = [{ storyId: button[0]!.storyId, surface: "contract" as const, scenarios: ["contract" as const] }];
    expect(createShowcaseCoverage(evidence, button)[0]).toMatchObject({
      missingSurfaces: ["web", "native"],
      complete: false,
    });
    expect(() => assertShowcaseCoverage(evidence, button)).toThrow(/Showcase evidence is incomplete/);
  });
});
