import { describe, expect, it } from "vitest";
import {
  clampToRange,
  commitNumberFieldInput,
  numberFieldBehavior,
  numberFieldRecipe,
  parseNumberFieldInput,
  resolveNumberFieldDescriptor,
  resolveNumberFieldInputStepperState,
  resolveNumberFieldStepperState,
  snapToStep,
  stepNumberFieldInput,
  stepNumericValue,
  stepNumberFieldValue,
  validateNumberFieldDescriptor,
  validateNumericRangeConfig,
  type NumberFieldDescriptor,
} from "../src/number-field.js";

const base: NumberFieldDescriptor = { value: 50, min: 0, max: 100, step: 1 };

describe("numeric range judgment (shared with Slider)", () => {
  it("rejects ranges that cannot hold up", () => {
    expect(() => validateNumericRangeConfig({ min: 10, max: 10 })).toThrow(/less than/);
    expect(() => validateNumericRangeConfig({ min: 10, max: 5 })).toThrow(/less than/);
    expect(() => validateNumericRangeConfig({ min: 0, max: 10, step: 0 })).toThrow(
      /step must be greater than 0/,
    );
    expect(() => validateNumericRangeConfig({ min: 0, max: 10, step: -1 })).toThrow(
      /step must be greater than 0/,
    );
    expect(() => validateNumericRangeConfig({ min: 0, max: 10, step: 11 })).toThrow(
      /min–max span/,
    );
    expect(() =>
      validateNumericRangeConfig({ min: Number.NaN, max: 10 }),
    ).toThrow(/finite number/);
  });

  it("does not reject the ranges it must allow", () => {
    expect(() => validateNumericRangeConfig({ min: 0, max: 100 })).not.toThrow();
    expect(() => validateNumericRangeConfig({ min: 0, max: 1, step: 0.001 })).not.toThrow();
    expect(() => validateNumericRangeConfig({ min: 0, max: 10, step: 10 })).not.toThrow();
    expect(() => validateNumericRangeConfig({ min: -20, max: -10 })).not.toThrow();
  });

  it("clamps into range", () => {
    expect(clampToRange(150, { min: 0, max: 100 })).toBe(100);
    expect(clampToRange(-5, { min: 0, max: 100 })).toBe(0);
    expect(clampToRange(50, { min: 0, max: 100 })).toBe(50);
  });

  it("snaps to the nearest step without float drift", () => {
    expect(snapToStep(53, { min: 0, max: 100, step: 5 })).toBe(55);
    expect(snapToStep(0.3574, { min: 0, max: 1, step: 0.001 })).toBe(0.357);
    expect(snapToStep(0.999, { min: 0, max: 1, step: 0.001 })).toBe(0.999);
    expect(snapToStep(3.4e-7, { min: 0, max: 1e-6, step: 1e-7 })).toBe(3e-7);
    expect(snapToStep(1000, { min: 0, max: 100, step: 5 })).toBe(100);
  });

  it("preserves a fractional min as the origin of the step grid", () => {
    const fractionalOrigin = { min: 0.05, max: 1.05, step: 0.1 } as const;

    expect(snapToStep(0.15, fractionalOrigin)).toBe(0.15);
    expect(stepNumericValue(0.05, fractionalOrigin, "increment")).toBe(0.15);
    expect(stepNumericValue(0.25, fractionalOrigin, "decrement")).toBe(0.15);
    expect(commitNumberFieldInput("0.15", fractionalOrigin)).toBe(0.15);
  });

  it("steps an off-grid draft to the next boundary without skipping one", () => {
    const range = { min: 0, max: 10, step: 0.5 } as const;

    expect(stepNumericValue(4.26, range, "increment")).toBe(4.5);
    expect(stepNumericValue(4.26, range, "decrement")).toBe(4);
    expect(stepNumericValue(4.24, range, "increment")).toBe(4.5);
    expect(stepNumericValue(4.24, range, "decrement")).toBe(4);
    expect(stepNumberFieldInput("4.26", { ...range, value: 2 }, "increment")).toBe(4.5);
    expect(stepNumberFieldInput("4.24", { ...range, value: 2 }, "decrement")).toBe(4);
    expect(stepNumberFieldInput("draft", { ...range, value: 2 }, "increment")).toBe(2.5);
  });

  it("derives stepper availability from the visible draft", () => {
    const atMax = { value: 10, min: 0, max: 10, step: 1 } as const;
    const atMin = { ...atMax, value: 0 } as const;

    expect(resolveNumberFieldInputStepperState("4", atMax)).toEqual({
      incrementDisabled: false,
      decrementDisabled: false,
    });
    expect(resolveNumberFieldInputStepperState("6", atMin)).toEqual({
      incrementDisabled: false,
      decrementDisabled: false,
    });
    expect(resolveNumberFieldInputStepperState("999", atMin)).toEqual({
      incrementDisabled: true,
      decrementDisabled: false,
    });
    expect(resolveNumberFieldInputStepperState("draft", atMax)).toEqual({
      incrementDisabled: true,
      decrementDisabled: false,
    });
  });
});

