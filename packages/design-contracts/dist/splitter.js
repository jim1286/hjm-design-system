import { focusIndicatorContract } from "./component-contracts.js";
import { clampToRange, snapToStep, stepNumericValue, validateNumericRangeConfig, } from "./number-field.js";
import { control } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const splitterDefaults = {
    axis: "horizontal",
};
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`Splitter ${field} must not be empty`);
    }
}
export function validateSplitterDescriptor(descriptor) {
    validateNumericRangeConfig(descriptor);
    if (descriptor.value < descriptor.min || descriptor.value > descriptor.max) {
        throw new RangeError("Splitter value must be within min and max");
    }
    if (descriptor.axis !== undefined &&
        descriptor.axis !== "horizontal" &&
        descriptor.axis !== "vertical") {
        throw new TypeError(`Unsupported Splitter axis: ${String(descriptor.axis)}`);
    }
    assertNonEmpty(descriptor.label, "label");
    if (descriptor.valueText !== undefined)
        assertNonEmpty(descriptor.valueText, "valueText");
}
/**
 * A WAI-ARIA `separator` reports orientation as the axis the pointer moves
 * *along*, which is perpendicular to how the panes are arranged — a
 * side-by-side (`"horizontal"`) splitter has a *vertical* separator bar.
 * Named and exported so renderers translate this once instead of
 * re-deriving the inversion at each call site.
 */
export function resolveSplitterSeparatorOrientation(axis) {
    return axis === "horizontal" ? "vertical" : "horizontal";
}
/** Keyboard step, reusing NumberField's stepper arithmetic unchanged. */
export function getNextSplitterValue(descriptor, direction) {
    validateSplitterDescriptor(descriptor);
    return stepNumericValue(descriptor.value, descriptor, direction);
}
/** Drag resolution: snaps a raw pointer-derived value to the same step grid keyboard resize uses. */
export function resolveSplitterDragValue(descriptor, rawValue) {
    validateSplitterDescriptor(descriptor);
    return snapToStep(rawValue, descriptor);
}
/** Boundary jump for Home/End, reusing NumberField's clamp unchanged. */
export function resolveSplitterBoundaryValue(descriptor, boundary) {
    validateSplitterDescriptor(descriptor);
    return clampToRange(boundary === "min" ? descriptor.min : descriptor.max, descriptor);
}
/**
 * Reused visual language from Slider: a thin visible line (`thickness`) with
 * a much larger `hitTarget` — the same "small handle, 44-unit hit area"
 * split documented in `docs/slider.md`.
 */
export const splitterRecipe = {
    slots: ["root", "pane", "separator", "handle"],
    defaults: { axis: "horizontal" },
    separator: {
        thickness: 1,
        hitTarget: control.minTouchTarget,
        color: semanticColors.border.default,
        hoverColor: semanticColors.border.strong,
        activeColor: semanticColors.border.focus,
    },
    states: { focus: focusIndicatorContract },
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
};
//# sourceMappingURL=splitter.js.map