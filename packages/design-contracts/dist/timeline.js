import { fontWeight, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
import { getCollectionNavigationIntent, getCollectionNavigationTarget } from "./collection.js";
export const timelineDefaults = {
    itemTone: "neutral",
    variant: "journal",
};
function assertNonEmpty(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Timeline ${field} must not be empty`);
    }
}
export function validateTimelineItemDescriptor(item) {
    assertNonEmpty(item.id, "item id");
    if (item.emphasized !== undefined && typeof item.emphasized !== "boolean") {
        throw new TypeError("Timeline item emphasized must be a boolean");
    }
    if (item.id !== item.id.trim()) {
        throw new TypeError("Timeline item id must not start or end with whitespace");
    }
    assertNonEmpty(item.label, "item label");
    if (item.timestamp !== undefined) {
        assertNonEmpty(item.timestamp, "item timestamp");
    }
    if (item.dateTime !== undefined) {
        assertNonEmpty(item.dateTime, "item dateTime");
        if (item.timestamp === undefined)
            throw new TypeError("Timeline dateTime requires timestamp");
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
    if (descriptor.selectedId !== undefined && descriptor.selectedId !== null && !ids.has(descriptor.selectedId)) {
        throw new RangeError(`Timeline selectedId does not match any item id: ${String(descriptor.selectedId)}`);
    }
}
/**
 * Selection is a pair: a controlled `selectedId` (null for none) and the change callback, or neither. A selectable
 * record is one target (Web option, Native selected button), so it cannot also host `renderActions` commands —
 * nested controls inside an option are not operable by assistive tech. Products that need a per-record command keep
 * the passive Timeline.
 */
export function validateTimelineSelection(selectedId, onSelectedIdChange, options = { hasActions: false }) {
    if (options.variant !== undefined && options.variant !== "record" && options.variant !== "journal") {
        throw new TypeError("Unsupported Timeline variant");
    }
    if ((selectedId === undefined) !== (onSelectedIdChange === undefined)) {
        throw new TypeError("Timeline selectedId and onSelectedIdChange must be supplied together");
    }
    if (onSelectedIdChange !== undefined && typeof onSelectedIdChange !== "function") {
        throw new TypeError("Timeline onSelectedIdChange must be a function");
    }
    if (onSelectedIdChange !== undefined && options.hasActions) {
        throw new TypeError("A selectable Timeline cannot render per-record actions; the record itself is the selection target");
    }
}
/**
 * Keyboard target for a selectable Timeline (vertical listbox): ArrowDown/ArrowUp step one record, Home/End jump to
 * the ends, and the ends do not wrap — a history has a first and a last record. Selection follows focus, as in the
 * single-select listbox pattern, because choosing a record only changes what the product shows next to it.
 * Returns undefined for keys Timeline does not own. Reuses the shared collection navigation math.
 */
export function getTimelineSelectionTarget(items, currentId, key) {
    const intent = getCollectionNavigationIntent(key);
    if (!intent)
        return undefined;
    return getCollectionNavigationTarget({ items: items.map((item) => ({ id: item.id, label: item.label, textValue: item.label })) }, currentId, intent, false);
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
            selected: descriptor.selectedId !== undefined && descriptor.selectedId === item.id,
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
    gap: spacing.lg,
    // 2026-10-27: the approved journey journal keeps the reading rail, without large selected cards.
    // Passive histories keep every detail and command; selection adds disclosure without changing event semantics.
    journal: { gap: 0, paddingBlock: spacing.md, dotDiameter: 8 },
    // A record remains passive: emphasis highlights its history without implying progress.
    item: {
        padding: spacing.sm,
        emphasisBackground: semanticColors.feedback.info.background,
        /**
         * Selected record (selectable Timeline): the neutral persistent-selection surface and ring shared with ListRow,
         * not brand fill (theme-palette.md 선택 상태 색상 기준). Selection outranks passive emphasis on the same record.
         */
        selected: {
            background: semanticColors.selection.background,
            border: semanticColors.selection.border,
            borderWidth: stroke.default,
        },
    },
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
        fontWeight: fontWeight.medium,
        color: semanticColors.content.primary,
    },
    description: {
        textVariant: "body",
        color: semanticColors.content.body,
    },
};
//# sourceMappingURL=timeline.js.map