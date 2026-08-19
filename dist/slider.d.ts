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
export type ResolvedSliderDescriptor = Omit<SliderDescriptor, "step"> & Readonly<{
    step: number;
}>;
export declare function validateSliderDescriptor(descriptor: SliderDescriptor): void;
export declare function resolveSliderDescriptor(descriptor: SliderDescriptor): ResolvedSliderDescriptor;
/** 0..1 position of `value` between `min` and `max`, for track fill — not a display string. */
export declare function resolveSliderFillFraction(descriptor: SliderDescriptor): number;
export type SliderStepIntent = "increment" | "decrement" | "increment-page" | "decrement-page" | "first" | "last";
export declare const sliderBehaviorDefaults: {
    readonly pageMultiplier: 10;
};
/**
 * One function for every keyboard/RN step intent so Web arrow/Home/End/
 * PageUp/PageDown and RN increment/decrement actions resolve through the same
 * snap-and-clamp judgment as the stepper itself.
 */
export declare function getSliderStepTarget(descriptor: SliderDescriptor, intent: SliderStepIntent): number;
export type SliderSize = "medium";
export declare const sliderRecipe: {
    readonly slots: readonly ["root", "track", "filledTrack", "thumb", "label", "valueLabel"];
    readonly defaults: {
        readonly size: "medium";
    };
    readonly sizes: {
        readonly medium: {
            readonly trackHeight: 4;
            readonly thumbDiameter: 20;
            readonly hitTarget: 44;
            readonly labelVariant: "body";
            readonly valueLabelVariant: "label";
        };
    };
    readonly colors: {
        readonly trackFilled: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly trackUnfilled: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly trackUnfilledBorder: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly thumb: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly thumbBorder: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly label: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly valueLabel: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly disabledOpacity: 0.5;
        readonly draggedOpacity: 0.64;
    };
    readonly radius: "full";
};
export declare const sliderBehavior: {
    readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
    readonly defaults: {
        readonly pageMultiplier: 10;
    };
    readonly stateAxes: {
        readonly interaction: readonly ["idle", "hover", "focusVisible", "pressed", "dragged"];
        readonly availability: readonly ["enabled", "disabled"];
    };
    readonly web: {
        readonly roles: readonly ["slider"];
        readonly keyboard: readonly ["Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["adjustable"];
        readonly states: readonly ["disabled"];
        readonly actions: readonly ["increment", "decrement"];
    };
    readonly scenarios: readonly ["label-then-value-then-range-announcement-order", "arrow-keys-step-by-one-increment", "page-keys-step-by-the-page-multiplier", "home-and-end-jump-to-min-and-max", "value-is-always-present-no-empty-state", "fill-color-is-never-the-only-value-cue", "range-two-handle-selection-is-out-of-scope-until-a-real-product-need-exists"];
};
//# sourceMappingURL=slider.d.ts.map