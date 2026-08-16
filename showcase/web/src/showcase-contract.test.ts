import { describe, expect, it } from "vitest";

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
});
