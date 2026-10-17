/** Height-driven packing preserves source order; DOM/native reading order never follows columns. */
export declare function resolveMasonryLayout(heights: readonly number[], width: number, columns?: number, gap?: number): {
    items: {
        top: number;
        left: number;
        width: number;
        height: number;
    }[];
    height: number;
    itemWidth: number;
};
/**
 * `minItemWidth` derives the default column count from the measured width. A fixed default of two left phone layouts
 * fine but stretched each card to ~580px on a 1200px desktop slot (2026-10-17 composition review). 160 keeps two
 * columns on a 375pt phone after its 16pt gutters and adds columns as the slot widens.
 */
export declare const masonryRecipe: {
    readonly layout: "shortest-column";
    readonly readingOrder: "source";
    readonly maxColumns: 12;
    readonly minItemWidth: 160;
};
/** Default column count for a measured width: as many `minItemWidth` columns as fit, clamped to 1...maxColumns. */
export declare function resolveMasonryColumns(width: number, gap?: number, minItemWidth?: number): number;
//# sourceMappingURL=masonry.d.ts.map