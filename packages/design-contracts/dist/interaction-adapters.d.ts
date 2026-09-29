/** Optional interaction contracts have no engine or catalog dependency. */
export type SortableItem = Readonly<{
    id: string;
    label: string;
    disabled?: boolean;
}>;
export type ReorderIntent = Readonly<{
    itemId: string;
    fromIndex: number;
    toIndex: number;
    orderedIds: readonly string[];
    source: "drag" | "keyboard" | "accessibility-action";
}>;
export type SortableLabels = Readonly<{
    instructions: string;
    dragStart: (item: SortableItem) => string;
    dragCancel: string;
    handle: (item: SortableItem) => string;
    previous: (item: SortableItem) => string;
    next: (item: SortableItem) => string;
    position: (item: SortableItem, position: number, total: number) => string;
}>;
export declare function validateItems(items: readonly SortableItem[]): void;
export declare function reorderIntent(items: readonly SortableItem[], id: string, to: number, source: ReorderIntent["source"]): ReorderIntent | null;
export type RowAction = Readonly<{
    id: string;
    label: string;
    intent?: "default" | "danger";
    disabled?: boolean;
}>;
export declare function validateActions(actions: readonly RowAction[]): void;
export type CelebrationPreset = "small-burst" | "milestone";
export declare const celebrationRecipe: {
    readonly "small-burst": {
        readonly count: 32;
        readonly duration: 1600;
    };
    readonly milestone: {
        readonly count: 64;
        readonly duration: 2400;
    };
};
/**
 * Particle colors: the primary plus the four theme status accents, resolved per theme by the renderer.
 * The first adoption used primary + surfaceAccent; surfaceAccent is a pale surface tint, so 2026-09-30 device
 * captures showed a sparse single-blue burst that barely read as a celebration. Status accents are already
 * contrast-checked foreground hues in both themes, so no new palette is introduced.
 */
export declare const celebrationAccentTones: readonly ["info", "success", "warning", "attention"];
export declare function celebrationColors(primary: string, accents: Readonly<Record<(typeof celebrationAccentTones)[number], string>>): string[];
export declare function validateEventId(eventId: string): void;
export declare function validateCarousel(items: readonly SortableItem[], currentKey: string): number;
//# sourceMappingURL=interaction-adapters.d.ts.map