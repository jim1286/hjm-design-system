import type { AsyncCollectionState, CheckboxState, CollectionKey, CollectionSelectionModel } from "./behaviors.js";
import { type TextVariant } from "./foundations.js";
export type DataTableAlign = "start" | "center" | "end";
export type DataTableColumnDescriptor<Key extends CollectionKey = CollectionKey> = Readonly<{
    id: Key;
    /** Visible column header text; also the columnheader's accessible name. */
    header: string;
    align?: DataTableAlign;
    sortable?: boolean;
    /** Layout hint only (px or flex-basis); renderers may ignore or clamp it. */
    width?: number;
    /**
     * First press sorts descending (TanStack Table `sortDescFirst`). Stat tables read "highest first";
     * lower-is-better columns (ERA, rank) leave it false. Added 2026-10-14 with the Native renderer.
     */
    sortDescFirst?: boolean;
    /**
     * Keeps the column visible while the others scroll horizontally (AG Grid / TanStack column
     * pinning, start edge only). Only a leading run of pinned columns is honored.
     */
    pinned?: "start";
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
    /** Sub-row nesting (TanStack `depth`): 1 indents a substitute under a starter. 0–3. */
    depth?: number;
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
export declare function getNextDataTableSortState<Key extends CollectionKey>(current: DataTableSortState<Key>, columnId: Key, cycle?: DataTableSortCycle, firstDirection?: DataTableSortDirection): DataTableSortState<Key>;
/** The first direction a column's header applies, from `sortDescFirst`. */
export declare function dataTableFirstSortDirection(column: Pick<DataTableColumnDescriptor, "sortDescFirst">): DataTableSortDirection;
export type DataTableSortValue = number | string | null | undefined;
/**
 * Sort key for a displayed cell string: "0.340", ".340", "36 ⅓", "13.5억", "61.0%" → numbers;
 * text such as "7승0무3패" or names stay strings; "—", "-" and "" are missing.
 */
export declare function toDataTableSortValue(value: unknown): DataTableSortValue;
/**
 * Pure comparison: numbers numerically, strings with `localeCompare`, numbers before strings.
 * Missing values are not compared here; `sortDataTableRows` always sinks them.
 */
export declare function compareDataTableValues(a: Exclude<DataTableSortValue, null | undefined>, b: Exclude<DataTableSortValue, null | undefined>, locale?: string): number;
/**
 * Optional row-model helper (TanStack `getSortedRowModel` with `sortUndefined: "last"`): stable,
 * missing values always last in both directions. 1.20 left all sorting to products; Yajalal and
 * other stat tables reimplemented the same rules, so the shared helper exists now. Products with
 * server-side sorting keep calling `getNextDataTableSortState` only.
 */
export declare function sortDataTableRows<Row, Key extends CollectionKey>(rows: readonly Row[], sort: DataTableSortState<Key>, getValue: (row: Row, columnId: Key) => DataTableSortValue, options?: Readonly<{
    locale?: string;
}>): Row[];
/** Leading pinned columns (only an unbroken run from the start is pinned). */
export declare function splitPinnedDataTableColumns<Column extends Pick<DataTableColumnDescriptor, "pinned">>(columns: readonly Column[]): Readonly<{
    pinned: readonly Column[];
    scrolling: readonly Column[];
}>;
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
            key: "bg";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
        readonly fontWeight: "500";
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
            key: "bg";
            alpha?: number;
        }>;
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "surfaceSelected";
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
export declare const dataTableFamilyScenarios: readonly ["header-groups-span-contiguous-leaf-columns-and-pad-ungrouped-columns", "row-groups-insert-a-section-label-before-their-rows", "cell-tone-and-heat-are-product-decided-semantic-emphasis", "percentile-rank-flips-for-lower-is-better-stats-and-ties-take-the-midpoint", "bounded-height-tables-keep-the-header-fixed-while-the-body-scrolls", "line-score-pads-to-nine-periods-and-extends-for-extra-periods", "matrix-diagonal-is-a-blank-self-cell", "comparison-bars-favor-the-better-side-even-when-lower-is-better"];
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
        readonly roles: readonly ["button", "header"];
        readonly states: readonly ["selected"];
        readonly actions: readonly ["activate"];
    };
    readonly scenarios: readonly ["sort-desc-first-columns-start-descending-and-cycle-back", "missing-values-sink-to-the-bottom-in-both-directions", "pinned-start-columns-stay-visible-while-the-rest-scrolls", "row-selection-reuses-the-shared-collection-selection-model-unchanged", "select-all-reuses-the-shared-tri-state-checkbox-value", "async-state-reuses-the-shared-collection-async-state-unchanged", "sortable-header-is-a-button-inside-the-columnheader-not-the-header-itself", "sort-direction-values-pass-through-to-aria-sort-without-translation", "disabled-rows-are-excluded-from-select-all-accounting", "pagination-or-load-more-is-composed-beneath-the-table-not-owned-by-it", "row-expansion-is-not-owned-here-compose-the-disclosure-group-contract-per-row", "a-data-cell-exposes-at-most-one-focusable-control", "no-roving-tabindex-grid-navigation-is-implied", "header-groups-span-contiguous-leaf-columns-and-pad-ungrouped-columns", "row-groups-insert-a-section-label-before-their-rows", "cell-tone-and-heat-are-product-decided-semantic-emphasis", "percentile-rank-flips-for-lower-is-better-stats-and-ties-take-the-midpoint", "bounded-height-tables-keep-the-header-fixed-while-the-body-scrolls", "line-score-pads-to-nine-periods-and-extends-for-extra-periods", "matrix-diagonal-is-a-blank-self-cell", "comparison-bars-favor-the-better-side-even-when-lower-is-better"];
};
/** One header band above leaf columns. Columns not listed in any group get an empty placeholder cell. */
export type DataTableColumnGroup<Key extends CollectionKey = CollectionKey> = Readonly<{
    id: string;
    header: string;
    columns: readonly Key[];
}>;
export type DataTableHeaderBand = Readonly<{
    id: string;
    header: string | null;
    span: number;
    columnIds: readonly string[];
}>;
/**
 * Resolves group bands over the given (already pinned-split) column order. A group must cover a
 * contiguous run; columns outside every group become placeholder bands so leaf widths still line up.
 */
