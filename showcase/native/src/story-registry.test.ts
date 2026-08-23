import { reactNativeRendererEvidence } from "@hjm/react-native/evidence";
import { describe, expect, it } from "vitest";

import { nativeRendererStoryIds } from "./story-registry";

describe("Native Storybook renderer coverage", () => {
  it("registers every active renderer exactly once", () => {
    const evidenceIds = reactNativeRendererEvidence.components.map(({ componentId }) => componentId);
    expect([...nativeRendererStoryIds].sort()).toEqual([...evidenceIds].sort());
    expect(new Set(nativeRendererStoryIds).size).toBe(nativeRendererStoryIds.length);
  });
});
