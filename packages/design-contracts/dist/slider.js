import { focusIndicatorContract } from "./component-contracts.js";
import { control, opacity } from "./foundations.js";
import { assertFiniteNumber, numericRangeDefaults, snapToStep, stepNumericValue, validateNumericRangeConfig, } from "./number-field.js";
import { semanticColors } from "./semantic-colors.js";
function assertNonEmptyCopy(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Slider ${field} must not be empty`);
    }
}
export function validateSliderDescriptor(descriptor) {
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
export function resolveSliderDescriptor(descriptor) {
    validateSliderDescriptor(descriptor);
    return { ...descriptor, step: descriptor.step ?? numericRangeDefaults.step };
}
/** 0..1 position of `value` between `min` and `max`, for track fill — not a display string. */
export function resolveSliderFillFraction(descriptor) {
    validateSliderDescriptor(descriptor);
    return (descriptor.value - descriptor.min) / (descriptor.max - descriptor.min);
}
/**
 * Snaps user-originated input with NumberField's min-origin range math while
 * preserving Slider's exact endpoints. Public controlled values may be
 * off-grid; they remain untouched until a user interaction proposes a value.
 */
export function resolveSliderValue(descriptor, candidate) {
    validateSliderDescriptor(descriptor);
    assertFiniteNumber(candidate, "candidate");
    if (candidate <= descriptor.min)
        return descriptor.min;
    if (candidate >= descriptor.max)
        return descriptor.max;
    return snapToStep(candidate, descriptor);
}
/**
 * Maps a pointer/touch offset to a min-origin step. RTL mirrors the physical
 * track while preserving the logical meaning of increment/decrement.
 */
export function resolveSliderValueFromOffset(descriptor, offset, extent, direction) {
    validateSliderDescriptor(descriptor);
    assertFiniteNumber(offset, "offset");
    assertFiniteNumber(extent, "extent");
    if (extent <= 0)
        throw new RangeError("Slider extent must be greater than 0");
    const physicalFraction = Math.min(1, Math.max(0, offset / extent));
    const logicalFraction = direction === "rtl" ? 1 - physicalFraction : physicalFraction;
    return resolveSliderValue(descriptor, descriptor.min + logicalFraction * (descriptor.max - descriptor.min));
}
export const sliderBehaviorDefaults = {
    pageMultiplier: 10,
};
/**
 * One function for every keyboard/RN step intent so Web arrow/Home/End/
 * PageUp/PageDown and RN increment/decrement actions resolve through the same
 * snap-and-clamp judgment as the stepper itself.
 */
export function getSliderStepTarget(descriptor, intent) {
    validateSliderDescriptor(descriptor);
    if (intent === "first")
        return descriptor.min;
    if (intent === "last")
        return descriptor.max;
    const step = descriptor.step ?? numericRangeDefaults.step;
    const config = { min: descriptor.min, max: descriptor.max, step };
    if (intent === "increment" || intent === "decrement") {
        return stepNumericValue(descriptor.value, config, intent);
    }
    const direction = intent === "increment-page" ? 1 : -1;
    return resolveSliderValue(descriptor, descriptor.value + direction * step * sliderBehaviorDefaults.pageMultiplier);
}
export const sliderRecipe = {
    slots: ["root", "track", "filledTrack", "thumb", "label", "valueLabel"],
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
};
export const sliderBehavior = {
    controlled: ["value", "defaultValue", "onValueChange"],
    events: ["onValueChangeEnd"],
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
        "rtl-mirrors-the-track-without-reversing-logical-increment-actions",
        "continuous-change-and-interaction-end-are-separate-events",
        "non-divisible-ranges-preserve-exact-min-and-max-endpoints",
        "native-disable-during-drag-finishes-once-and-ignores-later-moves",
        "value-is-always-present-no-empty-state",
        "fill-color-is-never-the-only-value-cue",
        "range-two-handle-selection-is-out-of-scope-until-a-real-product-need-exists",
    ],
};
//# sourceMappingURL=slider.js.map