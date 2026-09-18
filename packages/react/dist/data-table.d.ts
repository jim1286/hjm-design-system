import { type DataTableAsyncState, type DataTableColumnDescriptor, type DataTableDensity, type DataTableRowDescriptor, type DataTableSelection, type DataTableSortCycle, type DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { type ReactNode } from "react";
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
    className?: string;
}>;
export declare const DataTable: <ColumnKey extends string = string, RowKey extends string = string>(props: DataTableProps<ColumnKey, RowKey> & {
    ref?: React.Ref<HTMLTableElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=data-table.d.ts.map