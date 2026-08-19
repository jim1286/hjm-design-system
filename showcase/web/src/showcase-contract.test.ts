import { describe, expect, it } from "vitest";

import {
  antDesignReferenceComponents,
  componentDefinitions,
  summarizeAntDesignCoverage,
} from "@hjm/design-system";
import { showcaseManifest, showcaseScenarios } from "@hjm/design-system/showcase";

describe("web showcase coverage", () => {
  it("has a documented definition for every required scenario", () => {
    const known = new Set(showcaseScenarios.map(({ id }) => id));
    for (const entry of showcaseManifest) {
      for (const scenario of entry.requiredScenarios) {
        expect(known.has(scenario), `${entry.storyId}/${scenario}`).toBe(true);
      }
    }
  });

  it("keeps planned entries out of implementation evidence", () => {
    for (const entry of showcaseManifest.filter(({ component }) => component.status === "planned")) {
      expect(entry.requiredScenarios).toEqual(["contract"]);
    }
  });

  it("exposes the full canonical scope and Ant Design crosswalk to the explorer", () => {
    expect(componentDefinitions).toHaveLength(showcaseManifest.length);
    expect(antDesignReferenceComponents).toHaveLength(73);
    expect(summarizeAntDesignCoverage()).toMatchObject({ total: 73, tracked: 73 });
  });

  it("uses stable documentation IDs for every canonical component", () => {
    expect(new Set(componentDefinitions.map(({ id }) => id)).size).toBe(componentDefinitions.length);
    expect(new Set(componentDefinitions.map(({ docs }) => docs.storyId)).size).toBe(
      componentDefinitions.length,
    );
  });
});
