import type { ColorReference } from "./color-references.js";
import type { BehaviorContract } from "./behaviors.js";
import { focusIndicatorContract } from "./component-contracts.js";
import {
  clampToRange,
  snapToStep,
  stepNumericValue,
  validateNumericRangeConfig,
} from "./number-field.js";
import { control } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * `"horizontal"` means panes sit side by side (the separator is a vertical
 * bar); `"vertical"` means panes stack top/bottom (the separator is a
 * horizontal bar). See `resolveSplitterSeparatorOrientation` — the two are
 * intentionally not spelled the same way to keep that inversion visible.
 */
export type SplitterAxis = "horizontal" | "vertical";

/**
 * "Pick a number within a range" — the same problem NumberField and Slider
 * already solve, applied to a pane size instead of a displayed value. This
 * descriptor reuses `min`/`max`/`step`/`value` verbatim and calls
 * `src/number-field.ts`'s judgment functions directly rather than
 * re-deriving clamp/snap/step arithmetic a third time.
 */
export type SplitterDescriptor = Readonly<{
  /** The primary pane's current size, in whatever unit the product chose (fraction or px). */
  value: number;
  min: number;
  max: number;
  step?: number;
  axis?: SplitterAxis;
  /** Required accessible name for the separator (e.g. "패널 크기 조절"). */
  label: string;
  /** Product-formatted announcement of the current size, e.g. "35%" or "320px". */
  valueText?: string;
}>;

export const splitterDefaults = {
  axis: "horizontal",
} as const satisfies Readonly<{ axis: SplitterAxis }>;

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Splitter ${field} must not be empty`);
  }
}

export function validateSplitterDescriptor(descriptor: SplitterDescriptor): void {
  validateNumericRangeConfig(descriptor);
  if (descriptor.value < descriptor.min || descriptor.value > descriptor.max) {
    throw new RangeError("Splitter value must be within min and max");
  }
  if (
    descriptor.axis !== undefined &&
    descriptor.axis !== "horizontal" &&
    descriptor.axis !== "vertical"
  ) {
    throw new TypeError(`Unsupported Splitter axis: ${String(descriptor.axis)}`);
  }
  assertNonEmpty(descriptor.label, "label");
  if (descriptor.valueText !== undefined) assertNonEmpty(descriptor.valueText, "valueText");
}

/**
 * A WAI-ARIA `separator` reports orientation as the axis the pointer moves
 * *along*, which is perpendicular to how the panes are arranged — a
 * side-by-side (`"horizontal"`) splitter has a *vertical* separator bar.
 * Named and exported so renderers translate this once instead of
 * re-deriving the inversion at each call site.
 */
export function resolveSplitterSeparatorOrientation(
  axis: SplitterAxis,
): "horizontal" | "vertical" {
  return axis === "horizontal" ? "vertical" : "horizontal";
}

/** Keyboard step, reusing NumberField's stepper arithmetic unchanged. */
export function getNextSplitterValue(
  descriptor: SplitterDescriptor,
  direction: "increment" | "decrement",
): number {
  validateSplitterDescriptor(descriptor);
  return stepNumericValue(descriptor.value, descriptor, direction);
}

/** Drag resolution: snaps a raw pointer-derived value to the same step grid keyboard resize uses. */
export function resolveSplitterDragValue(descriptor: SplitterDescriptor, rawValue: number): number {
  validateSplitterDescriptor(descriptor);
  return snapToStep(rawValue, descriptor);
}

/** Boundary jump for Home/End, reusing NumberField's clamp unchanged. */
export function resolveSplitterBoundaryValue(
  descriptor: SplitterDescriptor,
  boundary: "min" | "max",
): number {
  validateSplitterDescriptor(descriptor);
  return clampToRange(boundary === "min" ? descriptor.min : descriptor.max, descriptor);
}

/**
 * Reused visual language from Slider: a thin visible line (`thickness`) with
 * a much larger `hitTarget` — the same "small handle, 44-unit hit area"
 * split documented in `docs/slider.md`.
 */
export const splitterRecipe = {
  slots: ["root", "pane", "separator", "handle"] as const,
  defaults: { axis: "horizontal" },
  separator: {
    thickness: 1,
    hitTarget: control.minTouchTarget,
    color: semanticColors.border.default,
    hoverColor: semanticColors.border.strong,
    activeColor: semanticColors.border.focus,
  },
  states: { focus: focusIndicatorContract },
} as const satisfies {
  slots: readonly ["root", "pane", "separator", "handle"];
  defaults: { axis: SplitterAxis };
  separator: {
    thickness: number;
    hitTarget: number;
    color: ColorReference;
    hoverColor: ColorReference;
    activeColor: ColorReference;
  };
  states: { focus: typeof focusIndicatorContract };
};

/**
 * Deliberately excluded: collapse-to-hidden-pane (antd's collapsible
 * arrows) and N-pane/multi-separator layouts. Neither has measured product
 * demand, and both would roughly double this contract's surface (a
 * collapsed pane needs its own reveal affordance and bypasses `min`; N
 * panes need an ordered list of separators instead of one value) — the
 * same reasoning Slider used to leave out two-handle `range` mode.
 */
export const splitterBehavior = {
  controlled: ["value", "defaultValue", "onValueChange"],
  inputs: ["min", "max", "step", "label", "valueText"],
  stateAxes: {
    interaction: ["idle", "hover", "focusVisible", "pressed", "dragged"],
    availability: ["enabled", "disabled"],
  },
  web: {
    roles: ["separator"],
    keyboard: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"],
    focus: "native",
  },
  native: { roles: [], states: [], actions: [] },
  scenarios: [
    "separator-role-carries-aria-valuenow-min-max-and-optional-valuetext",
    "separator-orientation-is-perpendicular-to-the-splitter-axis-not-equal-to-it",
    "keyboard-arrow-keys-step-like-numberfield-home-and-end-jump-to-the-boundary",
    "drag-and-keyboard-resize-produce-the-same-snapped-value",
    "reuses-number-field-range-judgment-instead-of-a-new-numeric-domain",
    "no-collapse-to-hidden-pane-or-multi-separator-layout-in-this-contract",
  ],
} as const satisfies BehaviorContract;