describe("NumberField descriptor", () => {
  it("parses complete finite decimal drafts and preserves empty as null", () => {
    expect(parseNumberFieldInput("")).toBeNull();
    expect(parseNumberFieldInput("  -12.5  ")).toBe(-12.5);
    expect(parseNumberFieldInput("1e-7")).toBe(1e-7);
    expect(parseNumberFieldInput("-")).toBeUndefined();
    expect(parseNumberFieldInput("Infinity")).toBeUndefined();
    expect(parseNumberFieldInput("0x10")).toBeUndefined();
  });

  it("clamps and snaps complete drafts only at the commit boundary", () => {
    const range = { min: 0, max: 10, step: 0.5 } as const;
    expect(commitNumberFieldInput("", range)).toBeNull();
    expect(commitNumberFieldInput("4.26", range)).toBe(4.5);
    expect(commitNumberFieldInput("999", range)).toBe(10);
    expect(commitNumberFieldInput("draft", range)).toBeUndefined();
  });

  it("keeps value and range validation independent, and allows an unset value", () => {
    expect(() => validateNumberFieldDescriptor(base)).not.toThrow();
    expect(() => validateNumberFieldDescriptor({ ...base, value: null })).not.toThrow();
    expect(() => validateNumberFieldDescriptor({ ...base, value: 0 })).not.toThrow();
    expect(() => validateNumberFieldDescriptor({ ...base, value: 100 })).not.toThrow();
  });

  it("rejects a value outside its own range", () => {
    expect(() => validateNumberFieldDescriptor({ ...base, value: 101 })).toThrow(/within/);
    expect(() => validateNumberFieldDescriptor({ ...base, value: -1 })).toThrow(/within/);
  });

  it("resolves a default step", () => {
    expect(resolveNumberFieldDescriptor({ value: 3, min: 0, max: 10 }).step).toBe(1);
  });

  it("disables only the stepper direction at its boundary, and neither when empty", () => {
    expect(resolveNumberFieldStepperState({ ...base, value: 0 })).toEqual({
      incrementDisabled: false,
      decrementDisabled: true,
    });
    expect(resolveNumberFieldStepperState({ ...base, value: 100 })).toEqual({
      incrementDisabled: true,
      decrementDisabled: false,
    });
    expect(resolveNumberFieldStepperState({ ...base, value: 50 })).toEqual({
      incrementDisabled: false,
      decrementDisabled: false,
    });
    expect(resolveNumberFieldStepperState({ ...base, value: null })).toEqual({
      incrementDisabled: false,
      decrementDisabled: false,
    });
  });

  it("steps from empty toward the boundary in the pressed direction", () => {
    expect(stepNumberFieldValue({ ...base, value: null }, "increment")).toBe(0);
    expect(stepNumberFieldValue({ ...base, value: null }, "decrement")).toBe(100);
  });

  it("steps and clamps at the boundary instead of overshooting", () => {
    expect(stepNumberFieldValue({ ...base, value: 50 }, "increment")).toBe(51);
    expect(stepNumberFieldValue({ ...base, value: 100 }, "increment")).toBe(100);
    expect(stepNumberFieldValue({ ...base, value: 0 }, "decrement")).toBe(0);
  });
});

describe("NumberField visual and behavior contract", () => {
  it("gives both stepper buttons a 44-unit target and disables by opacity only alongside a state change", () => {
    expect(numberFieldRecipe.stepper.minTarget).toBe(44);
    expect(numberFieldRecipe.sizes.medium.stepperDiameter).toBeGreaterThanOrEqual(44);
    expect(numberFieldRecipe.frame.minHeight).toBe(44);
  });

  it("exposes validation as a NumberField-only axis and never models held-repeat", () => {
    expect(numberFieldBehavior.stateAxes.validation).toEqual(["valid", "invalid"]);
    expect(numberFieldBehavior.stateAxes.value).toEqual(["empty", "filled"]);
    expect(numberFieldBehavior.scenarios).toContain(
      "held-repeat-is-not-part-of-the-contract",
    );
    expect(numberFieldBehavior.native.actions).not.toContain("repeat");
  });
});