export declare function resolveDataTableHeaderBands<Key extends CollectionKey>(columns: readonly Pick<DataTableColumnDescriptor<Key>, "id">[], groups: readonly DataTableColumnGroup<Key>[]): DataTableHeaderBand[];
/** Labeled row section (e.g. 선발 / 교체, 동부 / 서부). Rows not in any group render first, ungrouped. */
export type DataTableRowGroup<Key extends CollectionKey = CollectionKey> = Readonly<{
    id: string;
    label: string;
    rows: readonly Key[];
}>;
export type DataTableBodyItem<Key extends CollectionKey = CollectionKey> = Readonly<{
    kind: "group";
    id: string;
    label: string;
}> | Readonly<{
    kind: "row";
    id: Key;
}>;
/** Flattens rows + groups into the body order renderers draw. Unknown or duplicated ids throw. */
export declare function resolveDataTableBody<Key extends CollectionKey>(rows: readonly DataTableRowDescriptor<Key>[], groups?: readonly DataTableRowGroup<Key>[]): DataTableBodyItem<Key>[];
/**
 * Semantic cell emphasis, decided by the product per cell (AG Grid cellClassRules):
 * `leader` marks a league/table best, `positive`/`negative` a direction, `muted` a non-qualifying value.
 */
export type DataTableCellTone = "leader" | "positive" | "negative" | "muted";
/** Percentile heat (Savant): `high` side toward the best values, `low` toward the worst; strength 1–3. */
export type DataTableCellHeat = Readonly<{
    side: "high" | "low";
    strength: 1 | 2 | 3;
}>;
/**
 * Percentile rank (0–100, best = 100) of `value` among `sample`. `lowerIsBetter` flips ERA-style stats.
 * Ties take the midpoint rank, missing values return null. A one-value sample is the 50th percentile.
 */
