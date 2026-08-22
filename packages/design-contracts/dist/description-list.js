import { semanticColors } from "./semantic-colors.js";
import { spacing } from "./foundations.js";
export const descriptionListDefaults = {
    columns: 2,
};
function assertCopy(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`DescriptionList ${field} must not be empty`);
    }
}
export function validateDescriptionItem(item) {
    assertCopy(item.id, "id");
    if (item.id !== item.id.trim()) {
        throw new TypeError("DescriptionList item id must not start or end with whitespace");
    }
    assertCopy(item.label, `item ${item.id} label`);
    assertCopy(item.value, `item ${item.id} value`);
}
export function validateDescriptionList(descriptor) {
    if (descriptor.items.length === 0) {
        throw new TypeError("DescriptionList must contain at least one item");
    }
    if (descriptor.columns !== undefined &&
        descriptor.columns !== 1 &&
        descriptor.columns !== 2) {
        throw new RangeError("DescriptionList columns must be 1 or 2");
    }
    const ids = new Set();
    for (const item of descriptor.items) {
        validateDescriptionItem(item);
        if (ids.has(item.id)) {
            throw new TypeError(`Duplicate DescriptionList item id: ${item.id}`);
        }
        ids.add(item.id);
    }
}
export function resolveDescriptionListDescriptor(descriptor) {
    validateDescriptionList(descriptor);
    return {
        items: descriptor.items,
        columns: descriptor.columns ?? descriptionListDefaults.columns,
    };
}
export const descriptionListRecipe = {
    slots: ["root", "group", "item", "label", "value"],
    defaults: descriptionListDefaults,
    group: {
        gap: spacing.sm,
        minItemWidth: 160,
        columns: [1, 2],
    },
    item: {
        gap: spacing.xxs,
    },
    label: { textVariant: "label", color: semanticColors.content.secondary },
    value: {
        textVariant: "body",
        color: semanticColors.content.primary,
        maxLines: null,
    },
};
/**
 * Owns the large-text reflow so products stop re-deriving a per-screen
 * `textScale >= 1.6` guard (five screens missed it in the last review). The
 * minimum item width grows with `textScale`, so at a fixed `availableWidth`
 * the same formula that reflows for narrow screens also reflows for large
 * text — mirrors `resolveStatisticColumnCount`'s shape in the Yajalal app-rn
 * renderer contract.
 */
export function resolveDescriptionListColumnCount(availableWidth, requestedColumns, textScale = 1) {
    if (!Number.isFinite(availableWidth) || availableWidth <= 0) {
        return requestedColumns;
    }
    const scale = Number.isFinite(textScale) ? Math.max(textScale, 1) : 1;
    const minItemWidth = descriptionListRecipe.group.minItemWidth * scale;
    for (let columns = requestedColumns; columns >= 1; columns -= 1) {
        const itemWidth = (availableWidth - descriptionListRecipe.group.gap * (columns - 1)) /
            columns;
        if (itemWidth >= minItemWidth) {
            return columns;
        }
    }
    return 1;
}
//# sourceMappingURL=description-list.js.map