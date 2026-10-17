import { TableSortButton } from "./table-sort-button.js";
import {
  dataTableColumnDefaults,
  dataTableDefaults,
  dataTableFamilyRecipe,
  dataTableFirstSortDirection,
  getNextDataTableSortState,
  resolveDataTableBody,
  resolveDataTableHeaderBands,
  splitPinnedDataTableColumns,
  resolveDataTableSelectAllState,
  validateDataTableColumns,
  validateDataTableRows,
  validateDataTableSortState,
  type DataTableAsyncState,
  type DataTableBodyItem,
  type DataTableCellHeat,
  type DataTableCellTone,
  type DataTableColumnDescriptor,
  type DataTableColumnGroup,
  type DataTableDensity,
  type DataTableRowDescriptor,
  type DataTableRowGroup,
  type DataTableSelection,
  type DataTableSortCycle,
  type DataTableSortState,
} from "@hjmds/design-contracts/components/data-table";
import { forwardRef, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useHjmDensityDefault } from "./provider.js";
import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { tableCellEmphasis, type TableHeatColors } from "./table-family.js";

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
  /** Header bands above leaf columns (Batting | Running). */
  columnGroups?: readonly DataTableColumnGroup<ColumnKey>[];
  /** Labeled row sections (Starters / Substitutes); each renders as its own `tbody`. */
  rowGroups?: readonly DataTableRowGroup<RowKey>[];
  /** Per-cell emphasis decided by the product (AG Grid cellClassRules / Savant percentile heat). */
  cellStyle?: (rowId: RowKey, columnId: ColumnKey) => Readonly<{ tone?: DataTableCellTone | null; heat?: DataTableCellHeat | null }> | null;
  /** Heat base colors (any CSS color); default high = danger red, low = info blue (Savant). */
  heatColors?: TableHeatColors;
  /** Bounds the scroll box height in px; the header stays fixed while rows scroll. */
  maxBodyHeight?: number;
  className?: string;
  /** Canonical layout-only placement on the root wrapper. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

function selectedRowKeysFrom<RowKey extends string>(
  selection: DataTableSelection<RowKey> | undefined,
): ReadonlySet<RowKey> {
  if (!selection || selection.mode === "none") return new Set<RowKey>();
  if (selection.mode === "single") {
    const key = selection.selectedKey ?? selection.defaultSelectedKey ?? null;
    return key === null ? new Set<RowKey>() : new Set<RowKey>([key]);
  }
  return selection.selectedKeys ?? selection.defaultSelectedKeys ?? new Set<RowKey>();
}

/**
 * Pinned columns and bounded heights need their own scroll box (sticky cells stick to it);
 * other tables keep the original DOM.
 */
function TableScroll({ scroll, maxBodyHeight, children }: Readonly<{ scroll: boolean; maxBodyHeight?: number | undefined; children: ReactNode }>) {
  if (!scroll && maxBodyHeight === undefined) return <>{children}</>;
  return (
    <div className="hjm-data-table__scroll" data-bounded={maxBodyHeight !== undefined || undefined} style={maxBodyHeight !== undefined ? { maxBlockSize: maxBodyHeight } : undefined}>
      {children}
    </div>
  );
}

type BodySection<RowKey> = { group: Readonly<{ id: string; label: string }> | null; rows: RowKey[] };

