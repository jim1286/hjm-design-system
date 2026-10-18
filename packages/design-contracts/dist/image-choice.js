import { radius, spacing } from "./foundations.js";
export const imageChoiceRecipe = {
    tileSize: 72,
    gap: spacing.xs,
    radius: radius.md,
    ringWidth: 2,
    ringOffset: 2,
    checkSize: 20,
    /**
     * Visible per-tile caption (`showItemLabels`, 2026-10-18 BurnTok share recipients): people are recognised by name,
     * not only by face. One line, ellipsized, as wide as the tile so the wrap grid stays even.
     */
    itemLabelGap: spacing.xxs,
    itemLabelVariant: "caption",
    itemLabelLines: 1,
};
export function validateImageChoiceItems(items) {
    if (!items.length)
        throw new TypeError("ImageChoiceGroup needs at least one item");
    const ids = new Set();
    for (const item of items) {
        if (!item.id.trim() || ids.has(item.id) || !item.label.trim())
            throw new TypeError("ImageChoiceGroup items need unique ids and localized labels");
        ids.add(item.id);
    }
}
export function resolveImageChoiceToggle(mode, value, id) {
    if (mode === "single")
        return id;
    const list = (value ?? []);
    return list.includes(id) ? list.filter(entry => entry !== id) : [...list, id];
}
//# sourceMappingURL=image-choice.js.map