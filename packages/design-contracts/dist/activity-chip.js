import { control, fontWeight, opacity, radius, spacing, stroke, } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const activityChipDefaults = {
    emphasis: "default",
    expanded: false,
};
/** Validates product copy once so Web and Native reject the same empty labels. */
export function resolveActivityChipDescriptor(descriptor) {
    if (typeof descriptor.label !== "string" || !descriptor.label.trim()) {
        throw new TypeError("ActivityChip label must not be empty");
    }
    if (descriptor.accessibilityLabel !== undefined &&
        (typeof descriptor.accessibilityLabel !== "string" || !descriptor.accessibilityLabel.trim())) {
        throw new TypeError("ActivityChip accessibilityLabel must not be empty");
    }
    const emphasis = descriptor.emphasis ?? activityChipDefaults.emphasis;
    if (emphasis !== "default" && emphasis !== "emphasis") {
        throw new TypeError(`Unsupported ActivityChip emphasis: ${String(emphasis)}`);
    }
    if (descriptor.expanded !== undefined && typeof descriptor.expanded !== "boolean") {
        throw new TypeError("ActivityChip expanded must be a boolean");
    }
    return {
        label: descriptor.label,
        accessibilityLabel: descriptor.accessibilityLabel ?? descriptor.label,
        emphasis,
        expanded: descriptor.expanded ?? activityChipDefaults.expanded,
    };
}
export const activityChipRecipe = {
    slots: ["root", "media", "label"],
    defaults: activityChipDefaults,
    // The 44pt minimum keeps the whole chip one touch target; the width cap keeps a header's side
    // controls visible on a 320pt screen (BurnTok header: back 44 + three actions ~150).
    root: {
        minHeight: control.minTouchTarget,
        maxWidth: 180,
        radius: "full",
        borderWidth: stroke.default,
        gap: spacing.xxs,
        // The media hugs the start edge like an avatar chip; the label end keeps the wider pill inset.
        paddingStart: spacing.xxs,
        paddingEnd: spacing.sm,
        pressedOpacity: opacity.pressed,
    },
    // 28 keeps a mascot legible inside the 44 row with 8pt of air; it is decorative (hidden from AT).
    media: { size: 28, radius: "full" },
    // One line: the chip is a glance status, the panel carries the long copy.
    label: { textVariant: "label", fontWeight: fontWeight.medium, maxLines: 1 },
    emphasis: {
        // A resting status sits on the header like a quiet surface; the border keeps its edge on canvas.
        default: {
            background: semanticColors.surface.default,
            foreground: semanticColors.content.primary,
            border: semanticColors.border.default,
        },
        // The brand action pair is the contrast-checked fill/content couple (same as a primary Button).
        emphasis: {
            background: semanticColors.action.brand.background,
            foreground: semanticColors.action.brand.content,
            border: semanticColors.action.brand.background,
        },
    },
};
//# sourceMappingURL=activity-chip.js.map