/** Splits the resolved body into `tbody` sections: loose rows first, then one per row group. */
function bodySections<RowKey>(items: readonly DataTableBodyItem<RowKey & string>[]): BodySection<RowKey>[] {
  const sections: BodySection<RowKey>[] = [];
  for (const item of items) {
    if (item.kind === "group") { sections.push({ group: { id: item.id, label: item.label }, rows: [] }); continue; }
    if (sections.length === 0) sections.push({ group: null, rows: [] });
    sections.at(-1)!.rows.push(item.id as RowKey);
  }
  // An empty table still renders one (empty) tbody, as before row groups existed.
  return sections.length > 0 ? sections : [{ group: null, rows: [] }];
}

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
    summaryRow,
    columnGroups,
    rowGroups,
    cellStyle,
    heatColors,
    maxBodyHeight,
    className,
    layoutStyle,
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
  // `defaultSelectedKey(s)` used to be re-read on every render, so an
  // uncontrolled table reported the click to `onSelectionChange` but kept showing
  // the default (same defect and fix as Tree, 2026-10-06). The uncontrolled value
  // lives in state; a controlled `selectedKey(s)` (including `null`) still wins.
  const selectionControlled = single
    ? selection.selectedKey !== undefined
    : multiple ? selection.selectedKeys !== undefined : true;
  const [uncontrolledKeys, setUncontrolledKeys] = useState<ReadonlySet<RowKey>>(() => selectedRowKeysFrom(selection));
  const selectedKeys: ReadonlySet<RowKey> = selectionControlled
    ? selectedRowKeysFrom(selection)
    : uncontrolledKeys;
  const commitSelection = (next: ReadonlySet<RowKey>) => {
    if (!selectionControlled) setUncontrolledKeys(next);
  };
  const hasSelector = selection !== undefined && selection.mode !== "none";
  // Only an unbroken leading run is pinned (contract). Sticky offsets need the rendered widths of
  // the cells before each pinned column, so they are measured rather than guessed from `width`.
  const pinnedCount = splitPinnedDataTableColumns(columns).pinned.length;
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const [pinnedOffsets, setPinnedOffsets] = useState<readonly number[]>([]);
  useLayoutEffect(() => {
    const row = headerRowRef.current;
    if (!row || pinnedCount === 0) return;
    const stickyCells = pinnedCount + (hasSelector ? 1 : 0);
    const measure = () => {
      const cells = [...row.cells].slice(0, stickyCells);
      const offsets: number[] = [];
      let sum = 0;
      for (const cell of cells) { offsets.push(sum); sum += cell.getBoundingClientRect().width; }
      setPinnedOffsets((previous) => previous.length === offsets.length && previous.every((value, i) => value === offsets[i]) ? previous : offsets);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    for (const cell of [...row.cells].slice(0, stickyCells)) observer.observe(cell);
    return () => observer.disconnect();
  }, [pinnedCount, hasSelector, columns]);
  // Sticky props for the selector cell (when pinning) and each pinned column, by visual position.
  const stickyAt = (position: number, isLast: boolean): Readonly<{ className?: string; style?: CSSProperties }> => {
    if (pinnedCount === 0) return {};
    return {
      className: isLast ? "hjm-data-table__pinned hjm-data-table__pinned-edge" : "hjm-data-table__pinned",
      style: { insetInlineStart: pinnedOffsets[position] ?? 0 },
    };
  };
  const selectorSticky = hasSelector && pinnedCount > 0 ? stickyAt(0, false) : {};
  const columnSticky = (index: number) => index < pinnedCount ? stickyAt(index + (hasSelector ? 1 : 0), index === pinnedCount - 1) : {};
  const selectAllState = multiple ? resolveDataTableSelectAllState(rows, selectedKeys) : false;
  const bands = useMemo(() => columnGroups && columnGroups.length > 0 ? resolveDataTableHeaderBands(columns, columnGroups) : null, [columns, columnGroups]);
  const sections = useMemo(() => bodySections<RowKey>(resolveDataTableBody(rows, rowGroups ?? [])), [rows, rowGroups]);
  const rowById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const columnSpan = columns.length + (hasSelector ? 1 : 0);

  const toggleRow = (row: DataTableRowDescriptor<RowKey>) => {
    if (row.disabled || !selection || selection.mode === "none") return;
    if (selection.mode === "single") {
      const current = selectedKeys.has(row.id) ? row.id : null;
      const next = current === row.id && selection.disallowEmptySelection !== true ? null : row.id;
      commitSelection(next === null ? new Set<RowKey>() : new Set<RowKey>([next]));
      selection.onSelectionChange?.(next);
      return;
    }
    const next = new Set(selectedKeys);
    if (next.has(row.id)) next.delete(row.id); else next.add(row.id);
    commitSelection(next);
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
    commitSelection(next);
    selection.onSelectionChange?.(next);
  };

  return (
    <div className={classNames("hjm-data-table", className)} style={layoutStyle} data-density={density}>
      {asyncState.status === "idle" ? null : (
        <p className="hjm-data-table__state" role={asyncState.status === "error" ? "alert" : "status"}>{asyncState.message}</p>
      )}
      <TableScroll scroll={pinnedCount > 0} maxBodyHeight={maxBodyHeight}>
      <table ref={forwardedRef} className="hjm-data-table__table" aria-label={labels.table} aria-busy={asyncState.status === "loading" || undefined}>
        <thead>
          {bands ? (
            <tr className="hjm-data-table__bands">
              {hasSelector ? <td aria-hidden="true" className={classNames("hjm-data-table__selector", selectorSticky.className)} style={selectorSticky.style} /> : null}
              {bands.map((band) => {
                const first = columns.findIndex((column) => column.id === band.columnIds[0]);
                // A band sticks only when every column under it is pinned; otherwise it scrolls with them.
                const sticky = first + band.span <= pinnedCount ? columnSticky(first + band.span - 1) : {};
                const stickyStyle = sticky.style ? { insetInlineStart: pinnedOffsets[first + (hasSelector ? 1 : 0)] ?? 0 } : undefined;
                return band.header === null
                  ? <td key={band.id} aria-hidden="true" colSpan={band.span} className={sticky.className} style={stickyStyle} />
                  : <th key={band.id} scope="colgroup" colSpan={band.span} className={classNames("hjm-data-table__band", sticky.className)} style={stickyStyle}><span>{band.header}</span></th>;
              })}
            </tr>
          ) : null}
          <tr ref={headerRowRef}>
            {selection && selection.mode !== "none" ? (
              <th scope="col" className={classNames("hjm-data-table__selector", selectorSticky.className)} style={selectorSticky.style}>
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
            {columns.map((column, columnIndex) => {
              const sorted = sortState?.columnId === column.id ? sortState.direction : null;
              const sticky = columnSticky(columnIndex);
              return (
                <th
                  key={column.id}
                  scope="col"
                  // The direction passes straight through to aria-sort; the
                  // contract already speaks that vocabulary.
                  aria-sort={sorted ?? undefined}
                  className={sticky.className}
                  style={{ inlineSize: column.width, textAlign: column.align ?? dataTableColumnDefaults.align, ...sticky.style } as CSSProperties}
                >
                  {column.sortable ? (
                    // A button inside the header, never the header itself.
                    <TableSortButton
                      header={column.header}
                      direction={sorted}
                      glyphs={{ ascending: "▲", descending: "▼", none: "↕" }}
                      className="hjm-data-table__sort"
                      accessibleName={labels.sortColumn(column.header, sortState as DataTableSortState<string>)}
                      // `sortDescFirst` columns (stat tables: highest first) start descending.
                      onSort={() => onSortChange?.(getNextDataTableSortState(sortState, column.id, sortCycle, dataTableFirstSortDirection(column)))}
                    />
                  ) : column.header}
                </th>
              );
            })}
          </tr>
        </thead>
        {sections.map((section) => (
        <tbody key={section.group?.id ?? "rows"}>
          {section.group ? (
            <tr className="hjm-data-table__group">
              <th scope="rowgroup" colSpan={columnSpan}><span>{section.group.label}</span></th>
            </tr>
          ) : null}
          {section.rows.map((rowId) => rowById.get(rowId)!).map((row) => (
            <tr key={row.id} aria-selected={selection && selection.mode !== "none" ? selectedKeys.has(row.id) : undefined} data-disabled={row.disabled || undefined}>
              {selection && selection.mode !== "none" ? (
                <td className={classNames("hjm-data-table__selector", selectorSticky.className)} style={selectorSticky.style}>
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
              {columns.map((column, columnIndex) => {
                const sticky = columnSticky(columnIndex);
                const emphasis = tableCellEmphasis(cellStyle?.(row.id, column.id), heatColors);
                // Sub-rows (TanStack `depth`) indent only the first column, which is the pinned one when pinning.
                const depth = columnIndex === 0 ? row.depth ?? 0 : 0;
                return (
                  <td
                    key={column.id}
                    className={classNames(sticky.className, emphasis.heat && "hjm-table-family__heat")}
                    data-tone={emphasis.tone}
                    data-heat={emphasis.heat}
                    data-depth={depth > 0 ? depth : undefined}
                    style={{
                      textAlign: column.align ?? dataTableColumnDefaults.align,
                      ...emphasis.style,
                      ...(depth > 0 ? { "--hjm-data-table-indent": `${depth * dataTableFamilyRecipe.depthIndent}px` } : {}),
                      ...sticky.style,
                    } as CSSProperties}
                  >
                    {renderCell(row.id, column.id)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        ))}
        {summaryRow ? (
          <tfoot>
            <tr className="hjm-data-table__summary">
              {hasSelector ? <td className={classNames("hjm-data-table__selector", selectorSticky.className)} style={selectorSticky.style} /> : null}
              {columns.map((column, columnIndex) => {
                const sticky = columnSticky(columnIndex);
                return (
                  <td key={column.id} className={sticky.className} style={{ textAlign: column.align ?? dataTableColumnDefaults.align, ...sticky.style } as CSSProperties}>
                    {summaryRow(column.id)}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        ) : null}
      </table>
      </TableScroll>
      {/* Pagination or load-more is composed beneath the table, never owned by it. */}
      {footer ? <div className="hjm-data-table__footer">{footer}</div> : null}
    </div>
  );
}) as <ColumnKey extends string = string, RowKey extends string = string>(
  props: DataTableProps<ColumnKey, RowKey> & { ref?: React.Ref<HTMLTableElement> },
) => React.ReactElement | null;

export {
  LineScore,
  MatrixTable,
  ComparisonTable,
  type LineScoreProps,
  type MatrixTableProps,
  type ComparisonTableProps,
  type TableHeatColors,
} from "./table-family.js";