export declare function percentileRank(value: number | null | undefined, sample: readonly (number | null | undefined)[], options?: Readonly<{
    lowerIsBetter?: boolean;
}>): number | null;
/** Maps a percentile to heat: ≥90/≥75/≥60 high, ≤10/≤25/≤40 low, the middle stays neutral (null). */
export declare function percentileHeat(percentile: number | null): DataTableCellHeat | null;
export declare const dataTableFamilyRecipe: {
    /** Heat background alpha per strength, over the high/low base colors. */
    readonly heatAlpha: {
        readonly 1: 0.14;
        readonly 2: 0.26;
        readonly 3: 0.42;
    };
    readonly heat: {
        readonly high: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly low: Readonly<{
            source: "accent";
            key: "info";
            alpha?: number;
        }>;
    };
    readonly tone: {
        readonly leader: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
        };
        readonly positive: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
        };
        readonly negative: {
            readonly color: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
        };
        readonly muted: {
            readonly color: Readonly<{
                source: "theme";
                key: "textSub";
                alpha?: number;
            }>;
            readonly fontWeight: "400";
        };
    };
    readonly groupRow: {
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
        readonly textVariant: TextVariant;
    };
    /** Indent per sub-row depth level (substitutes under a starter, players under a team). */
    readonly depthIndent: 16;
    readonly headerBand: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly borderBottom: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
    };
    /**
     * Live period (LineScore) and "my team" row (MatrixTable). These tables sit on the surface tone, where DataTable's
     * canvas-colored selected row read as a white gap that split the table (2026-10-17 review E17).
     */
    readonly highlight: {
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAccent";
            alpha?: number;
        }>;
    };
    readonly currentPeriod: {
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceSelected";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
    };
};
export type LineScoreTeam = Readonly<{
    id: string;
    name: string;
    /** Runs per period; null = not played yet, "X" = home team did not bat in the last inning. */
    periods: readonly (number | "X" | null)[];
    /** Totals in display order, e.g. { R: 5, H: 9, E: 0, B: 4 }. */
    totals: Readonly<Record<string, number | null>>;
}>;
export type LineScoreColumn = Readonly<{
    id: string;
    header: string;
    kind: "period" | "total";
}>;
/**
 * Period columns are padded to `minPeriods` (9 innings) and extend for extra innings; totals follow.
 * The current period (live game) is reported so renderers can highlight it.
 */
export declare function resolveLineScore(teams: readonly LineScoreTeam[], options: Readonly<{
    minPeriods?: number;
    totals: readonly string[];
    currentPeriod?: number | null;
}>): Readonly<{
    columns: LineScoreColumn[];
    currentPeriod: number | null;
    leaderId: string | null;
}>;
export declare function formatLineScoreCell(value: number | "X" | null | undefined): string;
export type MatrixCell = Readonly<{
    label: string;
    tone?: DataTableCellTone | null;
    heat?: DataTableCellHeat | null;
}>;
/**
 * Square cross table (team × team head-to-head). Rows and columns share one id list; the diagonal is
 * a self cell and renders blank. `getCell(row, column)` returns null for no record.
 */
export declare function resolveMatrix<Key extends string>(ids: readonly Key[], getCell: (row: Key, column: Key) => MatrixCell | null): readonly (readonly (MatrixCell | "self" | null)[])[];
export type ComparisonRow = Readonly<{
    id: string;
    label: string;
    values: readonly [number | null, number | null];
    /** Display strings; defaults to String(value). */
    display?: readonly [string, string];
    lowerIsBetter?: boolean;
}>;
/** Which side wins a row (null on ties/missing), and each side's bar share of the pair (0–1). */
export declare function resolveComparisonRow(row: ComparisonRow): Readonly<{
    winner: 0 | 1 | null;
    shares: readonly [number, number];
}>;
//# sourceMappingURL=data-table.d.ts.map