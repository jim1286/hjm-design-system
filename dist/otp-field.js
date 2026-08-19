import { fieldFrameContract, focusIndicatorContract, formSupportContract, } from "./component-contracts.js";
import { control, opacity, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export function validateOtpFieldDescriptor(descriptor) {
    if (!Number.isInteger(descriptor.length) || descriptor.length < 2) {
        throw new RangeError("OtpField length must be an integer of at least two slots");
    }
    if (typeof descriptor.value !== "string" || !/^\d*$/.test(descriptor.value)) {
        throw new TypeError("OtpField value must be a string of digits only");
    }
    if (descriptor.value.length > descriptor.length) {
        throw new RangeError("OtpField value must not be longer than length");
    }
}
/** One entry per slot: the digit at that position, or "" for an unfilled slot. Always dense — no gaps. */
export function getOtpFieldSlotValues(descriptor) {
    validateOtpFieldDescriptor(descriptor);
    return Array.from({ length: descriptor.length }, (_, index) => descriptor.value[index] ?? "");
}
export function resolveOtpFieldDescriptor(descriptor) {
    validateOtpFieldDescriptor(descriptor);
    return {
        ...descriptor,
        slots: getOtpFieldSlotValues(descriptor),
        complete: descriptor.value.length === descriptor.length,
    };
}
/**
 * The single hard accessibility judgment this contract makes: OtpField is
 * ONE focusable, one accessible-name-and-value text control, not N separate
 * focusable slots. N separate real inputs is the well-documented
 * accessibility anti-pattern the brief names directly — a screen reader
 * announcing "slot 3 of 6" tells the user nothing about what they are
 * entering. The N visible boxes are a decorative rendering of one control's
 * characters (`getOtpFieldSlotValues`), the same way a styled `<input>` with
 * letter-spacing can look segmented while remaining one field. See
 * docs/otp-field.md.
 *
 * Because there is one real control, typing, backspacing, and pasting
 * (anywhere, including mid-string) are the platform's own native text
 * editing — insertion, deletion, and paste-over-a-selection are not
 * reimplemented here. The only judgment HJM owns is what happens to the
 * resulting raw string: keep digits only, never exceed `length`. This is
 * intentionally the one function this module needs for every edit path.
 */
export function resolveOtpFieldValue(length, rawText) {
    if (!Number.isInteger(length) || length < 2) {
        throw new RangeError("OtpField length must be an integer of at least two slots");
    }
    if (typeof rawText !== "string") {
        throw new TypeError("OtpField rawText must be a string");
    }
    return rawText.replace(/\D/g, "").slice(0, length);
}
/**
 * The `slot` boxes reuse Field's own border/focus/invalid colors
 * (`fieldFrameContract`) instead of inventing a new palette — each is a
 * small Field-frame look-alike, not a new visual language.
 */
export const otpFieldRecipe = {
    slots: ["root", "input", "slot", "description", "error"],
    defaults: { size: "medium" },
    support: formSupportContract,
    sizes: {
        medium: {
            slotSize: control.minTouchTarget,
            gap: spacing.xs,
            textVariant: "title",
        },
        large: {
            slotSize: control.buttonHeight.large,
            gap: spacing.sm,
            textVariant: "titleLarge",
        },
    },
    slot: {
        border: fieldFrameContract.border,
        focusBorder: fieldFrameContract.focusBorder,
        invalidBorder: fieldFrameContract.invalidBorder,
        filledBorder: semanticColors.content.brand,
        radius: fieldFrameContract.radius,
        borderWidth: fieldFrameContract.borderWidth,
        content: semanticColors.content.primary,
    },
    states: {
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
    },
};
export const otpFieldBehavior = {
    controlled: ["value", "defaultValue", "onValueChange"],
    stateAxes: {
        availability: ["enabled", "disabled", "readOnly", "busy"],
        value: ["empty", "filled"],
        validation: ["valid", "invalid"],
    },
    web: {
        roles: ["textbox"],
        keyboard: ["Tab", "ArrowLeft", "ArrowRight", "Home", "End"],
        focus: "native",
    },
    native: {
        roles: ["text"],
        states: ["disabled", "busy"],
        actions: ["focus", "setText"],
    },
    scenarios: [
        "one-accessible-name-and-value-for-the-whole-field-never-per-slot-announcement",
        "one-tab-stop-native-text-editing-owns-typing-backspacing-and-paste",
        "paste-anywhere-in-the-value-is-sanitized-to-digits-and-clamped-to-length",
        "non-digit-characters-are-stripped-not-rejected-outright",
        "resolveOtpFieldValue-truncates-typed-or-pasted-overflow-instead-of-throwing",
        "a-too-long-committed-descriptor-still-throws-as-malformed-state",
        "alphanumeric-otp-is-out-of-scope-until-a-real-product-need-exists",
    ],
};
//# sourceMappingURL=otp-field.js.map