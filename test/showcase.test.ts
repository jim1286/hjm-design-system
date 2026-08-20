import { describe, expect, it } from "vitest";

import { componentCatalog } from "../src/catalog.js";
import {
  assertShowcaseCoverage,
  createShowcaseCoverage,
  createShowcaseManifest,
  getRequiredShowcaseEvidence,
  getRequiredShowcaseScenarios,
  getRequiredShowcaseSurfaces,
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

  it("creates one stable story id for every catalog entry", () => {
    const manifest = createShowcaseManifest();
    expect(manifest).toHaveLength(componentCatalog.length);
    expect(new Set(manifest.map(({ storyId }) => storyId)).size).toBe(manifest.length);
    expect(manifest.find(({ component }) => component.name === "BottomNavigation")?.storyId).toBe(
      "navigation/bottom-navigation",
    );
  });

  it("keeps planned entries contract-only", () => {
    const planned = componentCatalog.find(({ status }) => status === "planned");
    expect(planned).toBeDefined();
    expect(getRequiredShowcaseScenarios(planned!)).toEqual(["contract"]);
  });

  it("requires behavior and adaptive evidence where applicable", () => {
    const select = componentCatalog.find(({ name }) => name === "Select");
    expect(select).toBeDefined();
    expect(getRequiredShowcaseScenarios(select!)).toEqual(
      expect.arrayContaining(["keyboard", "platform-parity", "accessibility", "large-text"]),
    );
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
