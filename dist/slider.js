import { focusIndicatorContract } from "./component-contracts.js";
import { control, opacity } from "./foundations.js";
import { assertFiniteNumber, numericRangeDefaults, snapToStep, validateNumericRangeConfig, } from "./number-field.js";
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
    const isPage = intent === "increment-page" || intent === "decrement-page";
    const direction = intent === "increment" || intent === "increment-page" ? 1 : -1;
    const magnitude = isPage ? step * sliderBehaviorDefaults.pageMultiplier : step;
    return snapToStep(descriptor.value + direction * magnitude, config);
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
};
//# sourceMappingURL=slider.js.map