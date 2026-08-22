import { describe, expect, it } from "vitest";
import { stepNumericValue } from "../src/number-field.js";
import {
  getSliderStepTarget,
  resolveSliderDescriptor,
  resolveSliderFillFraction,
  resolveSliderValue,
  resolveSliderValueFromOffset,
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
    expect(() =>
      validateSliderDescriptor({ ...base, value: 4, min: 0, max: 10, step: 3 }),
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

  it("maps physical offsets from min in LTR and mirrors them in RTL", () => {
    expect(resolveSliderValueFromOffset(base, 25, 100, "ltr")).toBe(25);
    expect(resolveSliderValueFromOffset(base, 25, 100, "rtl")).toBe(75);
    expect(resolveSliderValueFromOffset(base, -50, 100, "ltr")).toBe(0);
    expect(resolveSliderValueFromOffset(base, 150, 100, "ltr")).toBe(100);
    expect(() => resolveSliderValueFromOffset(base, 0, 0, "ltr")).toThrow(/extent/);
  });

  it("snaps pointer offsets from min using NumberField range math", () => {
    const offsetRange: SliderDescriptor = {
      label: "Offset",
      value: 0.5,
      min: 0.5,
      max: 10.5,
      step: 2.5,
    };
    expect(resolveSliderValueFromOffset(offsetRange, 51, 100, "ltr")).toBe(5.5);
  });

  it("preserves exact endpoints for non-divisible ranges while snapping interior input", () => {
    const nonDivisible: SliderDescriptor = {
      label: "Non-divisible range",
      value: 4,
      min: 0,
      max: 10,
      step: 3,
    };
    expect(resolveSliderValue(nonDivisible, 7.4)).toBe(6);
    expect(resolveSliderValue(nonDivisible, 10)).toBe(10);
    expect(resolveSliderValueFromOffset(nonDivisible, 0, 100, "ltr")).toBe(0);
    expect(resolveSliderValueFromOffset(nonDivisible, 100, 100, "ltr")).toBe(10);
    expect(resolveSliderValueFromOffset(nonDivisible, 0, 100, "rtl")).toBe(10);
    expect(resolveSliderValueFromOffset(nonDivisible, 100, 100, "rtl")).toBe(0);
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

  it("uses the endpoint-preserving resolver for page intents", () => {
    const nonDivisible: SliderDescriptor = {
      label: "Non-divisible range",
      value: 9,
      min: 0,
      max: 10,
      step: 3,
    };
    expect(getSliderStepTarget(nonDivisible, "increment-page")).toBe(10);
    expect(getSliderStepTarget({ ...nonDivisible, value: 1 }, "decrement-page")).toBe(0);
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

  it("reuses NumberField's single-step judgment across offsets, decimals, and boundaries", () => {
    const descriptors: readonly SliderDescriptor[] = [
      base,
      { label: "Offset range", value: 5.5, min: 0.5, max: 10.5, step: 2.5 },
      { label: "Decimal range", value: 0.357, min: 0, max: 1, step: 0.001 },
      { label: "Lower boundary", value: -20, min: -20, max: -10, step: 2 },
      { label: "Upper boundary", value: -10, min: -20, max: -10, step: 2 },
    ];

    for (const descriptor of descriptors) {
      for (const direction of ["increment", "decrement"] as const) {
        expect(getSliderStepTarget(descriptor, direction)).toBe(
          stepNumericValue(descriptor.value, descriptor, direction),
        );
      }
    }
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

  it("separates continuous changes from the interaction-end event", () => {
    expect(sliderBehavior.controlled).toContain("onValueChange");
    expect(sliderBehavior.events).toEqual(["onValueChangeEnd"]);
  });

  it("does not include range (two-handle) selection in this contract", () => {
    expect(sliderBehavior.scenarios).toContain(
      "range-two-handle-selection-is-out-of-scope-until-a-real-product-need-exists",
    );
  });
});
