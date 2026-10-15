/**
 * Lucian #033/#092/#131/#144/#178 informed these compositions, not their demo state engines.
 * Reuse FieldGroup, ActionSession and controlled table columns; products own data and persistence.
 */
export declare const collectionEditingRecipe: {
    readonly gap: "md";
    readonly actionGap: "sm";
};
export type ColumnSetting = Readonly<{
    id: string;
    label: string;
    visible: boolean;
    locked?: boolean;
}>;
export type FilterRecoveryOption = Readonly<{
    id: string;
    label: string;
    resultCount: number;
}>;
export type SelectionAction = Readonly<{
    id: string;
    label: string;
    destructive?: boolean;
}>;
export type FocusTarget = {
    focus(): void;
};
export declare function assertDistinctIds(items: readonly Readonly<{
    id: string;
}>[]): void;
/** A mutation gets its own immutable scope; a later selection never changes an in-flight request. */
export declare function snapshotSelection(ids: readonly string[]): readonly string[];
/** Focus the next surviving row, then the preceding row, then the add action. */
export declare function focusAfterRemoval(ids: readonly string[], removed: string, disabledIds?: readonly string[]): string | undefined;
export declare function recoverableFilters(options: readonly FilterRecoveryOption[]): readonly FilterRecoveryOption[];
/** Locked columns are barriers: a visibility/order UI must not silently move a fixed column. */
export declare function changeColumnSettings(columns: readonly ColumnSetting[], id: string, action: "toggle" | "earlier" | "later"): readonly ColumnSetting[];
//# sourceMappingURL=collection-editing.d.ts.map