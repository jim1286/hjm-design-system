import type { ThemeColors } from "./colors.js";
import { control, radius, spacing, typography } from "./foundations.js";
import type { TextVariant } from "./foundations.js";

export type ButtonTone = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = keyof typeof control.buttonHeight;
export type SurfaceTone = "default" | "raised" | "accent";
export type FieldVariant = "surface" | "inset";
export type FieldShape = "medium" | "large" | "full";

/** Typed recipe; platform renderers translate the same intent to their own primitives. */
export const buttonRecipe = {
  tones: {
    primary: { background: "primary", content: "onPrimary", border: null },
    secondary: { background: "surfaceAlt", content: "text", border: "border" },
    ghost: { background: null, content: "textMuted", border: null },
    danger: { background: "dangerFill", content: "onDanger", border: null },
  },
  sizes: {
    small: {
      height: control.buttonHeight.small,
      hitSlop: control.buttonHitSlop.small,
      paddingHorizontal: spacing.sm,
      textVariant: "label",
    },
    medium: {
      height: control.buttonHeight.medium,
      hitSlop: control.buttonHitSlop.medium,
      paddingHorizontal: spacing.md,
      textVariant: "body",
    },
    large: {
      height: control.buttonHeight.large,
      hitSlop: control.buttonHitSlop.large,
      paddingHorizontal: spacing.lg,
      textVariant: "bodyLarge",
    },
  },
  opacity: {
    disabled: 0.5,
    pressed: 0.86,
  },
} as const satisfies {
  tones: Record<
    ButtonTone,
    {
      background: keyof ThemeColors | null;
      content: keyof ThemeColors;
      border: keyof ThemeColors | null;
    }
  >;
  sizes: Record<
    ButtonSize,
    {
      height: number;
      hitSlop: number;
      paddingHorizontal: number;
      textVariant: TextVariant;
    }
  >;
  opacity: { disabled: number; pressed: number };
};

export const surfaceRecipe = {
  default: {
    background: "surface",
    border: "border",
    borderAlpha: 1,
    elevated: false,
  },
  raised: {
    background: "bg",
    border: "border",
    borderAlpha: 1,
    elevated: true,
  },
  accent: {
    background: "surfaceAccent",
    border: "primary",
    borderAlpha: 0.3,
    elevated: false,
  },
} as const satisfies Record<
  SurfaceTone,
  {
    background: keyof ThemeColors;
    border: keyof ThemeColors;
    borderAlpha: number;
    elevated: boolean;
  }
>;

export const fieldRecipe = {
  variants: {
    surface: { background: "surface" },
    inset: { background: "bg" },
  },
  shapes: {
    medium: "md",
    large: "lg",
    full: "full",
  },
  states: {
    idle: { border: "textWeak" },
    focused: { border: "primary" },
    invalid: { border: "danger" },
  },
  minHeight: control.minTouchTarget,
  multilineMinHeight: 80,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  textVariant: "body",
  disabledOpacity: 0.6,
} as const satisfies {
  variants: Record<FieldVariant, { background: keyof ThemeColors }>;
  shapes: Record<FieldShape, keyof typeof radius>;
  states: Record<
    "idle" | "focused" | "invalid",
    { border: keyof ThemeColors }
  >;
  minHeight: number;
  multilineMinHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
  textVariant: keyof typeof typography;
  disabledOpacity: number;
};
