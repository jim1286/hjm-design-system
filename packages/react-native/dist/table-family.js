import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ScrollView, Text as NativeText, View } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { dataTableFamilyRecipe, dataTableRecipe, formatLineScoreCell, resolveComparisonRow, resolveLineScore, resolveMatrix, } from "@hjmds/design-contracts/components/data-table";
import { spacing } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "./provider.js";
/*
 * Table family companions (2026-10-14): layouts products kept hand-building next to DataTable.
 * LineScore follows MLB/ESPN game headers, MatrixTable a head-to-head cross table, ComparisonTable
 * the ESPN matchup rows. Geometry and rules live in the data-table contract; these only draw.
 */
function usePalette() {
    const theme = useHjmNativeTheme();
    return { colors: theme.colors, color: (reference) => resolveColorReference(reference, theme.palette) };
}
const num = { fontVariant: ["tabular-nums"] };
export function LineScore({ teams, totals, currentPeriod = null, minPeriods, renderTeam, accessibilityLabel, layoutStyle }) {
    const { colors, color } = usePalette();
    const score = resolveLineScore(teams, { totals, currentPeriod, ...(minPeriods !== undefined ? { minPeriods } : {}) });
    const periods = score.columns.filter(column => column.kind === "period"), totalColumns = score.columns.filter(column => column.kind === "total");
    // Nine innings plus R/H/E/B fit a 360pt phone without scrolling; a team mark (renderTeam) replaces the
    // visible name, which stays in the row's accessibility label (2026-10-14 Yajalal device check: "L…").
    const CELL = 23, TOTAL = 27, ROW = 36, NAME = renderTeam ? 40 : 64;
    const header = color(dataTableRecipe.header.color), live = color(dataTableRecipe.sortButton.activeColor);
    const rowLabel = (team) => `${team.name} ${totalColumns.map(column => `${column.header} ${team.totals[column.header] ?? "—"}`).join(", ")}`;
    return _jsxs(View, { accessibilityLabel: accessibilityLabel, style: [{ flexDirection: "row", borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface, paddingVertical: spacing.xs }, layoutStyle], children: [_jsxs(View, { children: [_jsx(View, { style: { height: 26 } }), teams.map(team => _jsx(View, { accessible: true, accessibilityLabel: rowLabel(team), style: { height: ROW, width: NAME, flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: spacing.sm }, children: renderTeam ? renderTeam(team) : _jsx(NativeText, { numberOfLines: 1, style: { flex: 1, color: score.leaderId === team.id ? colors.text : colors.textBody, fontSize: 14, fontWeight: score.leaderId === team.id ? "800" : "600" }, children: team.name }) }, team.id))] }), _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: { flex: 1 }, contentContainerStyle: { flexGrow: 1, justifyContent: "flex-end" }, children: periods.map((column, index) => {
                    const isLive = score.currentPeriod === index + 1;
                    return _jsxs(View, { importantForAccessibility: "no-hide-descendants", accessibilityElementsHidden: true, style: { width: CELL, alignItems: "center", borderRadius: 8, backgroundColor: isLive ? color(dataTableRecipe.row.selectedBackground) : "transparent" }, children: [_jsx(NativeText, { style: { height: 26, lineHeight: 26, color: isLive ? live : header, fontSize: 11, fontWeight: "700" }, children: column.header }), teams.map(team => _jsx(NativeText, { style: { height: ROW, lineHeight: ROW, color: team.periods[index] ? colors.text : colors.textMuted, fontSize: 14, fontWeight: team.periods[index] ? "700" : "500", ...num }, children: formatLineScoreCell(team.periods[index]) }, team.id))] }, column.id);
                }) }), _jsx(View, { importantForAccessibility: "no-hide-descendants", accessibilityElementsHidden: true, style: { flexDirection: "row", borderLeftWidth: 1, borderColor: color(dataTableRecipe.row.borderBottom), paddingHorizontal: 4 }, children: totalColumns.map((column, index) => _jsxs(View, { style: { width: TOTAL, alignItems: "center" }, children: [_jsx(NativeText, { style: { height: 26, lineHeight: 26, color: header, fontSize: 11, fontWeight: "700" }, children: column.header }), teams.map(team => _jsx(NativeText, { style: { height: ROW, lineHeight: ROW, color: index === 0 ? colors.text : colors.textBody, fontSize: index === 0 ? 16 : 14, fontWeight: index === 0 ? "800" : "600", ...num }, children: team.totals[column.header] ?? "—" }, team.id))] }, column.id)) })] });
}
export function MatrixTable({ ids, labelOf, getCell, highlightId = null, heatColors, accessibilityLabel, layoutStyle }) {
    const { colors, color } = usePalette();
    const matrix = resolveMatrix(ids, getCell);
    const heat = { high: heatColors?.high ?? color(dataTableFamilyRecipe.heat.high), low: heatColors?.low ?? color(dataTableFamilyRecipe.heat.low) };
    const CELL = 58, NAME = 52, ROW = 38;
    const border = color(dataTableRecipe.row.borderBottom);
    return _jsxs(View, { accessibilityLabel: accessibilityLabel, style: [{ flexDirection: "row", borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface }, layoutStyle], children: [_jsxs(View, { style: { borderRightWidth: 1, borderColor: border }, children: [_jsx(View, { style: { height: 32 } }), ids.map(id => _jsx(View, { style: { width: NAME, height: ROW, justifyContent: "center", paddingHorizontal: spacing.sm, borderTopWidth: 1, borderColor: border, backgroundColor: id === highlightId ? color(dataTableRecipe.row.selectedBackground) : "transparent" }, children: _jsx(NativeText, { numberOfLines: 1, style: { color: colors.text, fontSize: 13, fontWeight: "700" }, children: labelOf(id) }) }, id))] }), _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, children: _jsxs(View, { children: [_jsx(View, { style: { flexDirection: "row", height: 32 }, children: ids.map(id => _jsx(NativeText, { accessibilityRole: "header", numberOfLines: 1, style: { width: CELL, lineHeight: 32, textAlign: "center", color: color(dataTableRecipe.header.color), fontSize: 12, fontWeight: "700" }, children: labelOf(id) }, id)) }), matrix.map((cells, rowIndex) => _jsx(View, { style: { flexDirection: "row", height: ROW, borderTopWidth: 1, borderColor: border, backgroundColor: ids[rowIndex] === highlightId ? color(dataTableRecipe.row.selectedBackground) : "transparent" }, children: cells.map((cell, columnIndex) => {
                                const name = `${labelOf(ids[rowIndex])} 대 ${labelOf(ids[columnIndex])}`;
                                if (cell === "self")
                                    return _jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no", style: { width: CELL, backgroundColor: color(dataTableFamilyRecipe.groupRow.background) } }, columnIndex);
                                const tone = cell?.tone ? dataTableFamilyRecipe.tone[cell.tone] : null;
                                return _jsxs(View, { accessible: true, accessibilityLabel: `${name} ${cell?.label ?? "—"}`, style: { width: CELL, alignItems: "center", justifyContent: "center" }, children: [cell?.heat && _jsx(View, { pointerEvents: "none", style: { position: "absolute", left: 3, right: 3, top: 5, bottom: 5, borderRadius: 6, backgroundColor: heat[cell.heat.side], opacity: dataTableFamilyRecipe.heatAlpha[cell.heat.strength] } }), _jsx(NativeText, { numberOfLines: 1, style: { color: tone ? color(tone.color) : colors.textBody, fontSize: 12, fontWeight: tone ? tone.fontWeight : "600", ...num }, children: cell?.label ?? "—" })] }, columnIndex);
                            }) }, ids[rowIndex]))] }) })] });
}
export function ComparisonTable({ rows, sides, accessibilityLabel, layoutStyle }) {
    const { colors, color } = usePalette();
    const [width, setWidth] = useState(0);
    return _jsxs(View, { accessibilityLabel: accessibilityLabel, onLayout: event => setWidth(event.nativeEvent.layout.width), style: [{ borderRadius: 12, backgroundColor: colors.surface, paddingVertical: spacing.xs }, layoutStyle], children: [_jsx(View, { style: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.xs }, children: sides.map((side, index) => _jsx(NativeText, { numberOfLines: 1, style: { color: side.color, fontSize: 13, fontWeight: "800" }, children: side.name }, index)) }), rows.map(row => {
                const { winner, shares } = resolveComparisonRow(row);
                const shown = row.display ?? [row.values[0] === null ? "—" : String(row.values[0]), row.values[1] === null ? "—" : String(row.values[1])];
                const half = Math.max(0, width / 2 - spacing.md - 4);
                return _jsxs(View, { accessible: true, accessibilityLabel: `${row.label} ${sides[0].name} ${shown[0]}, ${sides[1].name} ${shown[1]}`, style: { paddingHorizontal: spacing.md, paddingVertical: 7, borderTopWidth: 1, borderColor: color(dataTableRecipe.row.borderBottom), gap: 5 }, children: [_jsxs(View, { style: { flexDirection: "row", alignItems: "center" }, children: [_jsx(NativeText, { style: { flex: 1, color: winner === 0 ? colors.text : colors.textMuted, fontSize: 15, fontWeight: winner === 0 ? "800" : "500", ...num }, children: shown[0] }), _jsx(NativeText, { style: { color: colors.textMuted, fontSize: 12, fontWeight: "600" }, children: row.label }), _jsx(NativeText, { style: { flex: 1, textAlign: "right", color: winner === 1 ? colors.text : colors.textMuted, fontSize: 15, fontWeight: winner === 1 ? "800" : "500", ...num }, children: shown[1] })] }), _jsx(View, { style: { flexDirection: "row", gap: 8, height: 4 }, children: [0, 1].map(index => _jsx(View, { style: { flex: 1, flexDirection: index === 0 ? "row-reverse" : "row", backgroundColor: colors.surfaceAlt, borderRadius: 2 }, children: _jsx(View, { style: { width: half * shares[index], borderRadius: 2, backgroundColor: sides[index].color, opacity: winner === null || winner === index ? 1 : 0.35 } }) }, index)) })] }, row.id);
            })] });
}
//# sourceMappingURL=table-family.js.map