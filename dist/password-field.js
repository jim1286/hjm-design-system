import { fieldFrameContract, focusIndicatorContract, formSupportContract, } from "./component-contracts.js";
import { control, opacity, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
function assertBoolean(value, field) {
    if (typeof value !== "boolean") {
        throw new TypeError(`PasswordField ${field} must be a boolean`);
    }
}
export function validatePasswordFieldDescriptor(descriptor) {
    assertBoolean(descriptor.revealed, "revealed");
    if (descriptor.autofillHint !== "current" && descriptor.autofillHint !== "new") {
        throw new TypeError(`Unsupported PasswordField autofillHint: ${String(descriptor.autofillHint)}`);
    }
}
/**
 * Toggling `revealed` only ever changes how the value is displayed — it
 * never touches the value itself. That guarantee is why this resolver takes
 * no value parameter at all: there is nothing here that could reach into it.
 */
export function resolvePasswordFieldDescriptor(descriptor, options) {
    validatePasswordFieldDescriptor(descriptor);
    if (typeof options.composeToggleAccessibleName !== "function") {
        throw new TypeError("PasswordField composeToggleAccessibleName must be a function");
    }
    const toggleAccessibleName = options.composeToggleAccessibleName({
        willReveal: !descriptor.revealed,
    });
    if (typeof toggleAccessibleName !== "string" ||
        toggleAccessibleName.trim().length === 0) {
        throw new TypeError("PasswordField composeToggleAccessibleName must return a non-empty string");
    }
    return {
        ...descriptor,
        toggleAccessibleName,
        webInputType: descriptor.revealed ? "text" : "password",
        nativeSecureTextEntry: !descriptor.revealed,
    };
}
/**
 * Reuses Field's frame and form support copy verbatim — the same judgment
 * NumberField already made (see src/number-field.ts) — and adds only the
 * toggle slot, styled like SearchField's trailing clear button (same
 * diameter/hit-slop convention) but with the visibility icon pair instead.
 */
export const passwordFieldRecipe = {
    slots: ["root", "frame", "input", "toggle", "description", "error"],
    defaults: { size: "medium" },
    frame: fieldFrameContract,
    support: formSupportContract,
    sizes: {
        medium: {
            minHeight: fieldFrameContract.minHeight,
            paddingHorizontal: fieldFrameContract.paddingHorizontal,
            textVariant: "body",
            toggleDiameter: control.minTouchTarget,
        },
        large: {
            minHeight: control.buttonHeight.large,
            paddingHorizontal: spacing.lg,
            textVariant: "bodyLarge",
            toggleDiameter: control.minTouchTarget,
        },
    },
    value: {
        color: semanticColors.content.body,
    },
    toggle: {
        /**
         * Icon mirrors the same action-not-state judgment as the accessible
         * name: concealed shows the "eye" (pressing reveals), revealed shows the
         * "eye-off" (pressing conceals).
         */
        icons: {
            concealed: "visibility",
            revealed: "visibilityOff",
        },
        color: semanticColors.content.secondary,
    },
    states: {
        focus: focusIndicatorContract,
        invalidBorder: semanticColors.border.danger,
        disabledOpacity: opacity.disabled,
    },
};
export const passwordFieldBehavior = {
    controlled: [
        "value",
        "defaultValue",
        "onValueChange",
        "revealed",
        "defaultRevealed",
        "onRevealedChange",
    ],
    inputs: ["autofillHint"],
    stateAxes: {
        availability: ["enabled", "disabled", "readOnly"],
        value: ["empty", "filled"],
        validation: ["valid", "invalid"],
    },
    web: {
        roles: ["textbox", "button"],
        keyboard: ["Tab", "Enter", "Space"],
        focus: "native",
    },
    native: {
        roles: ["text", "button"],
        states: ["disabled"],
        actions: ["focus", "setText", "toggleReveal"],
    },
    scenarios: [
        "toggle-never-changes-the-controlled-value",
        "toggle-and-value-are-independent-controlled-axes",
        "toggle-accessible-name-describes-the-action-not-the-current-state",
        "toggle-icon-mirrors-the-same-action-not-state-judgment",
        "toggle-is-its-own-tab-stop-after-the-field-like-searchfields-clear-button",
        "autofill-hint-is-a-required-product-decision-not-a-renderer-guess",
        "strength-meter-is-out-of-scope-product-policy",
    ],
};
//# sourceMappingURL=password-field.js.map