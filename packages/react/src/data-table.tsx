import {
  dataTableColumnDefaults,
  dataTableDefaults,
  getNextDataTableSortState,
  resolveDataTableSelectAllState,
  validateDataTableColumns,
  validateDataTableRows,
  validateDataTableSortState,
  type DataTableAsyncState,
  type DataTableColumnDescriptor,
  type DataTableDensity,
  type DataTableRowDescriptor,
  type DataTableSelection,
  type DataTableSortCycle,
  type DataTableSortState,
} from "@hjmds/design-contracts/components/data-table";
import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { useHjmDensityDefault } from "./provider.js";
import { classNames } from "./internal.js";

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

export const DataTable = forwardRef(function DataTable<
  ColumnKey extends string = string,
  RowKey extends string = string,
>(
  {
    columns,
    rows,
    labels,
    renderCell,
    selection,
    sortState = null,
    sortCycle = dataTableDefaults.sortCycle,
    onSortChange,
    asyncState = { status: "idle" },
    density: densityProp,
    footer,
    className,
  }: DataTableProps<ColumnKey, RowKey>,
  forwardedRef: React.Ref<HTMLTableElement>,
) {
  // Unconditional: `??` on the hook call would break the rules of hooks.
  const densityDefault = useHjmDensityDefault({ comfortable: "regular", compact: "compact" });
  const density = densityProp ?? densityDefault;
  validateDataTableColumns(columns);
  validateDataTableRows(rows);
  validateDataTableSortState(sortState, columns);
  const multiple = selection?.mode === "multiple";
  const single = selection?.mode === "single";
  const selectedKeys: ReadonlySet<RowKey> = multiple
    ? selection.selectedKeys ?? selection.defaultSelectedKeys ?? new Set<RowKey>()
    : single
      ? new Set<RowKey>(((selection.selectedKey ?? selection.defaultSelectedKey) ?? null) === null
        ? []
        : [(selection.selectedKey ?? selection.defaultSelectedKey)!])
      : new Set<RowKey>();
  const selectAllState = multiple ? resolveDataTableSelectAllState(rows, selectedKeys) : false;

  const toggleRow = (row: DataTableRowDescriptor<RowKey>) => {
    if (row.disabled || !selection || selection.mode === "none") return;
    if (selection.mode === "single") {
      const current = selection.selectedKey ?? selection.defaultSelectedKey ?? null;
      const next = current === row.id && selection.disallowEmptySelection !== true ? null : row.id;
      selection.onSelectionChange?.(next);
      return;
    }
    const next = new Set(selectedKeys);
    if (next.has(row.id)) next.delete(row.id); else next.add(row.id);
    selection.onSelectionChange?.(next);
  };
  const toggleAll = () => {
    if (!multiple) return;
    // Disabled rows stay out of both the denominator and the result, matching
    // the shared select-all accounting.
    const selectable = rows.filter((row) => !row.disabled);
    const next = selectAllState === true
      ? new Set([...selectedKeys].filter((id) => !selectable.some((row) => row.id === id)))
      : new Set([...selectedKeys, ...selectable.map((row) => row.id)]);
    selection.onSelectionChange?.(next);
  };

  return (
    <div className={classNames("hjm-data-table", className)} data-density={density}>
      {asyncState.status === "idle" ? null : (
        <p className="hjm-data-table__state" role={asyncState.status === "error" ? "alert" : "status"}>{asyncState.message}</p>
      )}
      <table ref={forwardedRef} className="hjm-data-table__table" aria-label={labels.table} aria-busy={asyncState.status === "loading" || undefined}>
        <thead>
          <tr>
            {selection && selection.mode !== "none" ? (
              <th scope="col" className="hjm-data-table__selector">
                {multiple ? (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selectAllState === "mixed" ? "mixed" : String(selectAllState === true) as "true" | "false"}
                    aria-label={labels.selectAll}
                    className="hjm-data-table__check"
                    onClick={toggleAll}
                  >
                    {selectAllState === true ? "✓" : selectAllState === "mixed" ? "–" : ""}
                  </button>
                ) : null}
              </th>
            ) : null}
            {columns.map((column) => {
              const sorted = sortState?.columnId === column.id ? sortState.direction : null;
              return (
                <th
                  key={column.id}
                  scope="col"
                  // The direction passes straight through to aria-sort; the
                  // contract already speaks that vocabulary.
                  aria-sort={sorted ?? undefined}
                  style={{ inlineSize: column.width, textAlign: column.align ?? dataTableColumnDefaults.align } as CSSProperties}
                >
                  {column.sortable ? (
                    // A button inside the header, never the header itself.
                    <button
                      type="button"
                      className="hjm-data-table__sort"
                      aria-label={labels.sortColumn(column.header, sortState as DataTableSortState<string>)}
                      onClick={() => onSortChange?.(getNextDataTableSortState(sortState, column.id, sortCycle))}
                    >
                      <span>{column.header}</span>
                      <span aria-hidden="true">{sorted === "ascending" ? "▲" : sorted === "descending" ? "▼" : "↕"}</span>
                    </button>
                  ) : column.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} aria-selected={selection && selection.mode !== "none" ? selectedKeys.has(row.id) : undefined} data-disabled={row.disabled || undefined}>
              {selection && selection.mode !== "none" ? (
                <td className="hjm-data-table__selector">
                  <button
                    type="button"
                    role={multiple ? "checkbox" : "radio"}
                    aria-checked={selectedKeys.has(row.id)}
                    aria-label={labels.selectRow(row.id)}
                    aria-disabled={row.disabled || undefined}
                    className="hjm-data-table__check"
                    onClick={() => toggleRow(row)}
                  >
                    {selectedKeys.has(row.id) ? "✓" : ""}
                  </button>
                </td>
              ) : null}
              {columns.map((column) => (
                <td key={column.id} style={{ textAlign: column.align ?? dataTableColumnDefaults.align } as CSSProperties}>
                  {renderCell(row.id, column.id)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination or load-more is composed beneath the table, never owned by it. */}
      {footer ? <div className="hjm-data-table__footer">{footer}</div> : null}
    </div>
  );
}) as <ColumnKey extends string = string, RowKey extends string = string>(
  props: DataTableProps<ColumnKey, RowKey> & { ref?: React.Ref<HTMLTableElement> },
) => React.ReactElement | null;
