import { type ReactNode } from "react";
import { type DataTableAsyncState, type DataTableColumnDescriptor, type DataTableDensity, type DataTableRowDescriptor, type DataTableSortCycle, type DataTableSortState } from "@hjmds/design-contracts/components/data-table";
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
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function DataTable<ColumnKey extends string = string, RowKey extends string = string>({ columns, rows, labels, renderCell, sortState, sortCycle, onSortChange, onRowPress, selectedRowId, summaryRow, asyncState, emptyLabel, density, footer, layoutStyle, }: DataTableProps<ColumnKey, RowKey>): import("react").JSX.Element;
//# sourceMappingURL=data-table.d.ts.map