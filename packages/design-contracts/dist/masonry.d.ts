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
export declare const masonryRecipe: {
    readonly layout: "shortest-column";
    readonly readingOrder: "source";
    readonly maxColumns: 12;
};
//# sourceMappingURL=masonry.d.ts.map