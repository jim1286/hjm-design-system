export type CollectionRailItem<Id extends string = string> = Readonly<{
    id: Id;
    label: string;
}>;
export type CollectionRailDensity = "compact" | "comfortable";
export type CollectionRailIntent = "previous" | "next" | "first" | "last";
export declare const collectionRailRecipe: {
    readonly itemMaxWidth: {
        readonly compact: number;
        readonly comfortable: number;
    };
    readonly gap: 16;
    readonly edgeHint: 24;
    readonly defaults: {
        readonly density: "comfortable";
    };
};
export type CollectionRailLayout = Readonly<{
    count: number;
    viewport: number;
    itemWidth: number;
    gap: number;
    contentWidth: number;
    maxOffset: number;
}>;
export declare function validateCollectionRail(items: readonly CollectionRailItem[], initialKey?: string): void;
export declare function resolveCollectionRailLayout(count: number, viewport: number, density?: CollectionRailDensity, gap?: number): CollectionRailLayout;
export declare function clampCollectionRailOffset(layout: CollectionRailLayout, offset: number): number;
export declare function resolveCollectionRailViewport(layout: CollectionRailLayout, offset: number): {
    offset: number;
    startIndex: number;
    atStart: boolean;
    atEnd: boolean;
};
export declare function getCollectionRailTargetOffset(layout: CollectionRailLayout, offset: number, intent: CollectionRailIntent): number;
export declare function getCollectionRailItemOffset(layout: CollectionRailLayout, index: number): number;
/** Reveal a focused item's full bounds, without treating it as a selection. */
export declare function getCollectionRailRevealOffset(layout: CollectionRailLayout, offset: number, index: number): number;
/** Native uses an explicitly LTR scroll host; its RTL row is physically reversed. */
export declare function getCollectionRailPhysicalOffset(layout: CollectionRailLayout, logicalOffset: number, direction: "ltr" | "rtl"): number;
export declare function getCollectionRailKeyboardIntent(key: string, direction: "ltr" | "rtl"): CollectionRailIntent | undefined;
//# sourceMappingURL=collection-rail.d.ts.map