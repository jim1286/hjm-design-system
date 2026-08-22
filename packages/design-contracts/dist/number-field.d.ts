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
export declare const numericRangeDefaults: {
    readonly step: 1;
};
export declare function assertFiniteNumber(value: number, field: string): void;
export declare function validateNumericRangeConfig(config: NumericRangeConfig): void;
export declare function clampToRange(value: number, config: NumericRangeConfig): number;
/** Snaps to the nearest step from `min`, then clamps into [min, max]. */
export declare function snapToStep(value: number, config: NumericRangeConfig): number;
/** Move to the next valid grid boundary in the requested direction. */
export declare function stepNumericValue(value: number, config: NumericRangeConfig, direction: "increment" | "decrement"): number;
/**
 * `null` means no value has been entered yet — distinct from any in-range
 * number, including `min`. Products decide whether empty is allowed to submit.
 */
export type NumberFieldValue = number | null;
/**
 * Parses the renderer's editable text without guessing at locale, currency,
 * or unit formatting. Empty text is a first-class `null` value; `undefined`
 * means the draft is not a complete finite decimal number yet.
 *
 * Exponent notation is accepted because `String(number)` may produce it for
 * very small or large finite values. Renderers keep incomplete drafts such as
 * `-` or `1e` locally and only commit once this parser succeeds.
 */
export declare function parseNumberFieldInput(input: string): NumberFieldValue | undefined;
/**
 * Turns an editable draft into a model value at blur/submit boundaries.
 * Direct input is clamped and snapped with the same range math used by the
 * steppers and Slider. Invalid/incomplete text remains `undefined`, allowing a
 * renderer to restore the last committed value without inventing an error.
 */
export declare function commitNumberFieldInput(input: string, config: NumericRangeConfig): NumberFieldValue | undefined;
export type NumberFieldDescriptor = Readonly<{
    value: NumberFieldValue;
    min: number;
    max: number;
    step?: number;
}>;
export type ResolvedNumberFieldDescriptor = Omit<NumberFieldDescriptor, "step"> & Readonly<{
    step: number;
}>;
export declare function validateNumberFieldDescriptor(descriptor: NumberFieldDescriptor): void;
export declare function resolveNumberFieldDescriptor(descriptor: NumberFieldDescriptor): ResolvedNumberFieldDescriptor;
export type NumberFieldStepperState = Readonly<{
    incrementDisabled: boolean;
    decrementDisabled: boolean;
}>;
/** Empty has no boundary yet, so neither stepper direction is disabled. */
export declare function resolveNumberFieldStepperState(descriptor: NumberFieldDescriptor): NumberFieldStepperState;
/** Resolve stepper availability from the visible draft, falling back safely. */
export declare function resolveNumberFieldInputStepperState(input: string, descriptor: NumberFieldDescriptor): NumberFieldStepperState;
/** Stepping from empty lands on the boundary you are moving toward. */
export declare function stepNumberFieldValue(descriptor: NumberFieldDescriptor, direction: "increment" | "decrement"): number;
/**
 * Resolves a step action from the editable draft without first snapping and
 * then stepping a second time. Off-grid drafts move to the next valid boundary
 * in the requested direction; invalid drafts fall back to the committed model.
 */
export declare function stepNumberFieldInput(input: string, descriptor: NumberFieldDescriptor, direction: "increment" | "decrement"): number;
export type NumberFieldSize = "medium" | "large";
/**
 * Reuses the Field frame (`fieldFrameContract`) and form support copy
 * (`formSupportContract`) verbatim — a second field frame would drift from
 * Field the first time either one's border or height changes.
 */
export declare const numberFieldRecipe: {
    readonly slots: readonly ["root", "frame", "input", "decrement", "increment", "description", "error"];
    readonly defaults: {
        readonly size: "medium";
    };
    readonly frame: {
        readonly background: Readonly<{
            source: "theme";
            key: "surface";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly focusBorder: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly invalidBorder: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly radius: "md";
        readonly borderWidth: 1;
        readonly minHeight: 44;
        readonly paddingHorizontal: 16;
    };
    readonly support: {
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "600";
        };
        readonly hint: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly gap: 8;
    };
    readonly sizes: {
        readonly medium: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly textVariant: "body";
            readonly stepperDiameter: 44;
        };
        readonly large: {
            readonly minHeight: 52;
            readonly paddingHorizontal: 20;
            readonly textVariant: "bodyLarge";
            readonly stepperDiameter: 44;
        };
    };
    readonly value: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly numericVariant: "tabular";
    };
    readonly stepper: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly minTarget: 44;
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
        readonly invalidBorder: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly disabledOpacity: 0.5;
    };
};
/**
 * Held-repeat on the stepper buttons is deliberately not part of this
 * contract: no product using NumberField has measured demand for press-and-
 * hold, and adding it now would mean guessing at a repeat-rate/acceleration
 * curve nobody has validated. A single activation per press only.
 */
export declare const numberFieldBehavior: {
    readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled", "readOnly"];
        readonly value: readonly ["empty", "filled"];
        readonly validation: readonly ["valid", "invalid"];
    };
    readonly web: {
        readonly roles: readonly ["spinbutton"];
        readonly keyboard: readonly ["Tab", "ArrowUp", "ArrowDown"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["text", "button"];
        readonly states: readonly ["disabled"];
        readonly actions: readonly ["focus", "setText", "increment", "decrement"];
    };
    readonly scenarios: readonly ["value-and-range-are-independent-controlled-inputs", "stepper-buttons-disable-at-min-and-max", "empty-disables-neither-stepper-direction", "keyboard-arrow-up-down-step-like-the-stepper-buttons", "invalid-is-a-numberfield-only-axis-independent-of-range", "held-repeat-is-not-part-of-the-contract"];
};
//# sourceMappingURL=number-field.d.ts.map