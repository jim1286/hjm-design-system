import type { AsyncCollectionState, CheckboxState, CollectionKey, CollectionSelectionModel } from "./behaviors.js";
export type DataTableAlign = "start" | "center" | "end";
export type DataTableColumnDescriptor<Key extends CollectionKey = CollectionKey> = Readonly<{
    id: Key;
    /** Visible column header text; also the columnheader's accessible name. */
    header: string;
    align?: DataTableAlign;
    sortable?: boolean;
    /** Layout hint only (px or flex-basis); renderers may ignore or clamp it. */
    width?: number;
}>;
export declare const dataTableColumnDefaults: {
    readonly align: "start";
    readonly sortable: false;
};
export declare function validateDataTableColumns<Key extends CollectionKey>(columns: readonly DataTableColumnDescriptor<Key>[]): void;
/**
 * Row identity and selection deliberately do NOT reuse `CollectionItemDescriptor`
 * verbatim: a table row has no single visible `label`/`textValue` the way a
 * Menu or Select item does — its "content" is however many columns the
 * product renders per row. Only the parts of the Collection base contract
 * that are genuinely row-shaped (`CollectionKey` identity, `disabled`) apply.
 */
export type DataTableRowDescriptor<Key extends CollectionKey = CollectionKey> = Readonly<{
    id: Key;
    disabled?: boolean;
}>;
export declare function validateDataTableRows<Key extends CollectionKey>(rows: readonly DataTableRowDescriptor<Key>[]): void;
/** Row selection is the unmodified Collection base contract — no DataTable-only selection shape. */
export type DataTableSelection<Key extends CollectionKey = CollectionKey> = CollectionSelectionModel<Key>;
/**
 * Header "select all" state as the same tri-state `CheckboxState` the
 * selection column's checkbox already renders (check/dash), instead of a new
 * `"none" | "some" | "all"` enum the recipe would have to translate again.
 * Disabled rows are excluded from both the denominator and the count.
 */
export declare function resolveDataTableSelectAllState<Key extends CollectionKey>(rows: readonly DataTableRowDescriptor<Key>[], selectedKeys: ReadonlySet<Key>): CheckboxState;
/**
 * Values are the literal `aria-sort` vocabulary (minus `"none"`, which is
 * `null`) so the Web renderer passes them through without a translation
 * table — the same "pass the platform value through" choice Slider makes
 * for `valueText`.
 */
export type DataTableSortDirection = "ascending" | "descending";
export type DataTableSortState<Key extends CollectionKey = CollectionKey> = Readonly<{
    columnId: Key;
    direction: DataTableSortDirection;
}> | null;
export type DataTableSortCycle = "two-state" | "three-state";
export declare const dataTableDefaults: {
    readonly sortCycle: "three-state";
};
export declare function validateDataTableSortState<Key extends CollectionKey>(state: DataTableSortState<Key>, columns: readonly DataTableColumnDescriptor<Key>[]): void;
/**
 * Pure toggle: does not read or write product data. The product still owns
 * actually re-sorting rows (Combobox's local/external filtering split is the
 * same boundary — HJM judges intent, never executes the data operation).
 */
export declare function getNextDataTableSortState<Key extends CollectionKey>(current: DataTableSortState<Key>, columnId: Key, cycle?: DataTableSortCycle): DataTableSortState<Key>;
/** The whole table's row-loading status — the unmodified Collection base async contract. */
export type DataTableAsyncState = AsyncCollectionState;
export type DataTableDensity = "compact" | "regular";
/**
 * Reuses `collectionItemContract`'s hover/selected/focus tokens instead of a
 * second set of row-interaction colors — Menu, Select, and DataTable rows
 * stay one visual vocabulary.
 */
export declare const dataTableRecipe: {
    readonly slots: readonly ["root", "header", "headerCell", "sortButton", "sortIcon", "row", "cell", "selectionCell", "emptyState", "errorState"];
    readonly defaults: {
        readonly density: "regular";
    };
    readonly density: {
        readonly compact: {
            readonly paddingVertical: 8;
            readonly paddingHorizontal: 12;
        };
        readonly regular: {
            readonly paddingVertical: 12;
            readonly paddingHorizontal: 16;
        };
    };
    readonly header: {
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly fontWeight: "700";
        readonly borderBottom: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
    };
    readonly row: {
        readonly borderBottom: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly hoverBackground: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
    };
    readonly cell: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
    };
    readonly sortButton: {
        readonly minTarget: 44;
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly activeColor: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
    };
    readonly selectionCell: {
        readonly width: 44;
    };
    readonly emptyState: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "body";
    };
    readonly errorState: {
        readonly color: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly textVariant: "body";
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
    };
};
/**
 * No roving-tabindex grid keyboard navigation (arrow keys between cells):
 * no product using this contract has measured demand for full ARIA-grid
 * traversal, and it is a materially bigger accessibility surface than a
 * sortable header button plus native checkbox/radio tab stops.
 */
export declare const dataTableBehavior: {
    readonly controlled: readonly ["selection"];
    readonly inputs: readonly ["columns", "rows", "sortState", "asyncState"];
    readonly events: readonly ["onSortChange"];
    readonly configuration: {
        readonly sortCycle: readonly ["two-state", "three-state"];
    };
    readonly defaults: {
        readonly sortCycle: "three-state";
    };
    readonly stateAxes: {
        readonly value: readonly ["selected"];
        readonly content: readonly ["idle", "loading", "loadingMore", "empty", "error"];
    };
    readonly web: {
        readonly roles: readonly ["table", "row", "columnheader", "cell", "button", "checkbox", "radio"];
        readonly keyboard: readonly ["Tab", "Enter", "Space"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["row-selection-reuses-the-shared-collection-selection-model-unchanged", "select-all-reuses-the-shared-tri-state-checkbox-value", "async-state-reuses-the-shared-collection-async-state-unchanged", "sortable-header-is-a-button-inside-the-columnheader-not-the-header-itself", "sort-direction-values-pass-through-to-aria-sort-without-translation", "disabled-rows-are-excluded-from-select-all-accounting", "pagination-or-load-more-is-composed-beneath-the-table-not-owned-by-it", "row-expansion-is-not-owned-here-compose-the-disclosure-group-contract-per-row", "a-data-cell-exposes-at-most-one-focusable-control", "no-roving-tabindex-grid-navigation-is-implied"];
};
//# sourceMappingURL=data-table.d.ts.map