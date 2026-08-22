import { type ResponsiveValue, type WindowClass } from "./responsive.js";
/** `none` is the only non-token gap: the semantic absence of space. */
export declare const gridGaps: {
    readonly xxs: 4;
    readonly xs: 8;
    readonly sm: 12;
    readonly md: 16;
    readonly lg: 20;
    readonly xl: 24;
    readonly xxl: 32;
    readonly xxxl: 40;
    readonly none: 0;
};
export type GridGapToken = keyof typeof gridGaps;
/** A single token applies to both axes; the object form allows independent axes. */
export type GridGap = GridGapToken | Readonly<{
    row: GridGapToken;
    column: GridGapToken;
}>;
export type GridDescriptor = Readonly<{
    /** Requested column count at each window class; every value must be a positive integer. */
    columns: ResponsiveValue<number>;
    /** Token-only spacing. Missing larger classes inherit toward compact. */
    gap?: ResponsiveValue<GridGap>;
    /**
     * Optional target floor. The resolver reduces `columns` before allowing
     * multiple columns below this width; one column still shrinks to its container.
     */
    minColumnWidth?: ResponsiveValue<number>;
}>;
export declare const gridDefaults: {
    readonly gap: "md";
    readonly flow: "row-major";
};
export declare const gridRecipe: {
    readonly slots: readonly ["root", "item"];
    readonly defaults: {
        readonly gap: "md";
        readonly flow: "row-major";
    };
    readonly gaps: {
        readonly xxs: 4;
        readonly xs: 8;
        readonly sm: 12;
        readonly md: 16;
        readonly lg: 20;
        readonly xl: 24;
        readonly xxl: 32;
        readonly xxxl: 40;
        readonly none: 0;
    };
};
export type ResolveGridLayoutOptions = Readonly<{
    /** Full window/viewport width used only to choose the shared WindowClass. */
    windowWidth: number;
    /** Inner grid width after page padding/sidebar; defaults to windowWidth. */
    availableWidth?: number;
}>;
export type ResolvedGridLayout = Readonly<{
    windowClass: WindowClass;
    flow: "row-major";
    requestedColumns: number;
    columns: number;
    rowGap: number;
    columnGap: number;
    columnWidth: number;
}>;
export declare function validateGridDescriptor(descriptor: GridDescriptor): void;
/**
 * Resolves renderer-neutral grid geometry. Columns may only collapse from
 * the requested count when `minColumnWidth` requires it; they never widen.
 * Renderers must preserve child source order (`row-major`) on both platforms.
 */
export declare function resolveGridLayout(descriptor: GridDescriptor, options: ResolveGridLayoutOptions): ResolvedGridLayout;
//# sourceMappingURL=grid.d.ts.map