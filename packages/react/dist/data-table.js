import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TableSortButton } from "./table-sort-button.js";
import { dataTableColumnDefaults, dataTableDefaults, getNextDataTableSortState, resolveDataTableSelectAllState, validateDataTableColumns, validateDataTableRows, validateDataTableSortState, } from "@hjmds/design-contracts/components/data-table";
import { forwardRef, useState } from "react";
import { useHjmDensityDefault } from "./provider.js";
import { classNames } from "./internal.js";
function selectedRowKeysFrom(selection) {
    if (!selection || selection.mode === "none")
        return new Set();
    if (selection.mode === "single") {
        const key = selection.selectedKey ?? selection.defaultSelectedKey ?? null;
        return key === null ? new Set() : new Set([key]);
    }
    return selection.selectedKeys ?? selection.defaultSelectedKeys ?? new Set();
}
export const DataTable = forwardRef(function DataTable({ columns, rows, labels, renderCell, selection, sortState = null, sortCycle = dataTableDefaults.sortCycle, onSortChange, asyncState = { status: "idle" }, density: densityProp, footer, className, layoutStyle, }, forwardedRef) {
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
    const [uncontrolledKeys, setUncontrolledKeys] = useState(() => selectedRowKeysFrom(selection));
    const selectedKeys = selectionControlled
        ? selectedRowKeysFrom(selection)
        : uncontrolledKeys;
    const commitSelection = (next) => {
        if (!selectionControlled)
            setUncontrolledKeys(next);
    };
    const selectAllState = multiple ? resolveDataTableSelectAllState(rows, selectedKeys) : false;
    const toggleRow = (row) => {
        if (row.disabled || !selection || selection.mode === "none")
            return;
        if (selection.mode === "single") {
            const current = selectedKeys.has(row.id) ? row.id : null;
            const next = current === row.id && selection.disallowEmptySelection !== true ? null : row.id;
            commitSelection(next === null ? new Set() : new Set([next]));
            selection.onSelectionChange?.(next);
            return;
        }
        const next = new Set(selectedKeys);
        if (next.has(row.id))
            next.delete(row.id);
        else
            next.add(row.id);
        commitSelection(next);
        selection.onSelectionChange?.(next);
    };
    const toggleAll = () => {
        if (!multiple)
            return;
        // Disabled rows stay out of both the denominator and the result, matching
        // the shared select-all accounting.
        const selectable = rows.filter((row) => !row.disabled);
        const next = selectAllState === true
            ? new Set([...selectedKeys].filter((id) => !selectable.some((row) => row.id === id)))
            : new Set([...selectedKeys, ...selectable.map((row) => row.id)]);
        commitSelection(next);
        selection.onSelectionChange?.(next);
    };
    return (_jsxs("div", { className: classNames("hjm-data-table", className), style: layoutStyle, "data-density": density, children: [asyncState.status === "idle" ? null : (_jsx("p", { className: "hjm-data-table__state", role: asyncState.status === "error" ? "alert" : "status", children: asyncState.message })), _jsxs("table", { ref: forwardedRef, className: "hjm-data-table__table", "aria-label": labels.table, "aria-busy": asyncState.status === "loading" || undefined, children: [_jsx("thead", { children: _jsxs("tr", { children: [selection && selection.mode !== "none" ? (_jsx("th", { scope: "col", className: "hjm-data-table__selector", children: multiple ? (_jsx("button", { type: "button", role: "checkbox", "aria-checked": selectAllState === "mixed" ? "mixed" : String(selectAllState === true), "aria-label": labels.selectAll, className: "hjm-data-table__check", onClick: toggleAll, children: selectAllState === true ? "✓" : selectAllState === "mixed" ? "–" : "" })) : null })) : null, columns.map((column) => {
                                    const sorted = sortState?.columnId === column.id ? sortState.direction : null;
                                    return (_jsx("th", { scope: "col", "aria-sort": sorted ?? undefined, style: { inlineSize: column.width, textAlign: column.align ?? dataTableColumnDefaults.align }, children: column.sortable ? (
                                        // A button inside the header, never the header itself.
                                        _jsx(TableSortButton, { header: column.header, direction: sorted, glyphs: { ascending: "▲", descending: "▼", none: "↕" }, className: "hjm-data-table__sort", accessibleName: labels.sortColumn(column.header, sortState), onSort: () => onSortChange?.(getNextDataTableSortState(sortState, column.id, sortCycle)) })) : column.header }, column.id));
                                })] }) }), _jsx("tbody", { children: rows.map((row) => (_jsxs("tr", { "aria-selected": selection && selection.mode !== "none" ? selectedKeys.has(row.id) : undefined, "data-disabled": row.disabled || undefined, children: [selection && selection.mode !== "none" ? (_jsx("td", { className: "hjm-data-table__selector", children: _jsx("button", { type: "button", role: multiple ? "checkbox" : "radio", "aria-checked": selectedKeys.has(row.id), "aria-label": labels.selectRow(row.id), "aria-disabled": row.disabled || undefined, className: "hjm-data-table__check", onClick: () => toggleRow(row), children: selectedKeys.has(row.id) ? "✓" : "" }) })) : null, columns.map((column) => (_jsx("td", { style: { textAlign: column.align ?? dataTableColumnDefaults.align }, children: renderCell(row.id, column.id) }, column.id)))] }, row.id))) })] }), footer ? _jsx("div", { className: "hjm-data-table__footer", children: footer }) : null] }));
});
//# sourceMappingURL=data-table.js.map