import { useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text as NativeText, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import {
  dataTableColumnDefaults, dataTableDefaults, dataTableFirstSortDirection, dataTableRecipe, getNextDataTableSortState,
  splitPinnedDataTableColumns, validateDataTableColumns, validateDataTableRows, validateDataTableSortState,
  type DataTableAsyncState, type DataTableColumnDescriptor, type DataTableDensity, type DataTableRowDescriptor,
  type DataTableSortCycle, type DataTableSortState,
} from "@hjmds/design-contracts/components/data-table";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

/*
 * Native DataTable (2026-10-14). Same contract as Web DataTable: the product renders cells and owns
 * the row order (it may call `sortDataTableRows`); HJM owns headers, sort intent, pinning and rows.
 * Layout follows AG Grid / TanStack column pinning: leading `pinned: "start"` columns stay fixed while
 * the rest scroll horizontally, with a fade on the trailing edge instead of a "scroll for more" caption.
 * Row selection checkboxes are Web-only for now; Native exposes a single highlighted row.
 */

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

const DEFAULT_WIDTH = 72, PINNED_WIDTH = 96;
const alignOf = (align: DataTableColumnDescriptor["align"]) => align === "end" ? "right" : align === "center" ? "center" : "left";

export function DataTable<ColumnKey extends string = string, RowKey extends string = string>({
  columns, rows, labels, renderCell, sortState = null, sortCycle = dataTableDefaults.sortCycle, onSortChange, onRowPress, selectedRowId = null,
  summaryRow, asyncState = { status: "idle" }, emptyLabel, density = dataTableRecipe.defaults.density, footer, layoutStyle,
}: DataTableProps<ColumnKey, RowKey>) {
  validateDataTableColumns(columns);
  validateDataTableRows(rows);
  validateDataTableSortState(sortState, columns);
  const theme = useHjmNativeTheme(), { colors } = theme;
  const color = (reference: Parameters<typeof resolveColorReference>[0]) => resolveColorReference(reference, theme.palette);
  const [width, setWidth] = useState(0), [atEnd, setAtEnd] = useState(false), [pressed, setPressed] = useState<RowKey | null>(null);
  const { pinned, scrolling } = useMemo(() => splitPinnedDataTableColumns(columns), [columns]);
  const pad = dataTableRecipe.density[density];
  const rowHeight = density === "compact" ? 40 : 48, headerHeight = density === "compact" ? 34 : 40;
  const pinnedWidth = pinned.reduce((sum, column) => sum + (column.width ?? PINNED_WIDTH), 0);
  // Short tables stretch scrolling columns to fill the card; wide ones keep their widths and scroll.
  const natural = scrolling.reduce((sum, column) => sum + (column.width ?? DEFAULT_WIDTH), 0);
  const stretch = width > 0 && natural > 0 && natural < width - pinnedWidth ? (width - pinnedWidth) / natural : 1;
  const widthOf = (column: DataTableColumnDescriptor<ColumnKey>, pinnedColumn: boolean) => pinnedColumn ? column.width ?? PINNED_WIDTH : (column.width ?? DEFAULT_WIDTH) * stretch;
  const overflow = width > 0 && pinnedWidth + natural > width + 1;

  function header(column: DataTableColumnDescriptor<ColumnKey>, pinnedColumn: boolean) {
    const sortable = column.sortable ?? dataTableColumnDefaults.sortable;
    const active = sortState?.columnId === column.id ? sortState.direction : null;
    const textColor = active ? color(dataTableRecipe.sortButton.activeColor) : color(dataTableRecipe.header.color);
    const content = <NativeText numberOfLines={1} style={{ color: textColor, fontSize: 12, fontWeight: "700", textAlign: alignOf(column.align ?? dataTableColumnDefaults.align) }}>
      {column.header}{active ? (active === "ascending" ? " ▲" : " ▼") : ""}
    </NativeText>;
    const style = { width: widthOf(column, pinnedColumn), height: headerHeight, paddingHorizontal: pad.paddingHorizontal / 2, justifyContent: "center" as const };
    return sortable && onSortChange
      ? <Pressable key={column.id} accessibilityRole="button" accessibilityLabel={labels.sortColumn(column.header, sortState?.columnId === column.id ? sortState : null)}
          hitSlop={4} onPress={() => onSortChange(getNextDataTableSortState(sortState, column.id, sortCycle, dataTableFirstSortDirection(column)))} style={style}>{content}</Pressable>
      : <View key={column.id} accessibilityRole="header" style={style}>{content}</View>;
  }
  function cell(node: ReactNode, column: DataTableColumnDescriptor<ColumnKey>, pinnedColumn: boolean, emphasis: boolean, key: string) {
    const align = alignOf(column.align ?? dataTableColumnDefaults.align);
    return <View key={key} style={{ width: widthOf(column, pinnedColumn), height: rowHeight - 1, paddingHorizontal: pad.paddingHorizontal / 2, justifyContent: "center", alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }}>
      {typeof node === "string" || typeof node === "number"
        ? <NativeText numberOfLines={1} style={{ color: emphasis ? colors.text : color(dataTableRecipe.cell.color), fontSize: 14, fontWeight: emphasis ? "700" : "500", textAlign: align, fontVariant: ["tabular-nums"] }}>{String(node)}</NativeText>
        : node}
    </View>;
  }
  const rowBackground = (id: RowKey) => pressed === id ? color(dataTableRecipe.row.hoverBackground) : selectedRowId === id ? color(dataTableRecipe.row.selectedBackground) : "transparent";
  function row(rowDescriptor: DataTableRowDescriptor<RowKey>, part: "pinned" | "scrolling") {
    const list = part === "pinned" ? pinned : scrolling;
    const cells = <View style={{ flexDirection: "row" }}>{list.map(column => cell(renderCell(rowDescriptor.id, column.id), column, part === "pinned", part === "pinned" || sortState?.columnId === column.id, `${rowDescriptor.id}-${column.id}`))}</View>;
    const style = { height: rowHeight, borderTopWidth: 1, borderColor: color(dataTableRecipe.row.borderBottom), backgroundColor: rowBackground(rowDescriptor.id), opacity: rowDescriptor.disabled ? 0.5 : 1 };
    // Only the pinned half carries the accessible row button so a row is announced once.
    const name = part === "pinned" ? columns.map(column => { const value = renderCell(rowDescriptor.id, column.id); return typeof value === "string" || typeof value === "number" ? `${column.header} ${value}` : column.header; }).join(", ") : undefined;
    return onRowPress && !rowDescriptor.disabled
      ? <Pressable key={rowDescriptor.id} accessible={part === "pinned" || pinned.length === 0} accessibilityRole="button" accessibilityState={{ selected: selectedRowId === rowDescriptor.id }} accessibilityLabel={name}
          onPressIn={() => setPressed(rowDescriptor.id)} onPressOut={() => setPressed(null)} onPress={() => onRowPress(rowDescriptor.id)} style={style}>{cells}</Pressable>
      : <View key={rowDescriptor.id} accessible={part === "pinned" || pinned.length === 0} accessibilityLabel={name} style={style}>{cells}</View>;
  }
  const summary = (list: readonly DataTableColumnDescriptor<ColumnKey>[], part: "pinned" | "scrolling") => summaryRow ? <View style={{ flexDirection: "row", height: rowHeight, borderTopWidth: 1, borderColor: color(dataTableRecipe.header.borderBottom), backgroundColor: color(dataTableRecipe.header.background) }}>
    {list.map(column => cell(summaryRow(column.id), column, part === "pinned", true, `summary-${column.id}`))}
  </View> : null;
  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 4);
  }
  const status = asyncState.status;
  const bodyMessage = status === "loading" || status === "error" || rows.length === 0 ? emptyLabel : null;
  return <View style={[{ gap: spacing.sm }, layoutStyle]}>
    <View accessibilityLabel={labels.table} onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface }}>
      {bodyMessage
        ? <View style={{ minHeight: 120, alignItems: "center", justifyContent: "center", padding: spacing.md }}><Text tone={status === "error" ? "danger" : "muted"} align="center">{bodyMessage}</Text></View>
        : <View style={{ flexDirection: "row" }}>
          {pinned.length > 0 && <View style={{ borderRightWidth: overflow ? 1 : 0, borderColor: color(dataTableRecipe.row.borderBottom) }}>
            <View style={{ flexDirection: "row", backgroundColor: color(dataTableRecipe.header.background) }}>{pinned.map(column => header(column, true))}</View>
            {rows.map(item => row(item, "pinned"))}
            {summary(pinned, "pinned")}
          </View>}
          <View style={{ flex: 1 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={32}>
              <View>
                <View style={{ flexDirection: "row", backgroundColor: color(dataTableRecipe.header.background) }}>{scrolling.map(column => header(column, false))}</View>
                {rows.map(item => row(item, "scrolling"))}
                {summary(scrolling, "scrolling")}
              </View>
            </ScrollView>
            {overflow && !atEnd && <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 24, flexDirection: "row" }}>
              {[0.15, 0.35, 0.55, 0.8].map(alpha => <View key={alpha} style={{ flex: 1, backgroundColor: colors.surface, opacity: alpha }} />)}
            </View>}
          </View>
        </View>}
    </View>
    {footer}
  </View>;
}
