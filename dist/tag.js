import { semanticColors } from "./semantic-colors.js";
import { spacing, stroke } from "./foundations.js";
export const tagDefaults = {
    tone: "neutral",
};
function assertCopy(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Tag ${field} must not be empty`);
    }
}
const supportedTones = [
    "neutral",
    "info",
    "success",
    "attention",
    "brand",
];
export function validateTagDescriptor(descriptor) {
    assertCopy(descriptor.label, "label");
    if (descriptor.tone !== undefined &&
        !supportedTones.includes(descriptor.tone)) {
        throw new TypeError(`Unsupported Tag tone: ${String(descriptor.tone)}`);
    }
}
export function resolveTagDescriptor(descriptor) {
    validateTagDescriptor(descriptor);
    return {
        label: descriptor.label,
        tone: descriptor.tone ?? tagDefaults.tone,
    };
}
/**
 * Rectangular, not the pill `radius.full` that `chipRecipe` and `badgeRecipe`
 * use, so a static Tag never reads as a pressable Chip or a status Badge at a
 * glance. No `states` and no `focus` contract: nothing here is ever pressed
 * or focused.
 */
export const tagRecipe = {
    slots: ["root", "label"],
    defaults: tagDefaults,
    tones: {
        neutral: {
            background: semanticColors.surface.sunken,
            content: semanticColors.content.secondary,
            border: null,
        },
        brand: {
            background: semanticColors.surface.brand,
            content: semanticColors.content.brand,
            border: null,
        },
        info: {
            background: semanticColors.feedback.info.badgeBackground,
            content: semanticColors.feedback.info.foreground,
            border: semanticColors.feedback.info.border,
        },
        success: {
            background: semanticColors.feedback.success.badgeBackground,
            content: semanticColors.feedback.success.foreground,
            border: semanticColors.feedback.success.border,
        },
        attention: {
            background: semanticColors.feedback.attention.badgeBackground,
            content: semanticColors.feedback.attention.foreground,
            border: semanticColors.feedback.attention.border,
        },
    },
    size: {
        height: 20,
        paddingHorizontal: spacing.xxs,
        gap: spacing.xxs,
        textVariant: "caption",
        fontWeight: "600",
    },
    radius: "sm",
    borderWidth: stroke.default,
};
//# sourceMappingURL=tag.js.map