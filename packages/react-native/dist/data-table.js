import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text as NativeText, View } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { dataTableColumnDefaults, dataTableDefaults, dataTableFirstSortDirection, dataTableRecipe, getNextDataTableSortState, splitPinnedDataTableColumns, validateDataTableColumns, validateDataTableRows, validateDataTableSortState, } from "@hjmds/design-contracts/components/data-table";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
const DEFAULT_WIDTH = 72, PINNED_WIDTH = 96;
const alignOf = (align) => align === "end" ? "right" : align === "center" ? "center" : "left";
export function DataTable({ columns, rows, labels, renderCell, sortState = null, sortCycle = dataTableDefaults.sortCycle, onSortChange, onRowPress, selectedRowId = null, summaryRow, asyncState = { status: "idle" }, emptyLabel, density = dataTableRecipe.defaults.density, footer, layoutStyle, }) {
    validateDataTableColumns(columns);
    validateDataTableRows(rows);
    validateDataTableSortState(sortState, columns);
    const theme = useHjmNativeTheme(), { colors } = theme;
    const color = (reference) => resolveColorReference(reference, theme.palette);
    const [width, setWidth] = useState(0), [atEnd, setAtEnd] = useState(false), [pressed, setPressed] = useState(null);
    const { pinned, scrolling } = useMemo(() => splitPinnedDataTableColumns(columns), [columns]);
    const pad = dataTableRecipe.density[density];
    const rowHeight = density === "compact" ? 40 : 48, headerHeight = density === "compact" ? 34 : 40;
    const pinnedWidth = pinned.reduce((sum, column) => sum + (column.width ?? PINNED_WIDTH), 0);
    // Short tables stretch scrolling columns to fill the card; wide ones keep their widths and scroll.
    const natural = scrolling.reduce((sum, column) => sum + (column.width ?? DEFAULT_WIDTH), 0);
    const stretch = width > 0 && natural > 0 && natural < width - pinnedWidth ? (width - pinnedWidth) / natural : 1;
    const widthOf = (column, pinnedColumn) => pinnedColumn ? column.width ?? PINNED_WIDTH : (column.width ?? DEFAULT_WIDTH) * stretch;
    const overflow = width > 0 && pinnedWidth + natural > width + 1;
    function header(column, pinnedColumn) {
        const sortable = column.sortable ?? dataTableColumnDefaults.sortable;
        const active = sortState?.columnId === column.id ? sortState.direction : null;
        const textColor = active ? color(dataTableRecipe.sortButton.activeColor) : color(dataTableRecipe.header.color);
        const content = _jsxs(NativeText, { numberOfLines: 1, style: { color: textColor, fontSize: 12, fontWeight: "700", textAlign: alignOf(column.align ?? dataTableColumnDefaults.align) }, children: [column.header, active ? (active === "ascending" ? " ▲" : " ▼") : ""] });
        const style = { width: widthOf(column, pinnedColumn), height: headerHeight, paddingHorizontal: pad.paddingHorizontal / 2, justifyContent: "center" };
        return sortable && onSortChange
            ? _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: labels.sortColumn(column.header, sortState?.columnId === column.id ? sortState : null), hitSlop: 4, onPress: () => onSortChange(getNextDataTableSortState(sortState, column.id, sortCycle, dataTableFirstSortDirection(column))), style: style, children: content }, column.id)
            : _jsx(View, { accessibilityRole: "header", style: style, children: content }, column.id);
    }
    function cell(node, column, pinnedColumn, emphasis, key) {
        const align = alignOf(column.align ?? dataTableColumnDefaults.align);
        return _jsx(View, { style: { width: widthOf(column, pinnedColumn), height: rowHeight - 1, paddingHorizontal: pad.paddingHorizontal / 2, justifyContent: "center", alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }, children: typeof node === "string" || typeof node === "number"
                ? _jsx(NativeText, { numberOfLines: 1, style: { color: emphasis ? colors.text : color(dataTableRecipe.cell.color), fontSize: 14, fontWeight: emphasis ? "700" : "500", textAlign: align, fontVariant: ["tabular-nums"] }, children: String(node) })
                : node }, key);
    }
    const rowBackground = (id) => pressed === id ? color(dataTableRecipe.row.hoverBackground) : selectedRowId === id ? color(dataTableRecipe.row.selectedBackground) : "transparent";
    function row(rowDescriptor, part) {
        const list = part === "pinned" ? pinned : scrolling;
        const cells = _jsx(View, { style: { flexDirection: "row" }, children: list.map(column => cell(renderCell(rowDescriptor.id, column.id), column, part === "pinned", part === "pinned" || sortState?.columnId === column.id, `${rowDescriptor.id}-${column.id}`)) });
        const style = { height: rowHeight, borderTopWidth: 1, borderColor: color(dataTableRecipe.row.borderBottom), backgroundColor: rowBackground(rowDescriptor.id), opacity: rowDescriptor.disabled ? 0.5 : 1 };
        // Only the pinned half carries the accessible row button so a row is announced once.
        const name = part === "pinned" ? columns.map(column => { const value = renderCell(rowDescriptor.id, column.id); return typeof value === "string" || typeof value === "number" ? `${column.header} ${value}` : column.header; }).join(", ") : undefined;
        return onRowPress && !rowDescriptor.disabled
            ? _jsx(Pressable, { accessible: part === "pinned" || pinned.length === 0, accessibilityRole: "button", accessibilityState: { selected: selectedRowId === rowDescriptor.id }, accessibilityLabel: name, onPressIn: () => setPressed(rowDescriptor.id), onPressOut: () => setPressed(null), onPress: () => onRowPress(rowDescriptor.id), style: style, children: cells }, rowDescriptor.id)
            : _jsx(View, { accessible: part === "pinned" || pinned.length === 0, accessibilityLabel: name, style: style, children: cells }, rowDescriptor.id);
    }
    const summary = (list, part) => summaryRow ? _jsx(View, { style: { flexDirection: "row", height: rowHeight, borderTopWidth: 1, borderColor: color(dataTableRecipe.header.borderBottom), backgroundColor: color(dataTableRecipe.header.background) }, children: list.map(column => cell(summaryRow(column.id), column, part === "pinned", true, `summary-${column.id}`)) }) : null;
    function onScroll(event) {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        setAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 4);
    }
    const status = asyncState.status;
    const bodyMessage = status === "loading" || status === "error" || rows.length === 0 ? emptyLabel : null;
    return _jsxs(View, { style: [{ gap: spacing.sm }, layoutStyle], children: [_jsx(View, { accessibilityLabel: labels.table, onLayout: event => setWidth(event.nativeEvent.layout.width), style: { borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface }, children: bodyMessage
                    ? _jsx(View, { style: { minHeight: 120, alignItems: "center", justifyContent: "center", padding: spacing.md }, children: _jsx(Text, { tone: status === "error" ? "danger" : "muted", align: "center", children: bodyMessage }) })
                    : _jsxs(View, { style: { flexDirection: "row" }, children: [pinned.length > 0 && _jsxs(View, { style: { borderRightWidth: overflow ? 1 : 0, borderColor: color(dataTableRecipe.row.borderBottom) }, children: [_jsx(View, { style: { flexDirection: "row", backgroundColor: color(dataTableRecipe.header.background) }, children: pinned.map(column => header(column, true)) }), rows.map(item => row(item, "pinned")), summary(pinned, "pinned")] }), _jsxs(View, { style: { flex: 1 }, children: [_jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, onScroll: onScroll, scrollEventThrottle: 32, children: _jsxs(View, { children: [_jsx(View, { style: { flexDirection: "row", backgroundColor: color(dataTableRecipe.header.background) }, children: scrolling.map(column => header(column, false)) }), rows.map(item => row(item, "scrolling")), summary(scrolling, "scrolling")] }) }), overflow && !atEnd && _jsx(View, { pointerEvents: "none", accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "absolute", right: 0, top: 0, bottom: 0, width: 24, flexDirection: "row" }, children: [0.15, 0.35, 0.55, 0.8].map(alpha => _jsx(View, { style: { flex: 1, backgroundColor: colors.surface, opacity: alpha } }, alpha)) })] })] }) }), footer] });
}
//# sourceMappingURL=data-table.js.map