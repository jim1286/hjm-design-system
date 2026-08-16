import { shadow, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/** Internal visual fragments keep future recipes from inventing new chrome. */
export const focusIndicatorContract = {
  color: semanticColors.border.focus,
  width: stroke.focus,
  offset: 2,
} as const;

export const fieldFrameContract = {
  background: semanticColors.surface.default,
  border: semanticColors.content.secondary,
  focusBorder: semanticColors.border.focus,
  invalidBorder: semanticColors.border.danger,
  radius: "md" as const,
  borderWidth: stroke.default,
  minHeight: 44,
  paddingHorizontal: spacing.md,
} as const;

export const formSupportContract = {
  label: {
    color: semanticColors.content.body,
    textVariant: "body" as const,
    fontWeight: "600",
  },
  hint: { color: semanticColors.content.secondary, textVariant: "label" as const },
  error: { color: semanticColors.content.danger, textVariant: "label" as const },
  gap: spacing.xs,
} as const;

export const floatingSurfaceContract = {
  background: semanticColors.canvas,
  border: semanticColors.border.default,
  borderWidth: stroke.default,
  radius: "md" as const,
  shadow: shadow.floating,
  padding: spacing.xs,
} as const;

export const collectionItemContract = {
  minHeight: 44,
  paddingHorizontal: spacing.sm,
  gap: spacing.sm,
  radius: "md" as const,
  label: { color: semanticColors.content.body, textVariant: "body" as const },
  description: {
    color: semanticColors.content.secondary,
    textVariant: "label" as const,
  },
  highlightedBackground: semanticColors.interaction.hover,
  focus: focusIndicatorContract,
  selectedBackground: semanticColors.interaction.selected,
  selectedIndicator: semanticColors.border.focus,
  danger: semanticColors.content.danger,
} as const;
