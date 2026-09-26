import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { describe, expect, it } from "vitest";
import { HjmNativeProvider } from "../src/index.js";
import { reactNativeRendererEvidence } from "../src/evidence.js";
import { defaultRenderCases } from "./default-render-fixtures.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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
    expect(caseIds).toEqual(evidenceIds);
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
        createNodeMock: () => ({}),
      });
    });
    // Closed modals (Dialog, Sheet) legitimately render nothing until opened.
    expect(renderer?.root).toBeDefined();
    act(() => { renderer?.unmount(); });
  });
});
