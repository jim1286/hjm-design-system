import { fontWeight, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const timelineDefaults = {
    itemTone: "neutral",
};
function assertNonEmpty(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Timeline ${field} must not be empty`);
    }
}
export function validateTimelineItemDescriptor(item) {
    assertNonEmpty(item.id, "item id");
    if (item.id !== item.id.trim()) {
        throw new TypeError("Timeline item id must not start or end with whitespace");
    }
    assertNonEmpty(item.label, "item label");
    if (item.timestamp !== undefined) {
        assertNonEmpty(item.timestamp, "item timestamp");
    }
    if (item.description !== undefined) {
        assertNonEmpty(item.description, "item description");
    }
    if (item.tone !== undefined &&
        item.tone !== "neutral" &&
        item.tone !== "info" &&
        item.tone !== "success" &&
        item.tone !== "attention") {
        throw new TypeError(`Unsupported Timeline item tone: ${String(item.tone)}`);
    }
}
export function validateTimelineDescriptor(descriptor) {
    if (descriptor.items.length === 0) {
        throw new RangeError("Timeline must contain at least one item");
    }
    const ids = new Set();
    for (const item of descriptor.items) {
        validateTimelineItemDescriptor(item);
        if (ids.has(item.id)) {
            throw new TypeError(`Duplicate Timeline item id: ${item.id}`);
        }
        ids.add(item.id);
    }
}
/**
 * Attaches order-preserving accessible names to an already-ordered item list.
 * Unlike Steps, no status is derived from position — every item already
 * happened, so this only adds order and the resolved tone default.
 */
export function resolveTimelineDescriptor(descriptor, options) {
    validateTimelineDescriptor(descriptor);
    if (typeof options.composeAccessibleName !== "function") {
        throw new TypeError("Timeline composeAccessibleName must be a function");
    }
    const total = descriptor.items.length;
    return descriptor.items.map((item, index) => {
        const position = index + 1;
        const accessibleName = options.composeAccessibleName({
            position,
            total,
            label: item.label,
        });
        if (typeof accessibleName !== "string" || accessibleName.trim().length === 0) {
            throw new TypeError("Timeline composeAccessibleName must return a non-empty string");
        }
        return {
            ...item,
            tone: item.tone ?? timelineDefaults.itemTone,
            position,
            total,
            accessibleName,
        };
    });
}
export const timelineRecipe = {
    slots: [
        "root",
        "item",
        "dot",
        "connector",
        "content",
        "timestamp",
        "label",
        "description",
    ],
    gap: spacing.md,
    dot: {
        diameter: 10,
        borderWidth: stroke.default,
        tones: {
            neutral: { border: null, fill: semanticColors.content.secondary },
            info: {
                border: semanticColors.feedback.info.border,
                fill: semanticColors.feedback.info.foreground,
            },
            success: {
                border: semanticColors.feedback.success.border,
                fill: semanticColors.feedback.success.foreground,
            },
            attention: {
                border: semanticColors.feedback.attention.border,
                fill: semanticColors.feedback.attention.foreground,
            },
        },
    },
    /**
     * A single tone, unlike stepsRecipe.connector's reached/unreached pair —
     * Timeline has no cursor, so no segment is "not yet reached".
     */
    connector: {
        width: stroke.default,
        tone: semanticColors.border.default,
    },
    timestamp: {
        textVariant: "caption",
        color: semanticColors.content.secondary,
    },
    label: {
        textVariant: "body",
        fontWeight: fontWeight.semibold,
        color: semanticColors.content.primary,
    },
    description: {
        textVariant: "body",
        color: semanticColors.content.body,
    },
};
//# sourceMappingURL=timeline.js.map