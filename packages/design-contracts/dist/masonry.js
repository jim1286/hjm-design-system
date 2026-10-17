/** Height-driven packing preserves source order; DOM/native reading order never follows columns. */
export function resolveMasonryLayout(heights, width, columns = 2, gap = 12) {
    if (!Number.isFinite(width) || width <= 0 || !Number.isInteger(columns) || columns < 1 || columns > 12 || !Number.isFinite(gap) || gap < 0)
        throw new TypeError("Invalid Masonry geometry");
    const itemWidth = (width - gap * (columns - 1)) / columns;
    if (itemWidth <= 0 || heights.some(height => !Number.isFinite(height) || height <= 0))
        throw new TypeError("Masonry items need positive dimensions");
    const ends = Array(columns).fill(0);
    const items = heights.map(height => {
        const column = ends.indexOf(Math.min(...ends));
        const top = ends[column];
        ends[column] = top + height + gap;
        return { top, left: column * (itemWidth + gap), width: itemWidth, height };
    });
    return { items, height: heights.length ? Math.max(...ends) - gap : 0, itemWidth };
}
/**
 * `minItemWidth` derives the default column count from the measured width. A fixed default of two left phone layouts
 * fine but stretched each card to ~580px on a 1200px desktop slot (2026-10-17 composition review). 160 keeps two
 * columns on a 375pt phone after its 16pt gutters and adds columns as the slot widens.
 */
export const masonryRecipe = { layout: "shortest-column", readingOrder: "source", maxColumns: 12, minItemWidth: 160 };
/** Default column count for a measured width: as many `minItemWidth` columns as fit, clamped to 1...maxColumns. */
export function resolveMasonryColumns(width, gap = 12, minItemWidth = masonryRecipe.minItemWidth) {
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(gap) || gap < 0 || !Number.isFinite(minItemWidth) || minItemWidth <= 0)
        throw new TypeError("Invalid Masonry geometry");
    return Math.max(1, Math.min(masonryRecipe.maxColumns, Math.floor((width + gap) / (minItemWidth + gap))));
}
//# sourceMappingURL=masonry.js.map