import { useMemo, useRef, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text as NativeText, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import {
  dataTableColumnDefaults, dataTableDefaults, dataTableFamilyRecipe, dataTableFirstSortDirection, dataTableRecipe, getNextDataTableSortState,
  resolveDataTableBody, resolveDataTableHeaderBands, splitPinnedDataTableColumns, validateDataTableColumns, validateDataTableRows, validateDataTableSortState,
  type DataTableAsyncState, type DataTableCellHeat, type DataTableCellTone, type DataTableColumnDescriptor, type DataTableColumnGroup, type DataTableDensity,
  type DataTableRowDescriptor, type DataTableRowGroup, type DataTableSortCycle, type DataTableSortState,
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
  /** Header bands above leaf columns (타격 | 주루). */
  columnGroups?: readonly DataTableColumnGroup<ColumnKey>[];
  /** Labeled row sections (선발 / 교체). */
  rowGroups?: readonly DataTableRowGroup<RowKey>[];
  /** Per-cell emphasis decided by the product (AG Grid cellClassRules / Savant percentile heat). */
  cellStyle?: (rowId: RowKey, columnId: ColumnKey) => Readonly<{ tone?: DataTableCellTone | null; heat?: DataTableCellHeat | null }> | null;
  /** Heat base colors; default high = danger red, low = info blue (Savant). */
  heatColors?: Readonly<{ high: string; low: string }>;
  /** Bounds the body height; the header stays fixed while rows scroll (react-native-sticky-table). */
  maxBodyHeight?: number;
  layoutStyle?: HjmCompositionStyleProp;
}>;

const DEFAULT_WIDTH = 72, PINNED_WIDTH = 96;
const alignOf = (align: DataTableColumnDescriptor["align"]) => align === "end" ? "right" : align === "center" ? "center" : "left";

export function DataTable<ColumnKey extends string = string, RowKey extends string = string>({
  columns, rows, labels, renderCell, sortState = null, sortCycle = dataTableDefaults.sortCycle, onSortChange, onRowPress, selectedRowId = null,
  summaryRow, asyncState = { status: "idle" }, emptyLabel, density = dataTableRecipe.defaults.density, footer, layoutStyle,
  columnGroups = [], rowGroups = [], cellStyle, heatColors, maxBodyHeight,
}: DataTableProps<ColumnKey, RowKey>) {
  validateDataTableColumns(columns);
  validateDataTableRows(rows);
  validateDataTableSortState(sortState, columns);
  const theme = useHjmNativeTheme(), { colors } = theme;
  const color = (reference: Parameters<typeof resolveColorReference>[0]) => resolveColorReference(reference, theme.palette);
  const [width, setWidth] = useState(0), [atEnd, setAtEnd] = useState(false), [pressed, setPressed] = useState<RowKey | null>(null);
  const [textWidths, setTextWidths] = useState<Record<string, number>>({});
  const { pinned, scrolling } = useMemo(() => splitPinnedDataTableColumns(columns), [columns]);
  const pad = dataTableRecipe.density[density];
  const rowHeight = density === "compact" ? 40 : 48, headerHeight = density === "compact" ? 34 : 40;
  // A declared width is a minimum: exact records and complete headers must remain readable.
  // Measure with the native font in an unconstrained horizontal rail, independent of the
  // visible column width, so truncation cannot feed a smaller width back into sizing.
  const measure = (key: string, measured: number) => setTextWidths(previous => previous[key] === measured ? previous : { ...previous, [key]: measured });
  const naturalWidth = (column: DataTableColumnDescriptor<ColumnKey>, pinnedColumn: boolean) => Math.max(
    column.width ?? (pinnedColumn ? PINNED_WIDTH : DEFAULT_WIDTH),
    Math.ceil(Math.max(textWidths[`${column.id}:header`] ?? 0, textWidths[`${column.id}:body`] ?? 0)) + pad.paddingHorizontal,
  );
  const pinnedWidth = pinned.reduce((sum, column) => sum + naturalWidth(column, true), 0);
  // Short tables stretch scrolling columns to fill the card; wide ones keep their widths and scroll.
  const natural = scrolling.reduce((sum, column) => sum + naturalWidth(column, false), 0);
  const stretch = width > 0 && natural > 0 && natural < width - pinnedWidth ? (width - pinnedWidth) / natural : 1;
  const widthOf = (column: DataTableColumnDescriptor<ColumnKey>, pinnedColumn: boolean) => naturalWidth(column, pinnedColumn) * (pinnedColumn ? 1 : stretch);
  const overflow = width > 0 && pinnedWidth + natural > width + 1;

  function header(column: DataTableColumnDescriptor<ColumnKey>, pinnedColumn: boolean) {
    const sortable = column.sortable ?? dataTableColumnDefaults.sortable;
    const active = sortState?.columnId === column.id ? sortState.direction : null;
    const textColor = active ? color(dataTableRecipe.sortButton.activeColor) : color(dataTableRecipe.header.color);
    const content = <NativeText numberOfLines={1} style={{ color: textColor, fontSize: 12, fontWeight: "700", textAlign: alignOf(column.align ?? dataTableColumnDefaults.align) }}>
      {column.header}{active ? (active === "ascending" ? " ▲" : " ▼") : ""}
    </NativeText>;
    const style = { width: widthOf(column, pinnedColumn), flexShrink: 0, height: headerHeight, paddingHorizontal: pad.paddingHorizontal / 2, justifyContent: "center" as const };
    return sortable && onSortChange
      ? <Pressable key={column.id} accessibilityRole="button" accessibilityLabel={labels.sortColumn(column.header, sortState?.columnId === column.id ? sortState : null)}
          hitSlop={4} onPress={() => onSortChange(getNextDataTableSortState(sortState, column.id, sortCycle, dataTableFirstSortDirection(column)))} style={style}>{content}</Pressable>
      : <View key={column.id} accessibilityRole="header" style={style}>{content}</View>;
  }
  const heatBase = { high: heatColors?.high ?? color(dataTableFamilyRecipe.heat.high), low: heatColors?.low ?? color(dataTableFamilyRecipe.heat.low) };
  function cell(node: ReactNode, column: DataTableColumnDescriptor<ColumnKey>, pinnedColumn: boolean, emphasis: boolean, key: string, decoration: Readonly<{ tone?: DataTableCellTone | null; heat?: DataTableCellHeat | null }> | null = null, indent = 0) {
    const align = alignOf(column.align ?? dataTableColumnDefaults.align);
    const tone = decoration?.tone ? dataTableFamilyRecipe.tone[decoration.tone] : null, heat = decoration?.heat ?? null;
    return <View key={key} style={{ width: widthOf(column, pinnedColumn), flexShrink: 0, height: rowHeight - 1, paddingHorizontal: pad.paddingHorizontal / 2, paddingLeft: pad.paddingHorizontal / 2 + indent, justifyContent: "center", alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }}>
      {heat && <View pointerEvents="none" style={{ position: "absolute", left: 2, right: 2, top: 4, bottom: 4, borderRadius: 6, backgroundColor: heatBase[heat.side], opacity: dataTableFamilyRecipe.heatAlpha[heat.strength] }} />}
      {typeof node === "string" || typeof node === "number"
        ? <NativeText numberOfLines={1} style={{ color: tone ? color(tone.color) : emphasis ? colors.text : color(dataTableRecipe.cell.color), fontSize: 14, fontWeight: tone ? tone.fontWeight : emphasis ? "700" : "500", textAlign: align, fontVariant: ["tabular-nums"] }}>{String(node)}</NativeText>
        : node}
    </View>;
  }
  const rowBackground = (id: RowKey) => pressed === id ? color(dataTableRecipe.row.hoverBackground) : selectedRowId === id ? color(dataTableRecipe.row.selectedBackground) : "transparent";
  function row(rowDescriptor: DataTableRowDescriptor<RowKey>, part: "pinned" | "scrolling") {
    const list = part === "pinned" ? pinned : scrolling;
    const cells = <View style={{ flexDirection: "row" }}>{list.map((column, index) => cell(renderCell(rowDescriptor.id, column.id), column, part === "pinned", part === "pinned" || sortState?.columnId === column.id, `${rowDescriptor.id}-${column.id}`, cellStyle?.(rowDescriptor.id, column.id) ?? null, index === 0 && (part === "pinned" || pinned.length === 0) ? (rowDescriptor.depth ?? 0) * dataTableFamilyRecipe.depthIndent : 0))}</View>;
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
  const headerScroll = useRef<ScrollView>(null);
  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    // The header lives outside the body so it can stay fixed vertically; it follows the body horizontally.
    headerScroll.current?.scrollTo({ x: contentOffset.x, animated: false });
    setAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 4);
  }
  const body = useMemo(() => resolveDataTableBody(rows, rowGroups), [rows, rowGroups]);
  const rowById = useMemo(() => new Map(rows.map(item => [item.id, item])), [rows]);
  const bandHeight = 26;
  function bands(list: readonly DataTableColumnDescriptor<ColumnKey>[], part: "pinned" | "scrolling") {
    if (columnGroups.length === 0) return null;
    const resolved = resolveDataTableHeaderBands(list, columnGroups);
    return <View style={{ flexDirection: "row", height: bandHeight }}>{resolved.map(band => {
      const width = band.columnIds.reduce((sum, id) => sum + widthOf(list.find(column => column.id === id)!, part === "pinned"), 0);
      return <View key={band.id} accessibilityRole={band.header ? "header" : undefined} style={{ width, justifyContent: "flex-end", paddingHorizontal: pad.paddingHorizontal / 2, paddingBottom: 2 }}>
        {band.header && <View style={{ borderBottomWidth: 1, borderColor: color(dataTableFamilyRecipe.headerBand.borderBottom), paddingBottom: 2 }}>
          <NativeText numberOfLines={1} style={{ color: color(dataTableFamilyRecipe.headerBand.color), fontSize: 11, fontWeight: "700", textAlign: "center" }}>{band.header}</NativeText>
        </View>}
      </View>;
    })}</View>;
  }
  function groupRow(id: string, label: string, part: "pinned" | "scrolling") {
    const showLabel = part === "pinned" || pinned.length === 0;
    return <View key={`group-${id}`} accessibilityRole={showLabel ? "header" : undefined} style={{ height: 30, justifyContent: "center", paddingHorizontal: pad.paddingHorizontal / 2, borderTopWidth: 1, borderColor: color(dataTableRecipe.row.borderBottom), backgroundColor: color(dataTableFamilyRecipe.groupRow.background) }}>
      {showLabel && <NativeText numberOfLines={1} style={{ color: color(dataTableFamilyRecipe.groupRow.color), fontSize: 12, fontWeight: "700" }}>{label}</NativeText>}
    </View>;
  }
  const bodyRows = (part: "pinned" | "scrolling") => body.map(item => item.kind === "group" ? groupRow(item.id, item.label, part) : row(rowById.get(item.id)!, part));
  const headerBackground = color(dataTableRecipe.header.background);
  const status = asyncState.status;
  const bodyMessage = status === "loading" || status === "error" || rows.length === 0 ? emptyLabel : null;
  const columnsBody = <View style={{ flexDirection: "row" }}>
    {pinned.length > 0 && <View style={{ borderRightWidth: overflow ? 1 : 0, borderColor: color(dataTableRecipe.row.borderBottom) }}>{bodyRows("pinned")}{summary(pinned, "pinned")}</View>}
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
        <View>{bodyRows("scrolling")}{summary(scrolling, "scrolling")}</View>
      </ScrollView>
      {overflow && !atEnd && <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 24, flexDirection: "row" }}>
        {[0.15, 0.35, 0.55, 0.8].map(alpha => <View key={alpha} style={{ flex: 1, backgroundColor: colors.surface, opacity: alpha }} />)}
      </View>}
    </View>
  </View>;
  return <View style={[{ gap: spacing.sm }, layoutStyle]}>
    <ScrollView horizontal scrollEnabled={false} pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 0, opacity: 0 }}>
      <View style={{ flexDirection: "row" }}>{columns.map(column => {
        const values = [...rows.map(row => renderCell(row.id, column.id)), summaryRow?.(column.id)]
          .filter((value): value is string | number => typeof value === "string" || typeof value === "number");
        return <View key={column.id} style={{ flexShrink: 0 }}>
          <NativeText onLayout={event => measure(`${column.id}:header`, event.nativeEvent.layout.width)} style={{ fontSize: 12, fontWeight: "700", flexShrink: 0 }}>{`${column.header}${column.sortable ? ` ▲\n${column.header} ▼` : ""}`}</NativeText>
          <NativeText onLayout={event => measure(`${column.id}:body`, event.nativeEvent.layout.width)} style={{ fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"], flexShrink: 0 }}>{values.join("\n")}</NativeText>
        </View>;
      })}</View>
    </ScrollView>
    <View accessibilityLabel={labels.table} onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface }}>
      {bodyMessage
        ? <View style={{ minHeight: 120, alignItems: "center", justifyContent: "center", padding: spacing.md }}><Text tone={status === "error" ? "danger" : "muted"} align="center">{bodyMessage}</Text></View>
        : <>
          <View style={{ flexDirection: "row", backgroundColor: headerBackground }}>
            {pinned.length > 0 && <View style={{ borderRightWidth: overflow ? 1 : 0, borderColor: color(dataTableRecipe.row.borderBottom) }}>{bands(pinned, "pinned")}<View style={{ flexDirection: "row" }}>{pinned.map(column => header(column, true))}</View></View>}
            <ScrollView ref={headerScroll} horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View>{bands(scrolling, "scrolling")}<View style={{ flexDirection: "row" }}>{scrolling.map(column => header(column, false))}</View></View>
            </ScrollView>
          </View>
          {maxBodyHeight ? <ScrollView nestedScrollEnabled style={{ maxHeight: maxBodyHeight }}>{columnsBody}</ScrollView> : columnsBody}
        </>}
    </View>
    {footer}
  </View>;
}

export { LineScore, MatrixTable, ComparisonTable, type LineScoreProps, type MatrixTableProps, type ComparisonTableProps } from "./table-family.js";
