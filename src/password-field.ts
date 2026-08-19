import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import type { SemanticIconName } from "./icon.js";
import {
  fieldFrameContract,
  focusIndicatorContract,
  formSupportContract,
} from "./component-contracts.js";
import { control, opacity, spacing, type TextVariant } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

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

function assertBoolean(value: boolean, field: string): void {
  if (typeof value !== "boolean") {
    throw new TypeError(`PasswordField ${field} must be a boolean`);
  }
}

export function validatePasswordFieldDescriptor(
  descriptor: PasswordFieldDescriptor,
): void {
  assertBoolean(descriptor.revealed, "revealed");
  if (descriptor.autofillHint !== "current" && descriptor.autofillHint !== "new") {
    throw new TypeError(
      `Unsupported PasswordField autofillHint: ${String(descriptor.autofillHint)}`,
    );
  }
}

export type PasswordToggleAccessibleNameInfo = Readonly<{
  /**
   * The action pressing the toggle will perform — not whether the password
   * is currently masked. See docs/password-field.md for why the name must
   * describe the action.
   */
  willReveal: boolean;
}>;

export type ComposePasswordToggleAccessibleName = (
  info: PasswordToggleAccessibleNameInfo,
) => string;

export type ResolvedPasswordFieldDescriptor = PasswordFieldDescriptor &
  Readonly<{
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
export function resolvePasswordFieldDescriptor(
  descriptor: PasswordFieldDescriptor,
  options: ResolvePasswordFieldOptions,
): ResolvedPasswordFieldDescriptor {
  validatePasswordFieldDescriptor(descriptor);
  if (typeof options.composeToggleAccessibleName !== "function") {
    throw new TypeError(
      "PasswordField composeToggleAccessibleName must be a function",
    );
  }
  const toggleAccessibleName = options.composeToggleAccessibleName({
    willReveal: !descriptor.revealed,
  });
  if (
    typeof toggleAccessibleName !== "string" ||
    toggleAccessibleName.trim().length === 0
  ) {
    throw new TypeError(
      "PasswordField composeToggleAccessibleName must return a non-empty string",
    );
  }
  return {
    ...descriptor,
    toggleAccessibleName,
    webInputType: descriptor.revealed ? "text" : "password",
    nativeSecureTextEntry: !descriptor.revealed,
  };
}

export type PasswordFieldSize = "medium" | "large";

/**
 * Reuses Field's frame and form support copy verbatim — the same judgment
 * NumberField already made (see src/number-field.ts) — and adds only the
 * toggle slot, styled like SearchField's trailing clear button (same
 * diameter/hit-slop convention) but with the visibility icon pair instead.
 */
export const passwordFieldRecipe = {
  slots: ["root", "frame", "input", "toggle", "description", "error"] as const,
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
} as const satisfies {
  slots: readonly string[];
  defaults: { size: PasswordFieldSize };
  frame: typeof fieldFrameContract;
  support: typeof formSupportContract;
  sizes: Record<
    PasswordFieldSize,
    {
      minHeight: number;
      paddingHorizontal: number;
      textVariant: TextVariant;
      toggleDiameter: number;
    }
  >;
  value: { color: ColorReference };
  toggle: {
    icons: Readonly<{ concealed: SemanticIconName; revealed: SemanticIconName }>;
    color: ColorReference;
  };
  states: {
    focus: typeof focusIndicatorContract;
    invalidBorder: ColorReference;
    disabledOpacity: number;
  };
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
} as const satisfies BehaviorContract;
