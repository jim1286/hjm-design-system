/**
 * PasswordField is Field's existing frame plus exactly one new problem: a
 * reveal toggle. It does not redeclare Field's own `value`/`onValueChange` —
 * a password's value is a plain string, identical to Field's, so there is
 * nothing new to contract there (unlike NumberField, whose value is a parsed
 * number). See docs/password-field.md.
 */
export type PasswordFieldAutofillHint = "current" | "new";
export type PasswordFieldDescriptor = Readonly<{
    revealed: boolean;
    /**
     * Which password-manager autofill bucket this field is for. Required, not
     * inferred — HJM cannot tell a login screen from a signup screen from the
     * descriptor alone, and guessing wrong actively harms the browser/OS
     * autofill suggestion. See docs/password-field.md for the platform
     * translation (Web autocomplete token, iOS textContentType, Android
     * autofill hint) — the exact attribute values are a renderer concern, not
     * asserted here.
     */
    autofillHint: PasswordFieldAutofillHint;
}>;
export declare function validatePasswordFieldDescriptor(descriptor: PasswordFieldDescriptor): void;
export type PasswordToggleAccessibleNameInfo = Readonly<{
    /**
     * The action pressing the toggle will perform — not whether the password
     * is currently masked. See docs/password-field.md for why the name must
     * describe the action.
     */
    willReveal: boolean;
}>;
export type ComposePasswordToggleAccessibleName = (info: PasswordToggleAccessibleNameInfo) => string;
export type ResolvedPasswordFieldDescriptor = PasswordFieldDescriptor & Readonly<{
    toggleAccessibleName: string;
    webInputType: "text" | "password";
    nativeSecureTextEntry: boolean;
}>;
export type ResolvePasswordFieldOptions = Readonly<{
    composeToggleAccessibleName: ComposePasswordToggleAccessibleName;
}>;
/**
 * Toggling `revealed` only ever changes how the value is displayed — it
 * never touches the value itself. That guarantee is why this resolver takes
 * no value parameter at all: there is nothing here that could reach into it.
 */
export declare function resolvePasswordFieldDescriptor(descriptor: PasswordFieldDescriptor, options: ResolvePasswordFieldOptions): ResolvedPasswordFieldDescriptor;
export type PasswordFieldSize = "medium" | "large";
/**
 * Reuses Field's frame and form support copy verbatim — the same judgment
 * NumberField already made (see src/number-field.ts) — and adds only the
 * toggle slot, styled like SearchField's trailing clear button (same
 * diameter/hit-slop convention) but with the visibility icon pair instead.
 */
export declare const passwordFieldRecipe: {
    readonly slots: readonly ["root", "frame", "input", "toggle", "description", "error"];
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
            readonly toggleDiameter: 44;
        };
        readonly large: {
            readonly minHeight: 52;
            readonly paddingHorizontal: 20;
            readonly textVariant: "bodyLarge";
            readonly toggleDiameter: 44;
        };
    };
    readonly value: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
    };
    readonly toggle: {
        /**
         * Icon mirrors the same action-not-state judgment as the accessible
         * name: concealed shows the "eye" (pressing reveals), revealed shows the
         * "eye-off" (pressing conceals).
         */
        readonly icons: {
            readonly concealed: "visibility";
            readonly revealed: "visibilityOff";
        };
        readonly color: Readonly<{
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
        readonly invalidBorder: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly disabledOpacity: 0.5;
    };
};
export declare const passwordFieldBehavior: {
    readonly controlled: readonly ["value", "defaultValue", "onValueChange", "revealed", "defaultRevealed", "onRevealedChange"];
    readonly inputs: readonly ["autofillHint"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled", "readOnly"];
        readonly value: readonly ["empty", "filled"];
        readonly validation: readonly ["valid", "invalid"];
    };
    readonly web: {
        readonly roles: readonly ["textbox", "button"];
        readonly keyboard: readonly ["Tab", "Enter", "Space"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["text", "button"];
        readonly states: readonly ["disabled"];
        readonly actions: readonly ["focus", "setText", "toggleReveal"];
    };
    readonly scenarios: readonly ["toggle-never-changes-the-controlled-value", "toggle-and-value-are-independent-controlled-axes", "toggle-accessible-name-describes-the-action-not-the-current-state", "toggle-icon-mirrors-the-same-action-not-state-judgment", "toggle-is-its-own-tab-stop-after-the-field-like-searchfields-clear-button", "autofill-hint-is-a-required-product-decision-not-a-renderer-guess", "strength-meter-is-out-of-scope-product-policy"];
};
//# sourceMappingURL=password-field.d.ts.map