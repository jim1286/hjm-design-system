import type { ColorReference } from "./color-references.js";
import type { BehaviorContract } from "./behaviors.js";
import { focusIndicatorContract } from "./component-contracts.js";
import { control, opacity, type TextVariant } from "./foundations.js";
import {
  assertFiniteNumber,
  numericRangeDefaults,
  snapToStep,
  stepNumericValue,
  validateNumericRangeConfig,
  type NumericRangeConfig,
} from "./number-field.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * Slider always has a value — there is no `empty` axis to model, unlike a
 * NumberField that can start unset. Range selection (two handles) is out of
 * scope until a real product needs it; adding it speculatively would mean
 * guessing at a value-pair contract nobody has validated.
 */
export type SliderDescriptor = Readonly<{
  /** Visible or accessibility label; announced before the value. */
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /**
   * Product-formatted copy overriding the raw numeric announcement, e.g.
   * "75점" or ".357". Slider never formats numbers itself.
   */
  valueText?: string;
}>;

export type ResolvedSliderDescriptor = Omit<SliderDescriptor, "step"> &
  Readonly<{ step: number }>;

function assertNonEmptyCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Slider ${field} must not be empty`);
  }
}

export function validateSliderDescriptor(descriptor: SliderDescriptor): void {
  assertNonEmptyCopy(descriptor.label, "label");
  validateNumericRangeConfig(descriptor);
  assertFiniteNumber(descriptor.value, "value");
  if (descriptor.value < descriptor.min || descriptor.value > descriptor.max) {
    throw new RangeError("Slider value must be within min and max");
  }
  if (descriptor.valueText !== undefined) {
    assertNonEmptyCopy(descriptor.valueText, "valueText");
  }
}

export function resolveSliderDescriptor(
  descriptor: SliderDescriptor,
): ResolvedSliderDescriptor {
  validateSliderDescriptor(descriptor);
  return { ...descriptor, step: descriptor.step ?? numericRangeDefaults.step };
}

/** 0..1 position of `value` between `min` and `max`, for track fill — not a display string. */
export function resolveSliderFillFraction(descriptor: SliderDescriptor): number {
  validateSliderDescriptor(descriptor);
  return (descriptor.value - descriptor.min) / (descriptor.max - descriptor.min);
}

export type SliderStepIntent =
  | "increment"
  | "decrement"
  | "increment-page"
  | "decrement-page"
  | "first"
  | "last";

export const sliderBehaviorDefaults = {
  pageMultiplier: 10,
} as const satisfies Readonly<{ pageMultiplier: number }>;

/**
 * One function for every keyboard/RN step intent so Web arrow/Home/End/
 * PageUp/PageDown and RN increment/decrement actions resolve through the same
 * snap-and-clamp judgment as the stepper itself.
 */
export function getSliderStepTarget(
  descriptor: SliderDescriptor,
  intent: SliderStepIntent,
): number {
  validateSliderDescriptor(descriptor);
  if (intent === "first") return descriptor.min;
  if (intent === "last") return descriptor.max;
  const step = descriptor.step ?? numericRangeDefaults.step;
  const config: NumericRangeConfig = { min: descriptor.min, max: descriptor.max, step };
  if (intent === "increment" || intent === "decrement") {
    return stepNumericValue(descriptor.value, config, intent);
  }
  const direction = intent === "increment-page" ? 1 : -1;
  return snapToStep(
    descriptor.value + direction * step * sliderBehaviorDefaults.pageMultiplier,
    config,
  );
}

export type SliderSize = "medium";

export const sliderRecipe = {
  slots: ["root", "track", "filledTrack", "thumb", "label", "valueLabel"] as const,
  defaults: { size: "medium" },
  sizes: {
    medium: {
      trackHeight: 4,
      thumbDiameter: 20,
      hitTarget: control.minTouchTarget,
      labelVariant: "body",
      valueLabelVariant: "label",
    },
  },
  colors: {
    trackFilled: semanticColors.content.brand,
    trackUnfilled: semanticColors.surface.sunken,
    trackUnfilledBorder: semanticColors.content.secondary,
    thumb: semanticColors.canvas,
    thumbBorder: semanticColors.border.focus,
    label: semanticColors.content.body,
    valueLabel: semanticColors.content.secondary,
  },
  states: {
    focus: focusIndicatorContract,
    disabledOpacity: opacity.disabled,
    draggedOpacity: opacity.dragged,
  },
  radius: "full",
} as const satisfies {
  slots: readonly ["root", "track", "filledTrack", "thumb", "label", "valueLabel"];
  defaults: { size: SliderSize };
  sizes: Record<
    SliderSize,
    {
      trackHeight: number;
      thumbDiameter: number;
      hitTarget: number;
      labelVariant: TextVariant;
      valueLabelVariant: TextVariant;
    }
  >;
  colors: {
    trackFilled: ColorReference;
    trackUnfilled: ColorReference;
    trackUnfilledBorder: ColorReference;
    thumb: ColorReference;
    thumbBorder: ColorReference;
    label: ColorReference;
    valueLabel: ColorReference;
  };
  states: {
    focus: typeof focusIndicatorContract;
    disabledOpacity: number;
    draggedOpacity: number;
  };
  radius: "full";
};

export const sliderBehavior = {
  controlled: ["value", "defaultValue", "onValueChange"],
  defaults: sliderBehaviorDefaults,
  stateAxes: {
    interaction: ["idle", "hover", "focusVisible", "pressed", "dragged"],
    availability: ["enabled", "disabled"],
  },
  web: {
    roles: ["slider"],
    keyboard: [
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ],
    focus: "native",
  },
  native: {
    roles: ["adjustable"],
    states: ["disabled"],
    actions: ["increment", "decrement"],
  },
  scenarios: [
    "label-then-value-then-range-announcement-order",
    "arrow-keys-step-by-one-increment",
    "page-keys-step-by-the-page-multiplier",
    "home-and-end-jump-to-min-and-max",
    "value-is-always-present-no-empty-state",
    "fill-color-is-never-the-only-value-cue",
    "range-two-handle-selection-is-out-of-scope-until-a-real-product-need-exists",
  ],
} as const satisfies BehaviorContract;
