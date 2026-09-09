import type { ThemeColors } from "./colors.js";
import { control, fontWeight, radius, spacing, typography } from "./foundations.js";
import type { FontWeightValue, TextVariant } from "./foundations.js";

export type ButtonTone = "primary" | "secondary" | "ghost" | "danger" | "link";
/** Corner geometry of the control frame. Mirrors `IconButtonShape`. */
export type ButtonShape = "rounded" | "pill";
/**
 * Where the label sits inside the frame. `center` is the action default;
 * `leading` is for a full-width row action whose label reads as list copy.
 */
export type ButtonAlign = "center" | "leading";
export type ButtonSize = keyof typeof control.buttonHeight;
export type SurfaceTone = "default" | "raised" | "accent" | "sunken" | "subtle";
export type SurfacePadding = "none" | keyof typeof spacing;
export type SurfaceRadius = keyof typeof radius;
export type FieldVariant = "surface" | "inset";
export type FieldShape = "medium" | "large" | "full";

/** Small renderer entry point for the three foundational visual recipes. */
export const buttonRecipe = {
  slots: ["root", "leading", "label", "trailing", "spinner"] as const,
  defaults: { tone: "primary", size: "medium", shape: "rounded", align: "center" } as const,
  tones: {
    primary: { background: "primary", content: "onPrimary", border: null, paddingHorizontal: null },
    // The outline is a border role, not a text color. Drawing it in `textSub`
    // made a resting control read heavier than the selected one beside it.
    secondary: { background: "surfaceAlt", content: "text", border: "borderControl", paddingHorizontal: null },
    ghost: { background: null, content: "textMuted", border: null, paddingHorizontal: null },
    danger: { background: "dangerFill", content: "onDanger", border: null, paddingHorizontal: null },
    // A link-tone control is inline copy, so the size axis' horizontal padding
    // would push it out of alignment with the text around it.
    link: { background: null, content: "contentBrand", border: null, paddingHorizontal: 0 },
  },
  /**
   * Visual treatment for a control that is also a toggle. `accessibilityState`
   * / `aria-pressed` already expressed the state; without a paired visual every
   * consumer painted the selected background in product styles.
   */
  states: {
    selected: { background: "surfaceAccent", content: "contentBrand", border: "contentBrand" },
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
  shapes: { rounded: "md", pill: "full" },
  aligns: { center: "center", leading: "flex-start" },
  opacity: { disabled: 0.5, pressed: 0.86 },
} as const satisfies {
  slots: readonly string[];
  defaults: { tone: ButtonTone; size: ButtonSize; shape: ButtonShape; align: ButtonAlign };
  tones: Record<
    ButtonTone,
    {
      background: keyof ThemeColors | null;
      content: keyof ThemeColors;
      border: keyof ThemeColors | null;
      /** `null` keeps the size axis' padding. */
      paddingHorizontal: number | null;
    }
  >;
  states: {
    selected: {
      background: keyof ThemeColors;
      content: keyof ThemeColors;
      border: keyof ThemeColors;
    };
  };
  sizes: Record<
    ButtonSize,
    {
      height: number;
      hitSlop: number;
      paddingHorizontal: number;
      textVariant: TextVariant;
    }
  >;
  shapes: Record<ButtonShape, keyof typeof radius>;
  aligns: Record<ButtonAlign, "center" | "flex-start">;
  opacity: { disabled: number; pressed: number };
};

export const surfaceRecipe = {
  default: {
    background: "surface",
    border: "border",
    borderAlpha: 1,
    elevated: false,
    borderAlways: false,
    clipsContent: true,
  },
  raised: {
    background: "bg",
    border: "border",
    borderAlpha: 1,
    elevated: true,
    borderAlways: false,
    // An elevated surface must not clip: `overflow: hidden` cuts off its own
    // shadow. Every other tone clips so a child image cannot spill past the
    // rounded corner, which consumers were fixing in product styles.
    clipsContent: false,
  },
  // `semanticColors.surface.sunken` already named this role; without a paired
  // tone a consumer had to paint `surfaceAlt` in its own product styles.
  sunken: {
    background: "surfaceAlt",
    border: "border",
    borderAlpha: 1,
    elevated: false,
    borderAlways: false,
    clipsContent: true,
  },
  accent: {
    background: "surfaceAccent",
    border: "primary",
    borderAlpha: 0.3,
    elevated: false,
    borderAlways: false,
    clipsContent: true,
  },
  subtle: {
    background: "bg",
    border: "border",
    borderAlpha: 1,
    elevated: false,
    borderAlways: true,
    clipsContent: true,
  },
} as const satisfies Record<
  SurfaceTone,
  {
    background: keyof ThemeColors;
    border: keyof ThemeColors;
    borderAlpha: number;
    elevated: boolean;
    clipsContent: boolean;
    borderAlways: boolean;
  }
>;

export const fieldRecipe = {
  slots: [
    "root",
    "label",
    "control",
    "leading",
    "input",
    "trailing",
    "hint",
    "error",
  ] as const,
  defaults: { variant: "surface", shape: "medium" } as const,
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
    idle: { border: "textMuted" },
    focused: { border: "contentBrand" },
    invalid: { border: "danger" },
  },
  minHeight: control.minTouchTarget,
  multilineMinHeight: 80,
  /**
   * Upper bound for a growing multiline field, expressed in visible lines. A
   * consumer otherwise reaches for `inputStyle={{ maxHeight }}`, which moves a
   * recipe-owned dimension into product code. `null` keeps unbounded growth.
   */
  multilineMaxVisibleLines: null as number | null,
  borderWidth: 1,
  focusRingWidth: 2,
  focusRingOffset: 2,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  textVariant: "body",
  label: {
    color: "textBody",
    textVariant: "body",
    fontWeight: fontWeight.semibold,
    gap: spacing.xs,
  },
  support: {
    hintColor: "textMuted",
    errorColor: "danger",
    textVariant: "label",
    gap: 6,
  },
  placeholder: { color: "textMuted" },
  disabledOpacity: 0.6,
} as const satisfies {
  slots: readonly string[];
  defaults: { variant: FieldVariant; shape: FieldShape };
  variants: Record<FieldVariant, { background: keyof ThemeColors }>;
  shapes: Record<FieldShape, keyof typeof radius>;
  states: Record<
    "idle" | "focused" | "invalid",
    { border: keyof ThemeColors }
  >;
  minHeight: number;
  multilineMinHeight: number;
  multilineMaxVisibleLines: number | null;
  borderWidth: number;
  focusRingWidth: number;
  focusRingOffset: number;
  paddingHorizontal: number;
  paddingVertical: number;
  textVariant: keyof typeof typography;
  label: {
    color: keyof ThemeColors;
    textVariant: keyof typeof typography;
    fontWeight: FontWeightValue;
    gap: number;
  };
  support: {
    hintColor: keyof ThemeColors;
    errorColor: keyof ThemeColors;
    textVariant: keyof typeof typography;
    gap: number;
  };
  placeholder: { color: keyof ThemeColors };
  disabledOpacity: number;
};

/**
 * Renderer-neutral Surface geometry. Tone colors stay in `surfaceRecipe` for
 * compatibility; these axes make the previously implicit Web/Native defaults
 * explicit without changing that public recipe shape.
 */
export const surfaceDefaults = {
  tone: "default",
  padding: "none",
  radius: "lg",
  bordered: false,
} as const satisfies {
  tone: SurfaceTone;
  padding: SurfacePadding;
  radius: SurfaceRadius;
  bordered: boolean;
};

export const surfaceGeometry = {
  paddings: { none: 0, ...spacing },
  radii: radius,
} as const satisfies {
  paddings: Record<SurfacePadding, number>;
  radii: Record<SurfaceRadius, number>;
};
