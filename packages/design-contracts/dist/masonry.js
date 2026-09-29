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
export const masonryRecipe = { layout: "shortest-column", readingOrder: "source", maxColumns: 12 };
//# sourceMappingURL=masonry.js.map