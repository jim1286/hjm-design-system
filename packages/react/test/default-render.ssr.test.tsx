import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HjmProvider } from "../src/index.js";
import { reactRendererEvidence } from "../src/evidence.js";
import { defaultRenderFixtures } from "./default-render-fixtures.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

/**
 * Canonical default-render proof: every evidence component server-renders its
 * own root marker inside the provider. The environment scenarios (dark,
 * large-text, rtl, reduced-motion, long-copy, accessibility) moved to
 * scenario-matrix.browser.test.tsx in 1.5.0. This file used to "prove" them by
 * checking only that the provider wrapper carried data-theme/dir attributes,
 * which is true for any component, including one that ignores the theme.
 */
describe("@hjmds/react default renderer proofs", () => {
  it("keeps one executable default fixture for every evidence component", () => {
    const evidenceIds = reactRendererEvidence.components.map(({ componentId }) => componentId);
    const fixtureIds = defaultRenderFixtures.map(({ componentId }) => componentId);

    expect(fixtureIds).toEqual(evidenceIds);
    expect(new Set(fixtureIds).size).toBe(fixtureIds.length);
    const execution = executedScenarioRegistry.executions.find(
      ({ proofFile }) => proofFile === "test/default-render.ssr.test.tsx",
    );
    expect(execution?.coverageMode).toBe("all-cases");
    expect(execution?.scenarios.map(({ id }) => id)).toEqual(["default"]);
  });

  it.each(defaultRenderFixtures)("$componentId", ({ componentId, marker, render }) => {
    const html = renderToStaticMarkup(<HjmProvider systemTheme="light">{render()}</HjmProvider>);
    expect(html, componentId).toContain(marker);
  });
});
