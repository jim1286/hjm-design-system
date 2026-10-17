import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text as NativeText, View } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { dataTableColumnDefaults, dataTableDefaults, dataTableFamilyRecipe, dataTableFirstSortDirection, dataTableRecipe, getNextDataTableSortState, resolveDataTableBody, resolveDataTableHeaderBands, splitPinnedDataTableColumns, validateDataTableColumns, validateDataTableRows, validateDataTableSortState, } from "@hjmds/design-contracts/components/data-table";
import { spacing } from "@hjmds/design-contracts/foundations";
import { textRecipe } from "@hjmds/design-contracts/recipes";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
const DEFAULT_WIDTH = 72, PINNED_WIDTH = 96;
const alignOf = (align) => align === "end" ? "right" : align === "center" ? "center" : "left";
export function DataTable({ columns, rows, labels, renderCell, sortState = null, sortCycle = dataTableDefaults.sortCycle, onSortChange, onRowPress, selectedRowId = null, summaryRow, asyncState = { status: "idle" }, emptyLabel, density = dataTableRecipe.defaults.density, footer, layoutStyle, columnGroups = [], rowGroups = [], cellStyle, heatColors, maxBodyHeight, }) {
    validateDataTableColumns(columns);
    validateDataTableRows(rows);
    validateDataTableSortState(sortState, columns);
    const theme = useHjmNativeTheme(), { colors } = theme;
    const color = (reference) => resolveColorReference(reference, theme.palette);
    const [width, setWidth] = useState(0), [atEnd, setAtEnd] = useState(false), [pressed, setPressed] = useState(null);
    const [textWidths, setTextWidths] = useState({});
    const { pinned, scrolling } = useMemo(() => splitPinnedDataTableColumns(columns), [columns]);
    const pad = dataTableRecipe.density[density];
    const rowHeight = density === "compact" ? 40 : 48, headerHeight = density === "compact" ? 34 : 40;
    // A declared width is a minimum: exact records and complete headers must remain readable.
    // Measure with the native font in an unconstrained horizontal rail, independent of the
    // visible column width, so truncation cannot feed a smaller width back into sizing.
    const measure = (key, measured) => setTextWidths(previous => previous[key] === measured ? previous : { ...previous, [key]: measured });
    const naturalWidth = (column, pinnedColumn) => Math.max(column.width ?? (pinnedColumn ? PINNED_WIDTH : DEFAULT_WIDTH), Math.ceil(Math.max(textWidths[`${column.id}:header`] ?? 0, textWidths[`${column.id}:body`] ?? 0)) + pad.paddingHorizontal);
    const pinnedWidth = pinned.reduce((sum, column) => sum + naturalWidth(column, true), 0);
    // Short tables stretch scrolling columns to fill the card; wide ones keep their widths and scroll.
    const natural = scrolling.reduce((sum, column) => sum + naturalWidth(column, false), 0);
    const stretch = width > 0 && natural > 0 && natural < width - pinnedWidth ? (width - pinnedWidth) / natural : 1;
    const widthOf = (column, pinnedColumn) => naturalWidth(column, pinnedColumn) * (pinnedColumn ? 1 : stretch);
    const overflow = width > 0 && pinnedWidth + natural > width + 1;
    function header(column, pinnedColumn) {
        const sortable = column.sortable ?? dataTableColumnDefaults.sortable;
        const active = sortState?.columnId === column.id ? sortState.direction : null;
        const textColor = active ? color(dataTableRecipe.sortButton.activeColor) : color(dataTableRecipe.header.color);
        const content = _jsxs(NativeText, { numberOfLines: 1, style: { color: textColor, fontSize: 12, fontWeight: dataTableRecipe.header.fontWeight, textAlign: alignOf(column.align ?? dataTableColumnDefaults.align) }, children: [column.header, active ? (active === "ascending" ? " ▲" : " ▼") : ""] });
        const style = { width: widthOf(column, pinnedColumn), flexShrink: 0, height: headerHeight, paddingHorizontal: pad.paddingHorizontal / 2, justifyContent: "center" };
        return sortable && onSortChange
            ? _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: labels.sortColumn(column.header, sortState?.columnId === column.id ? sortState : null), hitSlop: 4, onPress: () => onSortChange(getNextDataTableSortState(sortState, column.id, sortCycle, dataTableFirstSortDirection(column))), style: style, children: content }, column.id)
            : _jsx(View, { accessibilityRole: "header", style: style, children: content }, column.id);
    }
    const heatBase = { high: heatColors?.high ?? color(dataTableFamilyRecipe.heat.high), low: heatColors?.low ?? color(dataTableFamilyRecipe.heat.low) };
    function cell(node, column, pinnedColumn, emphasis, key, decoration = null, indent = 0) {
        const align = alignOf(column.align ?? dataTableColumnDefaults.align);
        const tone = decoration?.tone ? dataTableFamilyRecipe.tone[decoration.tone] : null, heat = decoration?.heat ?? null;
        return _jsxs(View, { style: { width: widthOf(column, pinnedColumn), flexShrink: 0, height: rowHeight - 1, paddingHorizontal: pad.paddingHorizontal / 2, paddingLeft: pad.paddingHorizontal / 2 + indent, justifyContent: "center", alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }, children: [heat && _jsx(View, { pointerEvents: "none", style: { position: "absolute", left: 2, right: 2, top: 4, bottom: 4, borderRadius: 6, backgroundColor: heatBase[heat.side], opacity: dataTableFamilyRecipe.heatAlpha[heat.strength] } }), typeof node === "string" || typeof node === "number"
                    ? _jsx(NativeText, { numberOfLines: 1, style: { color: tone ? color(tone.color) : emphasis ? colors.text : color(dataTableRecipe.cell.color), fontSize: 14, fontWeight: tone ? tone.fontWeight : emphasis ? textRecipe.emphasis.medium : textRecipe.emphasis.regular, textAlign: align, fontVariant: ["tabular-nums"] }, children: String(node) })
                    : node] }, key);
    }
    const rowBackground = (id) => pressed === id ? color(dataTableRecipe.row.hoverBackground) : selectedRowId === id ? color(dataTableRecipe.row.selectedBackground) : "transparent";
    function row(rowDescriptor, part) {
        const list = part === "pinned" ? pinned : scrolling;
        const cells = _jsx(View, { style: { flexDirection: "row" }, children: list.map((column, index) => cell(renderCell(rowDescriptor.id, column.id), column, part === "pinned", part === "pinned" || sortState?.columnId === column.id, `${rowDescriptor.id}-${column.id}`, cellStyle?.(rowDescriptor.id, column.id) ?? null, index === 0 && (part === "pinned" || pinned.length === 0) ? (rowDescriptor.depth ?? 0) * dataTableFamilyRecipe.depthIndent : 0)) });
        const style = { height: rowHeight, borderTopWidth: 1, borderColor: color(dataTableRecipe.row.borderBottom), backgroundColor: rowBackground(rowDescriptor.id), opacity: rowDescriptor.disabled ? 0.5 : 1 };
        // Only the pinned half carries the accessible row button so a row is announced once.
        const name = part === "pinned" ? columns.map(column => { const value = renderCell(rowDescriptor.id, column.id); return typeof value === "string" || typeof value === "number" ? `${column.header} ${value}` : column.header; }).join(", ") : undefined;
        return onRowPress && !rowDescriptor.disabled
            ? _jsx(Pressable, { accessible: part === "pinned" || pinned.length === 0, accessibilityRole: "button", accessibilityState: { selected: selectedRowId === rowDescriptor.id }, accessibilityLabel: name, onPressIn: () => setPressed(rowDescriptor.id), onPressOut: () => setPressed(null), onPress: () => onRowPress(rowDescriptor.id), style: style, children: cells }, rowDescriptor.id)
            : _jsx(View, { accessible: part === "pinned" || pinned.length === 0, accessibilityLabel: name, style: style, children: cells }, rowDescriptor.id);
    }
    const summary = (list, part) => summaryRow ? _jsx(View, { style: { flexDirection: "row", height: rowHeight, borderTopWidth: 1, borderColor: color(dataTableRecipe.header.borderBottom), backgroundColor: color(dataTableRecipe.header.background) }, children: list.map(column => cell(summaryRow(column.id), column, part === "pinned", true, `summary-${column.id}`)) }) : null;
    const headerScroll = useRef(null);
    function onScroll(event) {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        // The header lives outside the body so it can stay fixed vertically; it follows the body horizontally.
        headerScroll.current?.scrollTo({ x: contentOffset.x, animated: false });
        setAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 4);
    }
    const body = useMemo(() => resolveDataTableBody(rows, rowGroups), [rows, rowGroups]);
    const rowById = useMemo(() => new Map(rows.map(item => [item.id, item])), [rows]);
    const bandHeight = 26;
    function bands(list, part) {
        if (columnGroups.length === 0)
            return null;
        const resolved = resolveDataTableHeaderBands(list, columnGroups);
        return _jsx(View, { style: { flexDirection: "row", height: bandHeight }, children: resolved.map(band => {
                const width = band.columnIds.reduce((sum, id) => sum + widthOf(list.find(column => column.id === id), part === "pinned"), 0);
                return _jsx(View, { accessibilityRole: band.header ? "header" : undefined, style: { width, justifyContent: "flex-end", paddingHorizontal: pad.paddingHorizontal / 2, paddingBottom: 2 }, children: band.header && _jsx(View, { style: { borderBottomWidth: 1, borderColor: color(dataTableFamilyRecipe.headerBand.borderBottom), paddingBottom: 2 }, children: _jsx(NativeText, { numberOfLines: 1, style: { color: color(dataTableFamilyRecipe.headerBand.color), fontSize: 11, fontWeight: textRecipe.emphasis.medium, textAlign: "center" }, children: band.header }) }) }, band.id);
            }) });
    }
    function groupRow(id, label, part) {
        const showLabel = part === "pinned" || pinned.length === 0;
        return _jsx(View, { accessibilityRole: showLabel ? "header" : undefined, style: { height: 30, justifyContent: "center", paddingHorizontal: pad.paddingHorizontal / 2, borderTopWidth: 1, borderColor: color(dataTableRecipe.row.borderBottom), backgroundColor: color(dataTableFamilyRecipe.groupRow.background) }, children: showLabel && _jsx(NativeText, { numberOfLines: 1, style: { color: color(dataTableFamilyRecipe.groupRow.color), fontSize: 12, fontWeight: textRecipe.emphasis.medium }, children: label }) }, `group-${id}`);
    }
    const bodyRows = (part) => body.map(item => item.kind === "group" ? groupRow(item.id, item.label, part) : row(rowById.get(item.id), part));
    const headerBackground = color(dataTableRecipe.header.background);
    const status = asyncState.status;
    const bodyMessage = status === "loading" || status === "error" || rows.length === 0 ? emptyLabel : null;
    const columnsBody = _jsxs(View, { style: { flexDirection: "row" }, children: [pinned.length > 0 && _jsxs(View, { style: { borderRightWidth: overflow ? 1 : 0, borderColor: color(dataTableRecipe.row.borderBottom) }, children: [bodyRows("pinned"), summary(pinned, "pinned")] }), _jsxs(View, { style: { flex: 1 }, children: [_jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, onScroll: onScroll, scrollEventThrottle: 16, children: _jsxs(View, { children: [bodyRows("scrolling"), summary(scrolling, "scrolling")] }) }), overflow && !atEnd && _jsx(View, { pointerEvents: "none", accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "absolute", right: 0, top: 0, bottom: 0, width: 24, flexDirection: "row" }, children: [0.15, 0.35, 0.55, 0.8].map(alpha => _jsx(View, { style: { flex: 1, backgroundColor: colors.surface, opacity: alpha } }, alpha)) })] })] });
    return _jsxs(View, { style: [{ gap: spacing.sm }, layoutStyle], children: [_jsx(ScrollView, { horizontal: true, scrollEnabled: false, pointerEvents: "none", "aria-hidden": true, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "absolute", left: 0, right: 0, top: 0, height: 0, opacity: 0 }, children: _jsx(View, { style: { flexDirection: "row" }, children: columns.map(column => {
                        const values = [...rows.map(row => renderCell(row.id, column.id)), summaryRow?.(column.id)]
                            .filter((value) => typeof value === "string" || typeof value === "number");
                        return _jsxs(View, { style: { flexShrink: 0 }, children: [_jsx(NativeText, { onLayout: event => measure(`${column.id}:header`, event.nativeEvent.layout.width), style: { fontSize: 12, fontWeight: dataTableRecipe.header.fontWeight, flexShrink: 0 }, children: `${column.header}${column.sortable ? ` ▲\n${column.header} ▼` : ""}` }), _jsx(NativeText, { onLayout: event => measure(`${column.id}:body`, event.nativeEvent.layout.width), style: { fontSize: 14, fontWeight: dataTableFamilyRecipe.tone.leader.fontWeight, fontVariant: ["tabular-nums"], flexShrink: 0 }, children: values.join("\n") })] }, column.id);
                    }) }) }), _jsx(View, { accessibilityLabel: labels.table, onLayout: event => setWidth(event.nativeEvent.layout.width), style: { borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface }, children: bodyMessage
                    ? _jsx(View, { style: { minHeight: 120, alignItems: "center", justifyContent: "center", padding: spacing.md }, children: _jsx(Text, { tone: status === "error" ? "danger" : "muted", align: "center", children: bodyMessage }) })
                    : _jsxs(_Fragment, { children: [_jsxs(View, { style: { flexDirection: "row", backgroundColor: headerBackground }, children: [pinned.length > 0 && _jsxs(View, { style: { borderRightWidth: overflow ? 1 : 0, borderColor: color(dataTableRecipe.row.borderBottom) }, children: [bands(pinned, "pinned"), _jsx(View, { style: { flexDirection: "row" }, children: pinned.map(column => header(column, true)) })] }), _jsx(ScrollView, { ref: headerScroll, horizontal: true, scrollEnabled: false, showsHorizontalScrollIndicator: false, style: { flex: 1 }, children: _jsxs(View, { children: [bands(scrolling, "scrolling"), _jsx(View, { style: { flexDirection: "row" }, children: scrolling.map(column => header(column, false)) })] }) })] }), maxBodyHeight ? _jsx(ScrollView, { nestedScrollEnabled: true, style: { maxHeight: maxBodyHeight }, children: columnsBody }) : columnsBody] }) }), footer] });
}
export { LineScore, MatrixTable, ComparisonTable } from "./table-family.js";
//# sourceMappingURL=data-table.js.map