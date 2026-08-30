import { describe, expect, it } from "vitest";

import {
  aspectRatioRecipe,
  resolveAspectRatioDescriptor,
  validateAspectRatioValue,
} from "../src/aspect-ratio.js";

describe("AspectRatio contract", () => {
  it("uses the wide media ratio by default", () => {
    expect(resolveAspectRatioDescriptor()).toEqual({
      ratio: aspectRatioRecipe.ratios.wide,
      source: "wide",
    });
  });

  it("resolves shared presets and positive custom ratios", () => {
    expect(resolveAspectRatioDescriptor({ ratio: "square" })).toEqual({
      ratio: 1,
      source: "square",
    });
    expect(resolveAspectRatioDescriptor({ ratio: 1.85 })).toEqual({
      ratio: 1.85,
      source: "custom",
    });
  });

  it("rejects invalid ratios before a renderer sees them", () => {
    expect(() => validateAspectRatioValue(0)).toThrow(/positive finite/);
    expect(() => validateAspectRatioValue(Number.POSITIVE_INFINITY)).toThrow(/positive finite/);
    expect(() => validateAspectRatioValue("cinema" as "wide")).toThrow(
      /Unsupported AspectRatio preset/,
    );
  });
});
