import { describe, expect, it } from "vitest";
import {
  getSliderStepTarget,
  resolveSliderDescriptor,
  resolveSliderFillFraction,
  sliderBehavior,
  sliderRecipe,
  validateSliderDescriptor,
  type SliderDescriptor,
} from "../src/slider.js";

const base: SliderDescriptor = {
  label: "Overall rating",
  value: 50,
  min: 0,
  max: 100,
  step: 1,
};

describe("Slider descriptor", () => {
  it("requires a visible or accessibility label", () => {
    expect(() => validateSliderDescriptor(base)).not.toThrow();
    expect(() => validateSliderDescriptor({ ...base, label: " " })).toThrow(/label/);
  });

  it("does not reject the values it must allow, including both boundaries", () => {
    expect(() => validateSliderDescriptor({ ...base, value: 0 })).not.toThrow();
    expect(() => validateSliderDescriptor({ ...base, value: 100 })).not.toThrow();
    expect(() => validateSliderDescriptor(base)).not.toThrow();
    expect(() =>
      validateSliderDescriptor({ ...base, value: 0.357, min: 0, max: 1, step: 0.001 }),
    ).not.toThrow();
  });

  it("rejects a value outside its own range and empty product-formatted copy", () => {
    expect(() => validateSliderDescriptor({ ...base, value: 101 })).toThrow(/within/);
    expect(() => validateSliderDescriptor({ ...base, value: -1 })).toThrow(/within/);
    expect(() => validateSliderDescriptor({ ...base, valueText: " " })).toThrow(
      /valueText/,
    );
  });

  it("resolves a default step", () => {
    expect(resolveSliderDescriptor({ label: "Score", value: 3, min: 0, max: 10 }).step).toBe(
      1,
    );
  });

  it("computes the track fill fraction from numbers only, never a formatted string", () => {
    expect(resolveSliderFillFraction(base)).toBe(0.5);
    expect(resolveSliderFillFraction({ ...base, value: 0 })).toBe(0);
    expect(resolveSliderFillFraction({ ...base, value: 100 })).toBe(1);
  });
});

describe("Slider keyboard and RN step intents", () => {
  it("steps by one increment for arrow intents and clamps at the boundary", () => {
    expect(getSliderStepTarget(base, "increment")).toBe(51);
    expect(getSliderStepTarget(base, "decrement")).toBe(49);
    expect(getSliderStepTarget({ ...base, value: 100 }, "increment")).toBe(100);
    expect(getSliderStepTarget({ ...base, value: 0 }, "decrement")).toBe(0);
  });

  it("steps by the page multiplier for page intents", () => {
    expect(getSliderStepTarget(base, "increment-page")).toBe(60);
    expect(getSliderStepTarget(base, "decrement-page")).toBe(40);
    expect(getSliderStepTarget({ ...base, value: 95 }, "increment-page")).toBe(100);
  });

  it("jumps to min and max for first/last intents", () => {
    expect(getSliderStepTarget(base, "first")).toBe(0);
    expect(getSliderStepTarget(base, "last")).toBe(100);
  });

  it("keeps decimal steps precise, e.g. a batting-average-shaped range", () => {
    const battingAverage: SliderDescriptor = {
      label: "Batting average",
      value: 0.357,
      min: 0,
      max: 1,
      step: 0.001,
    };
    expect(getSliderStepTarget(battingAverage, "increment")).toBe(0.358);
    expect(getSliderStepTarget(battingAverage, "decrement")).toBe(0.356);
  });
});

describe("Slider visual and behavior contract", () => {
  it("gives the thumb a 44-unit hit target even though the visible thumb is smaller", () => {
    expect(sliderRecipe.sizes.medium.hitTarget).toBeGreaterThanOrEqual(44);
    expect(sliderRecipe.sizes.medium.thumbDiameter).toBeLessThan(
      sliderRecipe.sizes.medium.hitTarget,
    );
  });

  it("does not expose an empty value axis or a validation axis", () => {
    expect(Object.keys(sliderBehavior.stateAxes)).not.toContain("value");
    expect(Object.keys(sliderBehavior.stateAxes)).not.toContain("validation");
    expect(sliderBehavior.stateAxes.interaction).toContain("dragged");
  });

  it("keeps RN to increment/decrement only — no paging action on native", () => {
    expect(sliderBehavior.native.roles).toEqual(["adjustable"]);
    expect(sliderBehavior.native.actions).toEqual(["increment", "decrement"]);
  });

  it("does not include range (two-handle) selection in this contract", () => {
    expect(sliderBehavior.scenarios).toContain(
      "range-two-handle-selection-is-out-of-scope-until-a-real-product-need-exists",
    );
  });
});
