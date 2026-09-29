import { fontWeight, shadow, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
/** Internal visual fragments keep future recipes from inventing new chrome. */
export const focusIndicatorContract = {
    color: semanticColors.border.focus,
    width: stroke.focus,
    offset: 2,
};
export const fieldFrameContract = {
    // White in the light theme, theme canvas in dark; selection/focus remains an outline signal.
    background: semanticColors.canvas,
    border: semanticColors.border.control,
    focusBorder: semanticColors.border.focus,
    invalidBorder: semanticColors.border.danger,
    radius: "md",
    borderWidth: stroke.default,
    minHeight: 44,
    paddingHorizontal: spacing.md,
};
export const formSupportContract = {
    label: {
        color: semanticColors.content.body,
        textVariant: "body",
        fontWeight: fontWeight.semibold,
    },
    hint: { color: semanticColors.content.secondary, textVariant: "label" },
    error: { color: semanticColors.content.danger, textVariant: "label" },
    gap: spacing.xs,
};
export const floatingSurfaceContract = {
    background: semanticColors.canvas,
    border: semanticColors.border.default,
    borderWidth: stroke.default,
    radius: "md",
    shadow: shadow.floating,
    padding: spacing.xs,
};
export const collectionItemContract = {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    radius: "md",
    label: { color: semanticColors.content.body, textVariant: "body" },
    description: {
        color: semanticColors.content.secondary,
        textVariant: "label",
    },
    highlightedBackground: semanticColors.canvas,
    focus: focusIndicatorContract,
    selectedBackground: semanticColors.canvas,
    selectedIndicator: semanticColors.border.focus,
    danger: semanticColors.content.danger,
};
//# sourceMappingURL=component-contracts.js.map