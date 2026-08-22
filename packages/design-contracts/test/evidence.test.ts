import { describe, expect, it } from "vitest";

import {
  assertShowcaseStoryIds,
  compareShowcaseStoryIds,
  createDesignSystemEvidence,
  createDesignSystemEvidenceCoverage,
  defineDesignSystemEvidence,
  designSystemEvidenceSchemaVersion,
  getShowcaseStoryIdsForSurface,
  toShowcaseEvidenceEntries,
  type DesignSystemEvidenceManifest,
} from "../src/evidence.js";
import { showcaseManifest } from "../src/showcase.js";
import { designSystemVersion } from "../src/version.js";

describe("design-system evidence", () => {
  it("derives product Storybook inventory from the canonical showcase manifest", () => {
    const web = getShowcaseStoryIdsForSurface("web");
    const native = getShowcaseStoryIdsForSurface("native");

    expect(web.length).toBeGreaterThan(0);
    expect(native.length).toBeGreaterThan(0);
    expect(new Set(web).size).toBe(web.length);
    expect(new Set(native).size).toBe(native.length);
    expect(compareShowcaseStoryIds("web", web)).toMatchObject({ complete: true });
    expect(() => assertShowcaseStoryIds("native", native)).not.toThrow();
  });

  it("reports missing, unexpected, and duplicate product story ids", () => {
    const [first, ...remaining] = getShowcaseStoryIdsForSurface("web");
    expect(first).toBeDefined();

    const comparison = compareShowcaseStoryIds("web", [
      ...remaining,
      remaining[0]!,
      "utility/not-in-the-catalog",
    ]);

    expect(comparison.complete).toBe(false);
    expect(comparison.missing).toContain(first);
    expect(comparison.unexpected).toEqual(["utility/not-in-the-catalog"]);
    expect(comparison.duplicates).toEqual([remaining[0]]);
    expect(() => assertShowcaseStoryIds("web", comparison.actual)).toThrow(
      /does not match the design contract manifest/,
    );
  });

  it("creates a versioned, surface-owned evidence artifact", () => {
    const storyId = getShowcaseStoryIdsForSurface("web")[0]!;
    const evidence = createDesignSystemEvidence(
      {
        id: "product-web",
        product: "Product Web",
        surface: "web",
        kind: "storybook",
        revision: "abc123",
      },
      [{ storyId, scenarios: ["default"], storybookStoryId: "product--default" }],
    );

    expect(evidence.schemaVersion).toBe(designSystemEvidenceSchemaVersion);
    expect(toShowcaseEvidenceEntries([evidence])).toEqual([
      { storyId, surface: "web", scenarios: ["default"] },
    ]);
    expect(createDesignSystemEvidenceCoverage([evidence])).toHaveLength(91);
  });

  it("rejects stale, duplicate, empty, and surface-incompatible evidence", () => {
    const storyId = getShowcaseStoryIdsForSurface("web")[0]!;
    const base: DesignSystemEvidenceManifest = {
      schemaVersion: 1,
      designSystemVersion,
      source: { id: "web", product: "Web", surface: "web", kind: "storybook" },
      entries: [{ storyId, scenarios: ["default"] }],
    };

    expect(() => defineDesignSystemEvidence({ ...base, schemaVersion: 2 as 1 })).toThrow(
      /Unsupported evidence schema version/,
    );
    expect(() =>
      defineDesignSystemEvidence({ ...base, designSystemVersion: "0.5.1" }),
    ).toThrow(/does not match current/);
    expect(() =>
      defineDesignSystemEvidence({
        ...base,
        entries: [...base.entries, base.entries[0]!],
      }),
    ).toThrow(/duplicate story/);
    expect(() =>
      defineDesignSystemEvidence({
        ...base,
        entries: [{ storyId, scenarios: [] }],
      }),
    ).toThrow(/at least one scenario/);
    expect(() =>
      defineDesignSystemEvidence({
        ...base,
        entries: [{ storyId: "utility/not-in-the-catalog", scenarios: ["default"] }],
      }),
    ).toThrow(/unsupported web story/);

    const nonInteractiveWebStory = showcaseManifest.find(({ requirements }) => {
      const web = requirements.find(({ surface }) => surface === "web");
      return web !== undefined && !web.scenarios.includes("keyboard");
    });
    expect(nonInteractiveWebStory).toBeDefined();
    expect(() =>
      defineDesignSystemEvidence({
        ...base,
        entries: [{ storyId: nonInteractiveWebStory!.storyId, scenarios: ["keyboard"] }],
      }),
    ).toThrow(/scenario keyboard is not required for web/);
  });
});
