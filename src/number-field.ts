import type { ColorReference } from "./color-references.js";
import type { BehaviorContract } from "./behaviors.js";
import {
  fieldFrameContract,
  focusIndicatorContract,
  formSupportContract,
} from "./component-contracts.js";
import { control, opacity, spacing, type TextVariant } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * Shared by NumberField and Slider: both solve "pick a number within a range."
 * Keeping min/max/step/value judgment in one place keeps the two components
 * from drifting into two different meanings of the same numeric domain.
 */
export type NumericRangeConfig = Readonly<{
  min: number;
  max: number;
  step?: number;
}>;

export const numericRangeDefaults = {
  step: 1,
} as const satisfies Readonly<{ step: number }>;

export function assertFiniteNumber(value: number, field: string): void {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new TypeError(`${field} must be a finite number`);
  }
}

export function validateNumericRangeConfig(config: NumericRangeConfig): void {
  assertFiniteNumber(config.min, "min");
  assertFiniteNumber(config.max, "max");
  if (config.min >= config.max) {
    throw new RangeError("min must be less than max");
  }
  const step = config.step ?? numericRangeDefaults.step;
  assertFiniteNumber(step, "step");
  if (step <= 0) {
    throw new RangeError("step must be greater than 0");
  }
  if (step > config.max - config.min) {
    throw new RangeError("step must not exceed the min–max span");
  }
}

/** Number of decimal digits step carries, so snapping never accrues float drift. */
function stepPrecision(step: number): number {
  const text = step.toString();
  const dotIndex = text.indexOf(".");
  return dotIndex === -1 ? 0 : text.length - dotIndex - 1;
}

