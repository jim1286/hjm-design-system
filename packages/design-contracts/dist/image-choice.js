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
    /**
     * 2026-10-18 BurnTok creation starters: multi-word titles were cut at one 80-wide line. Two lines keep a short
     * title whole (word-keeping wrap) while the grid stays even; longer copy belongs in a list row, not a tile.
     */
    itemLabelMaxLines: 2,
    /**
     * One muted caption line under the label for a per-item status (2026-10-18 BurnTok share: "sent" was appended to
     * the name and hidden by the ellipsis on long nicknames).
     */
    itemDescriptionVariant: "caption",
    itemDescriptionTone: "muted",
    itemDescriptionLines: 1,
    /**
     * Web `virtualized` viewport inset: the tile focus outline (2) plus its offset (2) would otherwise be clipped by the
     * scrolling viewport at the first row and the edges.
     */
    virtualViewportInset: 4,
};
export function validateImageChoiceItemLabelLines(lines) {
    if (!Number.isInteger(lines) || lines < 1 || lines > imageChoiceRecipe.itemLabelMaxLines)
        throw new RangeError("ImageChoiceGroup itemLabelLines must be 1 or 2");
}
/** Square ring frame around the picture, which is also the tile width. */
export function resolveImageChoiceOuterSize() {
    return imageChoiceRecipe.tileSize + (imageChoiceRecipe.ringWidth + imageChoiceRecipe.ringOffset) * 2;
}
/**
 * Caption lines every tile of a group reserves: label lines when labels show, plus the description line when any
 * item has one. Reserving the same block in every tile keeps wrapped rows even and gives virtualized rows one height.
 */
export function resolveImageChoiceCaptionLines(options) {
    return (options.showItemLabels ? options.itemLabelLines : 0) + (options.hasDescription ? imageChoiceRecipe.itemDescriptionLines : 0);
}
/** Tile height for a caption block of `captionLines` lines at the rendered caption line height (token × text scale). */
export function resolveImageChoiceTileHeight(captionLines, captionLineHeight) {
    if (!Number.isInteger(captionLines) || captionLines < 0 || !Number.isFinite(captionLineHeight) || captionLineHeight <= 0)
        throw new TypeError("Invalid ImageChoiceGroup caption metrics");
    const outer = resolveImageChoiceOuterSize();
    return captionLines === 0 ? outer : outer + imageChoiceRecipe.itemLabelGap + captionLines * captionLineHeight;
}
/** Tiles per row in a slot `width` wide: as many fixed-size tiles as fit with the recipe gap, at least one. */
export function resolveImageChoiceColumns(width) {
    if (!Number.isFinite(width) || width < 0)
        throw new TypeError("Invalid ImageChoiceGroup width");
    const outer = resolveImageChoiceOuterSize();
    return Math.max(1, Math.floor((width + imageChoiceRecipe.gap) / (outer + imageChoiceRecipe.gap)));
}
export function validateImageChoiceItems(items) {
    if (!items.length)
        throw new TypeError("ImageChoiceGroup needs at least one item");
    const ids = new Set();
    for (const item of items) {
        if (!item.id.trim() || ids.has(item.id) || !item.label.trim())
            throw new TypeError("ImageChoiceGroup items need unique ids and localized labels");
        // Omit the key for no description; a blank string would reserve and announce an empty line.
        if (item.description !== undefined && !item.description.trim())
            throw new TypeError("ImageChoiceGroup item description must not be blank");
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