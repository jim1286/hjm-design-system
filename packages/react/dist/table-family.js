import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { dataTableFamilyRecipe, dataTableRecipe, formatLineScoreCell, resolveComparisonRow, resolveLineScore, resolveMatrix, } from "@hjmds/design-contracts/components/data-table";
import { classNames } from "./internal.js";
/*
 * Table family companions (2026-10-14): layouts products kept hand-building next to DataTable.
 * LineScore follows MLB/ESPN game headers, MatrixTable a head-to-head cross table, ComparisonTable
 * the ESPN matchup rows. Geometry and rules live in the data-table contract; these only draw.
 */
function kebab(value) {
    return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
/** Recipe colors resolve through the provider's CSS variables so a theme switch repaints without re-rendering (same as Chart). */
export function tableCssColor(reference) {
    const name = reference.source === "theme"
        ? `--hjm-color-${kebab(reference.key)}`
        : reference.source === "accent" ? `--hjm-accent-${kebab(reference.key)}` : `--hjm-accent-fill-${kebab(reference.key)}`;
    return reference.alpha === undefined || reference.alpha === 1
        ? `var(${name})`
        : `color-mix(in srgb, var(${name}) ${Math.round(reference.alpha * 100)}%, transparent)`;
}
/** Live period and "my team" row reuse the shared selected-row tint. */
const familyStyle = { "--hjm-table-family-selected": tableCssColor(dataTableRecipe.row.selectedBackground) };
const withFamilyStyle = (layoutStyle) => ({ ...familyStyle, ...layoutStyle });
/**
 * Cell emphasis as inline style. Heat paints a background *image* so pinned cells keep their opaque
 * canvas color underneath and scrolled content never shows through the translucent tint.
 */
export function tableCellEmphasis(decoration, heatColors) {
    if (!decoration)
        return { style: {} };
    const style = {};
    const tone = decoration.tone ?? undefined, heat = decoration.heat ?? null;
    if (tone) {
        style.color = tableCssColor(dataTableFamilyRecipe.tone[tone].color);
        style.fontWeight = dataTableFamilyRecipe.tone[tone].fontWeight;
    }
    if (heat) {
        const base = heatColors?.[heat.side] ?? tableCssColor(dataTableFamilyRecipe.heat[heat.side]);
        style["--hjm-data-table-heat"] = `color-mix(in srgb, ${base} ${Math.round(dataTableFamilyRecipe.heatAlpha[heat.strength] * 100)}%, transparent)`;
    }
    return { style: style, ...(tone ? { tone } : {}), ...(heat ? { heat: `${heat.side}-${heat.strength}` } : {}) };
}
export function LineScore({ teams, totals, currentPeriod = null, minPeriods, renderTeam, accessibilityLabel, className, layoutStyle }) {
    const score = resolveLineScore(teams, { totals, currentPeriod, ...(minPeriods !== undefined ? { minPeriods } : {}) });
    const periods = score.columns.filter((column) => column.kind === "period");
    const totalColumns = score.columns.filter((column) => column.kind === "total");
    return (_jsx("div", { className: classNames("hjm-table-family", "hjm-line-score", className), style: withFamilyStyle(layoutStyle), children: _jsxs("table", { className: "hjm-line-score__table", "aria-label": accessibilityLabel, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("td", { className: "hjm-line-score__team" }), periods.map((column, index) => {
                                const live = score.currentPeriod === index + 1;
                                return _jsx("th", { scope: "col", className: "hjm-line-score__period", "aria-current": live ? "true" : undefined, "data-current": live || undefined, children: column.header }, column.id);
                            }), totalColumns.map((column, index) => (_jsx("th", { scope: "col", className: classNames("hjm-line-score__total", index === 0 && "hjm-line-score__total-edge"), children: column.header }, column.id)))] }) }), _jsx("tbody", { children: teams.map((team) => (_jsxs("tr", { "data-leader": score.leaderId === team.id || undefined, children: [_jsx("th", { scope: "row", className: "hjm-line-score__team", children: _jsxs("span", { className: "hjm-line-score__team-content", children: [renderTeam?.(team), _jsx("span", { children: team.name })] }) }), periods.map((column, index) => {
                                const value = team.periods[index];
                                return _jsx("td", { className: "hjm-line-score__period", "data-current": score.currentPeriod === index + 1 || undefined, "data-scored": typeof value === "number" && value > 0 || undefined, children: formatLineScoreCell(value) }, column.id);
                            }), totalColumns.map((column, index) => (_jsx("td", { className: classNames("hjm-line-score__total", index === 0 && "hjm-line-score__total-edge"), children: team.totals[column.header] ?? "—" }, column.id)))] }, team.id))) })] }) }));
}
export function MatrixTable({ ids, labelOf, getCell, highlightId = null, heatColors, accessibilityLabel, className, layoutStyle }) {
    const matrix = resolveMatrix(ids, getCell);
    return (_jsx("div", { className: classNames("hjm-table-family", "hjm-matrix-table", className), style: withFamilyStyle(layoutStyle), children: _jsxs("table", { className: "hjm-matrix-table__table", "aria-label": accessibilityLabel, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("td", { className: "hjm-matrix-table__corner" }), ids.map((id) => _jsx("th", { scope: "col", children: labelOf(id) }, id))] }) }), _jsx("tbody", { children: matrix.map((cells, rowIndex) => {
                        const rowId = ids[rowIndex];
                        return (_jsxs("tr", { "data-highlighted": rowId === highlightId || undefined, children: [_jsx("th", { scope: "row", children: labelOf(rowId) }), cells.map((cell, columnIndex) => {
                                    // The diagonal is a team against itself: blank and hidden, not "no record".
                                    if (cell === "self")
                                        return _jsx("td", { className: "hjm-matrix-table__self", "aria-hidden": "true" }, ids[columnIndex]);
                                    const emphasis = tableCellEmphasis(cell, heatColors);
                                    return _jsx("td", { className: emphasis.heat ? "hjm-table-family__heat" : undefined, style: emphasis.style, "data-tone": emphasis.tone, "data-heat": emphasis.heat, children: cell?.label ?? "—" }, ids[columnIndex]);
                                })] }, rowId));
                    }) })] }) }));
}
export function ComparisonTable({ rows, sides, showSideNames = true, accessibilityLabel, className, layoutStyle }) {
    return (_jsxs("section", { className: classNames("hjm-table-family", "hjm-comparison-table", className), style: withFamilyStyle(layoutStyle), "aria-label": accessibilityLabel, children: [showSideNames && _jsx("div", { className: "hjm-comparison-table__sides", "aria-hidden": "true", children: sides.map((side, index) => _jsx("span", { style: { color: side.color }, children: side.name }, index)) }), _jsx("ul", { className: "hjm-comparison-table__rows", role: "list", children: rows.map((row) => {
                    const { winner, shares } = resolveComparisonRow(row);
                    const shown = row.display ?? [row.values[0] === null ? "—" : String(row.values[0]), row.values[1] === null ? "—" : String(row.values[1])];
                    return (_jsxs("li", { className: "hjm-comparison-table__row", "data-winner": winner ?? undefined, children: [_jsx("span", { className: "hjm-visually-hidden", children: `${row.label} ${sides[0].name} ${shown[0]}, ${sides[1].name} ${shown[1]}` }), _jsxs("div", { className: "hjm-comparison-table__values", "aria-hidden": "true", children: [_jsx("span", { "data-win": winner === 0 || undefined, children: shown[0] }), _jsx("span", { className: "hjm-comparison-table__label", children: row.label }), _jsx("span", { "data-win": winner === 1 || undefined, children: shown[1] })] }), _jsx("div", { className: "hjm-comparison-table__bars", "aria-hidden": "true", children: [0, 1].map((index) => (_jsx("span", { className: "hjm-comparison-table__track", "data-side": index, children: _jsx("span", { className: "hjm-comparison-table__bar", style: { inlineSize: `${Math.round(shares[index] * 1000) / 10}%`, background: sides[index].color, opacity: winner === null || winner === index ? 1 : 0.6 } }) }, index))) })] }, row.id));
                }) })] }));
}
//# sourceMappingURL=table-family.js.map