function roundToStepPrecision(value: number, step: number): number {
  const decimals = stepPrecision(step);
  if (decimals === 0) return Math.round(value);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function clampToRange(value: number, config: NumericRangeConfig): number {
  validateNumericRangeConfig(config);
  assertFiniteNumber(value, "value");
  return Math.min(config.max, Math.max(config.min, value));
}

/** Snaps to the nearest step from `min`, then clamps into [min, max]. */
export function snapToStep(value: number, config: NumericRangeConfig): number {
  validateNumericRangeConfig(config);
  assertFiniteNumber(value, "value");
  const step = config.step ?? numericRangeDefaults.step;
  const steps = Math.round((value - config.min) / step);
  const snapped = roundToStepPrecision(config.min + steps * step, step);
  return clampToRange(snapped, config);
}

export function stepNumericValue(
  value: number,
  config: NumericRangeConfig,
  direction: "increment" | "decrement",
): number {
  const step = config.step ?? numericRangeDefaults.step;
  const delta = direction === "increment" ? step : -step;
  return snapToStep(value + delta, config);
}

/**
 * `null` means no value has been entered yet — distinct from any in-range
 * number, including `min`. Products decide whether empty is allowed to submit.
 */
export type NumberFieldValue = number | null;

export type NumberFieldDescriptor = Readonly<{
  value: NumberFieldValue;
  min: number;
  max: number;
  step?: number;
}>;

export type ResolvedNumberFieldDescriptor = Omit<NumberFieldDescriptor, "step"> &
  Readonly<{ step: number }>;

export function validateNumberFieldDescriptor(descriptor: NumberFieldDescriptor): void {
  validateNumericRangeConfig(descriptor);
  if (descriptor.value !== null) {
    assertFiniteNumber(descriptor.value, "value");
    if (descriptor.value < descriptor.min || descriptor.value > descriptor.max) {
      throw new RangeError("NumberField value must be within min and max");
    }
  }
}

export function resolveNumberFieldDescriptor(
  descriptor: NumberFieldDescriptor,
): ResolvedNumberFieldDescriptor {
  validateNumberFieldDescriptor(descriptor);
  return { ...descriptor, step: descriptor.step ?? numericRangeDefaults.step };
}

export type NumberFieldStepperState = Readonly<{
  incrementDisabled: boolean;
  decrementDisabled: boolean;
}>;

/** Empty has no boundary yet, so neither stepper direction is disabled. */
export function resolveNumberFieldStepperState(
  descriptor: NumberFieldDescriptor,
): NumberFieldStepperState {
  validateNumberFieldDescriptor(descriptor);
  if (descriptor.value === null) {
    return { incrementDisabled: false, decrementDisabled: false };
  }
  return {
    incrementDisabled: descriptor.value >= descriptor.max,
    decrementDisabled: descriptor.value <= descriptor.min,
  };
}

/** Stepping from empty lands on the boundary you are moving toward. */
export function stepNumberFieldValue(
  descriptor: NumberFieldDescriptor,
  direction: "increment" | "decrement",
): number {
  validateNumberFieldDescriptor(descriptor);
  if (descriptor.value === null) {
    return direction === "increment" ? descriptor.min : descriptor.max;
  }
  return stepNumericValue(descriptor.value, descriptor, direction);
}

export type NumberFieldSize = "medium" | "large";

/**
 * Reuses the Field frame (`fieldFrameContract`) and form support copy
 * (`formSupportContract`) verbatim — a second field frame would drift from
 * Field the first time either one's border or height changes.
 */
export const numberFieldRecipe = {
  slots: [
    "root",
    "frame",
    "input",
    "decrement",
    "increment",
    "description",
    "error",
  ] as const,
  defaults: { size: "medium" },
  frame: fieldFrameContract,
  support: formSupportContract,
  sizes: {
    medium: {
      minHeight: fieldFrameContract.minHeight,
      paddingHorizontal: fieldFrameContract.paddingHorizontal,
      textVariant: "body",
      stepperDiameter: control.minTouchTarget,
    },
    large: {
      minHeight: control.buttonHeight.large,
      paddingHorizontal: spacing.lg,
      textVariant: "bodyLarge",
      stepperDiameter: control.minTouchTarget,
    },
  },
  value: {
    color: semanticColors.content.body,
    numericVariant: "tabular",
  },
  stepper: {
    color: semanticColors.content.secondary,
    minTarget: control.minTouchTarget,
  },
  states: {
    focus: focusIndicatorContract,
    invalidBorder: semanticColors.border.danger,
    disabledOpacity: opacity.disabled,
  },
} as const satisfies {
  slots: readonly [
    "root",
    "frame",
    "input",
    "decrement",
    "increment",
    "description",
    "error",
  ];
  defaults: { size: NumberFieldSize };
  frame: typeof fieldFrameContract;
  support: typeof formSupportContract;
  sizes: Record<
    NumberFieldSize,
    {
      minHeight: number;
      paddingHorizontal: number;
      textVariant: TextVariant;
      stepperDiameter: number;
    }
  >;
  value: { color: ColorReference; numericVariant: "tabular" };
  stepper: { color: ColorReference; minTarget: number };
  states: {
    focus: typeof focusIndicatorContract;
    invalidBorder: ColorReference;
    disabledOpacity: number;
  };
};

/**
 * Held-repeat on the stepper buttons is deliberately not part of this
 * contract: no product using NumberField has measured demand for press-and-
 * hold, and adding it now would mean guessing at a repeat-rate/acceleration
 * curve nobody has validated. A single activation per press only.
 */
export const numberFieldBehavior = {
  controlled: ["value", "defaultValue", "onValueChange"],
  stateAxes: {
    availability: ["enabled", "disabled", "readOnly"],
    value: ["empty", "filled"],
    validation: ["valid", "invalid"],
  },
  web: {
    roles: ["spinbutton"],
    keyboard: ["Tab", "ArrowUp", "ArrowDown"],
    focus: "native",
  },
  native: {
    roles: ["text", "button"],
    states: ["disabled"],
    actions: ["focus", "setText", "increment", "decrement"],
  },
  scenarios: [
    "value-and-range-are-independent-controlled-inputs",
    "stepper-buttons-disable-at-min-and-max",
    "empty-disables-neither-stepper-direction",
    "keyboard-arrow-up-down-step-like-the-stepper-buttons",
    "invalid-is-a-numberfield-only-axis-independent-of-range",
    "held-repeat-is-not-part-of-the-contract",
  ],
} as const satisfies BehaviorContract;
