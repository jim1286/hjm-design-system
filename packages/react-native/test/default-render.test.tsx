import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
// Chart paints with react-native-svg; the test host renders its primitives as plain views (chart.test.tsx does the same).
vi.mock("react-native-svg", async () => {
  const { View } = await import("react-native");
  return { default: View, Circle: View, ClipPath: View, Defs: View, G: View, Line: View, LinearGradient: View, Pattern: View, Path: View, Rect: View, Stop: View, Text: View };
});
import { HjmNativeProvider } from "../src/index.js";
import { reactNativeRendererEvidence } from "../src/evidence.js";
import { defaultRenderCases } from "./default-render-fixtures.js";
import { createHostNodeMock } from "./host-node-mock.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Paused optional animation still cancels its frame handle when unmounted.
beforeAll(() => { vi.stubGlobal("cancelAnimationFrame", () => {}); });
afterAll(() => { vi.unstubAllGlobals(); });

/**
 * Canonical default-render proof: every evidence component renders inside the
 * provider. The environment scenarios moved to scenario-matrix.test.tsx in
 * 1.5.0; this file used to claim them while asserting only that rendering did
 * not throw.
 */
describe("@hjmds/react-native default renderer evidence", () => {
  it("has one literal executable case for every default evidence claim", () => {
    const evidenceIds = reactNativeRendererEvidence.components.map(({ componentId }) => componentId);
    const caseIds = defaultRenderCases.map(({ componentId }) => componentId);
    // Claims follow catalog order while cases are grouped by file; the set is what must match (2026-10-18).
    expect([...caseIds].sort()).toEqual([...evidenceIds].sort());
    expect(new Set(caseIds).size).toBe(caseIds.length);
    const execution = executedScenarioRegistry.executions.find(
      ({ proofFile }) => proofFile === "test/default-render.test.tsx",
    );
    expect(execution?.coverageMode).toBe("all-cases");
    expect(execution?.scenarios.map(({ id }) => id)).toEqual(["default"]);
  });

  it.each(defaultRenderCases)("$componentId", ({ render }) => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(<HjmNativeProvider theme="light">{render()}</HjmNativeProvider>, {
        createNodeMock: createHostNodeMock,
      });
    });
    // Closed modals (Dialog, Sheet) legitimately render nothing until opened.
    expect(renderer?.root).toBeDefined();
    act(() => { renderer?.unmount(); });
  });
});
