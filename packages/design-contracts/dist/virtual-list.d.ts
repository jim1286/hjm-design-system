export declare function resolveVirtualWindow(count: number, rowHeight: number, viewportHeight: number, scrollTop: number, overscan?: number): {
    start: number;
    end: number;
    totalHeight: number;
    offset: number;
};
export declare function validateListKeys(keys: readonly string[], label: string): void;
export declare const virtualListRecipe: {
    readonly layout: "fixed-row-window";
    readonly overscan: 3;
    readonly readingOrder: "source";
};
//# sourceMappingURL=virtual-list.d.ts.map