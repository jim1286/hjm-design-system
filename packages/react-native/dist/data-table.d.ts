import { type ReactNode } from "react";
import { type DataTableAsyncState, type DataTableCellHeat, type DataTableCellTone, type DataTableColumnDescriptor, type DataTableColumnGroup, type DataTableDensity, type DataTableRowDescriptor, type DataTableRowGroup, type DataTableSortCycle, type DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type NativeDataTableLabels = Readonly<{
    /** Accessible name for the table. */
    table: string;
    /** Sortable header action name including its current direction. */
    sortColumn: (header: string, direction: DataTableSortState<string>) => string;
}>;
export type DataTableProps<ColumnKey extends string = string, RowKey extends string = string> = Readonly<{
    columns: readonly DataTableColumnDescriptor<ColumnKey>[];
    rows: readonly DataTableRowDescriptor<RowKey>[];
    labels: NativeDataTableLabels;
    /** Strings and numbers render with the recipe's cell text; any other node is placed as-is. */
    renderCell: (rowId: RowKey, columnId: ColumnKey) => ReactNode;
    /** Text for rich cells. Native composes the row name; Web labels each cell. Omit to use visible primitive text. */
    getCellText?: (rowId: RowKey, columnId: ColumnKey) => string | undefined;
    sortState?: DataTableSortState<ColumnKey>;
    sortCycle?: DataTableSortCycle;
    onSortChange?: (next: DataTableSortState<ColumnKey>) => void;
    onRowPress?: (rowId: RowKey) => void;
    selectedRowId?: RowKey | null;
    /** Optional totals/average row pinned under the body (Web renders it as tfoot). */
    summaryRow?: (columnId: ColumnKey) => ReactNode;
    asyncState?: DataTableAsyncState;
    /** Visible copy for the empty/error/loading body states (product-localized). */
    emptyLabel?: string;
    density?: DataTableDensity;
    footer?: ReactNode;
    /** Header bands above leaf columns (Batting | Running). */
    columnGroups?: readonly DataTableColumnGroup<ColumnKey>[];
    /** Labeled row sections (Starters / Substitutes). */
    rowGroups?: readonly DataTableRowGroup<RowKey>[];
    /** Per-cell emphasis decided by the product (AG Grid cellClassRules / Savant percentile heat). */
    cellStyle?: (rowId: RowKey, columnId: ColumnKey) => Readonly<{
        tone?: DataTableCellTone | null;
        heat?: DataTableCellHeat | null;
    }> | null;
    /** Heat base colors; default high = danger red, low = info blue (Savant). */
    heatColors?: Readonly<{
        high: string;
        low: string;
    }>;
    /** Bounds the body height; the header stays fixed while rows scroll (react-native-sticky-table). */
    maxBodyHeight?: number;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function DataTable<ColumnKey extends string = string, RowKey extends string = string>({ columns, rows, labels, renderCell, getCellText, sortState, sortCycle, onSortChange, onRowPress, selectedRowId, summaryRow, asyncState, emptyLabel, density: suppliedDensity, footer, layoutStyle, columnGroups, rowGroups, cellStyle, heatColors, maxBodyHeight, }: DataTableProps<ColumnKey, RowKey>): import("react").JSX.Element;
export { LineScore, MatrixTable, ComparisonTable, type LineScoreProps, type MatrixTableProps, type ComparisonTableProps } from "./table-family.js";
//# sourceMappingURL=data-table.d.ts.map