import { type DataTableAsyncState, type DataTableCellHeat, type DataTableCellTone, type DataTableColumnDescriptor, type DataTableColumnGroup, type DataTableDensity, type DataTableRowDescriptor, type DataTableRowGroup, type DataTableSelection, type DataTableSortCycle, type DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { type TableHeatColors } from "./table-family.js";
export type DataTableLabels = Readonly<{
    /** Accessible name for the table itself. */
    table: string;
    selectAll: string;
    /** Composes one row's selection control name from its id. */
    selectRow: (rowId: string) => string;
    /** Composes a sortable header's action name, including its current direction. */
    sortColumn: (header: string, direction: DataTableSortState<string>) => string;
}>;
export type DataTableProps<ColumnKey extends string = string, RowKey extends string = string> = Readonly<{
    columns: readonly DataTableColumnDescriptor<ColumnKey>[];
    rows: readonly DataTableRowDescriptor<RowKey>[];
    labels: DataTableLabels;
    renderCell: (rowId: RowKey, columnId: ColumnKey) => ReactNode;
    selection?: DataTableSelection<RowKey>;
    sortState?: DataTableSortState<ColumnKey>;
    sortCycle?: DataTableSortCycle;
    onSortChange?: (next: DataTableSortState<ColumnKey>) => void;
    asyncState?: DataTableAsyncState;
    density?: DataTableDensity;
    /** Composed beneath the table by the product — pagination, load more, totals. */
    footer?: ReactNode;
    /**
     * Optional summary row rendered as the table's `tfoot` (totals, averages). Returns the cell for
     * each column; HJM never computes the aggregate (2026-10-14, stat tables).
     */
    summaryRow?: (columnId: ColumnKey) => ReactNode;
    /** Header bands above leaf columns (타격 | 주루). */
    columnGroups?: readonly DataTableColumnGroup<ColumnKey>[];
    /** Labeled row sections (선발 / 교체); each renders as its own `tbody`. */
    rowGroups?: readonly DataTableRowGroup<RowKey>[];
    /** Per-cell emphasis decided by the product (AG Grid cellClassRules / Savant percentile heat). */
    cellStyle?: (rowId: RowKey, columnId: ColumnKey) => Readonly<{
        tone?: DataTableCellTone | null;
        heat?: DataTableCellHeat | null;
    }> | null;
    /** Heat base colors (any CSS color); default high = danger red, low = info blue (Savant). */
    heatColors?: TableHeatColors;
    /** Bounds the scroll box height in px; the header stays fixed while rows scroll. */
    maxBodyHeight?: number;
    className?: string;
    /** Canonical layout-only placement on the root wrapper. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const DataTable: <ColumnKey extends string = string, RowKey extends string = string>(props: DataTableProps<ColumnKey, RowKey> & {
    ref?: React.Ref<HTMLTableElement>;
}) => React.ReactElement | null;
export { LineScore, MatrixTable, ComparisonTable, type LineScoreProps, type MatrixTableProps, type ComparisonTableProps, type TableHeatColors, } from "./table-family.js";
//# sourceMappingURL=data-table.d.ts.map