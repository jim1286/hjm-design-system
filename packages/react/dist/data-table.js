"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TableSortButton } from "./table-sort-button.js";
import { dataTableColumnDefaults, dataTableDefaults, dataTableFamilyRecipe, dataTableFirstSortDirection, getNextDataTableSortState, resolveDataTableBody, resolveDataTableHeaderBands, splitPinnedDataTableColumns, resolveDataTableSelectAllState, validateDataTableColumns, validateDataTableRows, validateDataTableSortState, } from "@hjmds/design-contracts/components/data-table";
import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useHjmDensityDefault } from "./provider.js";
import { classNames } from "./internal.js";
import { tableCellEmphasis } from "./table-family.js";
function selectedRowKeysFrom(selection) {
    if (!selection || selection.mode === "none")
        return new Set();
    if (selection.mode === "single") {
        const key = selection.selectedKey ?? selection.defaultSelectedKey ?? null;
        return key === null ? new Set() : new Set([key]);
    }
    return selection.selectedKeys ?? selection.defaultSelectedKeys ?? new Set();
}
/**
 * Pinned columns and bounded heights need their own scroll box (sticky cells stick to it);
 * other tables keep the original DOM.
 */
function TableScroll({ scroll, maxBodyHeight, children }) {
    if (!scroll && maxBodyHeight === undefined)
        return _jsx(_Fragment, { children: children });
    return (_jsx("div", { className: "hjm-data-table__scroll", "data-bounded": maxBodyHeight !== undefined || undefined, style: maxBodyHeight !== undefined ? { maxBlockSize: maxBodyHeight } : undefined, children: children }));
}
/** Splits the resolved body into `tbody` sections: loose rows first, then one per row group. */
function bodySections(items) {
    const sections = [];
    for (const item of items) {
        if (item.kind === "group") {
            sections.push({ group: { id: item.id, label: item.label }, rows: [] });
            continue;
        }
        if (sections.length === 0)
            sections.push({ group: null, rows: [] });
        sections.at(-1).rows.push(item.id);
    }
    // An empty table still renders one (empty) tbody, as before row groups existed.
    return sections.length > 0 ? sections : [{ group: null, rows: [] }];
}
export const DataTable = forwardRef(function DataTable({ columns, rows, labels, renderCell, getCellText, selection, sortState = null, sortCycle = dataTableDefaults.sortCycle, onSortChange, asyncState = { status: "idle" }, density: densityProp, footer, summaryRow, columnGroups, rowGroups, cellStyle, heatColors, maxBodyHeight, className, layoutStyle, }, forwardedRef) {
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
    const hasSelector = selection !== undefined && selection.mode !== "none";
    // Only an unbroken leading run is pinned (contract). Sticky offsets need the rendered widths of
    // the cells before each pinned column, so they are measured rather than guessed from `width`.
    const pinnedCount = splitPinnedDataTableColumns(columns).pinned.length;
    const headerRowRef = useRef(null);
    const [pinnedOffsets, setPinnedOffsets] = useState([]);
    useLayoutEffect(() => {
        const row = headerRowRef.current;
        if (!row || pinnedCount === 0)
            return;
        const stickyCells = pinnedCount + (hasSelector ? 1 : 0);
        const measure = () => {
            const cells = [...row.cells].slice(0, stickyCells);
            const offsets = [];
            let sum = 0;
            for (const cell of cells) {
                offsets.push(sum);
                sum += cell.getBoundingClientRect().width;
            }
            setPinnedOffsets((previous) => previous.length === offsets.length && previous.every((value, i) => value === offsets[i]) ? previous : offsets);
        };
        measure();
        if (typeof ResizeObserver === "undefined")
            return;
        const observer = new ResizeObserver(measure);
        for (const cell of [...row.cells].slice(0, stickyCells))
            observer.observe(cell);
        return () => observer.disconnect();
    }, [pinnedCount, hasSelector, columns]);
    // Sticky props for the selector cell (when pinning) and each pinned column, by visual position.
    const stickyAt = (position, isLast) => {
        if (pinnedCount === 0)
            return {};
        return {
            className: isLast ? "hjm-data-table__pinned hjm-data-table__pinned-edge" : "hjm-data-table__pinned",
            style: { insetInlineStart: pinnedOffsets[position] ?? 0 },
        };
    };
    const selectorSticky = hasSelector && pinnedCount > 0 ? stickyAt(0, false) : {};
    const columnSticky = (index) => index < pinnedCount ? stickyAt(index + (hasSelector ? 1 : 0), index === pinnedCount - 1) : {};
    const selectAllState = multiple ? resolveDataTableSelectAllState(rows, selectedKeys) : false;
    const bands = useMemo(() => columnGroups && columnGroups.length > 0 ? resolveDataTableHeaderBands(columns, columnGroups) : null, [columns, columnGroups]);
    const sections = useMemo(() => bodySections(resolveDataTableBody(rows, rowGroups ?? [])), [rows, rowGroups]);
    const rowById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
    const columnSpan = columns.length + (hasSelector ? 1 : 0);
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
    return (_jsxs("div", { className: classNames("hjm-data-table", className), style: layoutStyle, "data-density": density, children: [asyncState.status === "idle" ? null : (_jsx("p", { className: "hjm-data-table__state", role: asyncState.status === "error" ? "alert" : "status", children: asyncState.message })), _jsx(TableScroll, { scroll: pinnedCount > 0, maxBodyHeight: maxBodyHeight, children: _jsxs("table", { ref: forwardedRef, className: "hjm-data-table__table", "aria-label": labels.table, "aria-busy": asyncState.status === "loading" || undefined, children: [_jsxs("thead", { children: [bands ? (_jsxs("tr", { className: "hjm-data-table__bands", children: [hasSelector ? _jsx("td", { "aria-hidden": "true", className: classNames("hjm-data-table__selector", selectorSticky.className), style: selectorSticky.style }) : null, bands.map((band) => {
                                            const first = columns.findIndex((column) => column.id === band.columnIds[0]);
                                            // A band sticks only when every column under it is pinned; otherwise it scrolls with them.
                                            const sticky = first + band.span <= pinnedCount ? columnSticky(first + band.span - 1) : {};
                                            const stickyStyle = sticky.style ? { insetInlineStart: pinnedOffsets[first + (hasSelector ? 1 : 0)] ?? 0 } : undefined;
                                            return band.header === null
                                                ? _jsx("td", { "aria-hidden": "true", colSpan: band.span, className: sticky.className, style: stickyStyle }, band.id)
                                                : _jsx("th", { scope: "colgroup", colSpan: band.span, className: classNames("hjm-data-table__band", sticky.className), style: stickyStyle, children: _jsx("span", { children: band.header }) }, band.id);
                                        })] })) : null, _jsxs("tr", { ref: headerRowRef, children: [selection && selection.mode !== "none" ? (_jsx("th", { scope: "col", className: classNames("hjm-data-table__selector", selectorSticky.className), style: selectorSticky.style, children: multiple ? (_jsx("button", { type: "button", role: "checkbox", "aria-checked": selectAllState === "mixed" ? "mixed" : String(selectAllState === true), "aria-label": labels.selectAll, className: "hjm-data-table__check", onClick: toggleAll, children: selectAllState === true ? "✓" : selectAllState === "mixed" ? "–" : "" })) : null })) : null, columns.map((column, columnIndex) => {
                                            const sorted = sortState?.columnId === column.id ? sortState.direction : null;
                                            const sticky = columnSticky(columnIndex);
                                            return (_jsx("th", { scope: "col", "aria-sort": sorted ?? undefined, className: sticky.className, style: { inlineSize: column.width, textAlign: column.align ?? dataTableColumnDefaults.align, ...sticky.style }, children: column.sortable ? (
                                                // A button inside the header, never the header itself.
                                                _jsx(TableSortButton, { header: column.header, direction: sorted, glyphs: { ascending: "▲", descending: "▼", none: "↕" }, className: "hjm-data-table__sort", accessibleName: labels.sortColumn(column.header, sortState), 
                                                    // `sortDescFirst` columns (stat tables: highest first) start descending.
                                                    onSort: () => onSortChange?.(getNextDataTableSortState(sortState, column.id, sortCycle, dataTableFirstSortDirection(column))) })) : column.header }, column.id));
                                        })] })] }), sections.map((section) => (_jsxs("tbody", { children: [section.group ? (_jsx("tr", { className: "hjm-data-table__group", children: _jsx("th", { scope: "rowgroup", colSpan: columnSpan, children: _jsx("span", { children: section.group.label }) }) })) : null, section.rows.map((rowId) => rowById.get(rowId)).map((row) => (_jsxs("tr", { "aria-selected": selection && selection.mode !== "none" ? selectedKeys.has(row.id) : undefined, "data-disabled": row.disabled || undefined, children: [selection && selection.mode !== "none" ? (_jsx("td", { className: classNames("hjm-data-table__selector", selectorSticky.className), style: selectorSticky.style, children: _jsx("button", { type: "button", role: multiple ? "checkbox" : "radio", "aria-checked": selectedKeys.has(row.id), "aria-label": labels.selectRow(row.id), "aria-disabled": row.disabled || undefined, className: "hjm-data-table__check", onClick: () => toggleRow(row), children: selectedKeys.has(row.id) ? "✓" : "" }) })) : null, columns.map((column, columnIndex) => {
                                            const sticky = columnSticky(columnIndex);
                                            const emphasis = tableCellEmphasis(cellStyle?.(row.id, column.id), heatColors);
                                            // Sub-rows (TanStack `depth`) indent only the first column, which is the pinned one when pinning.
                                            const depth = columnIndex === 0 ? row.depth ?? 0 : 0;
                                            return (_jsx("td", { "aria-label": getCellText?.(row.id, column.id), className: classNames(sticky.className, emphasis.heat && "hjm-table-family__heat"), "data-tone": emphasis.tone, "data-heat": emphasis.heat, "data-depth": depth > 0 ? depth : undefined, style: {
                                                    textAlign: column.align ?? dataTableColumnDefaults.align,
                                                    ...emphasis.style,
                                                    ...(depth > 0 ? { "--hjm-data-table-indent": `${depth * dataTableFamilyRecipe.depthIndent}px` } : {}),
                                                    ...sticky.style,
                                                }, children: renderCell(row.id, column.id) }, column.id));
                                        })] }, row.id)))] }, section.group?.id ?? "rows"))), summaryRow ? (_jsx("tfoot", { children: _jsxs("tr", { className: "hjm-data-table__summary", children: [hasSelector ? _jsx("td", { className: classNames("hjm-data-table__selector", selectorSticky.className), style: selectorSticky.style }) : null, columns.map((column, columnIndex) => {
                                        const sticky = columnSticky(columnIndex);
                                        return (_jsx("td", { className: sticky.className, style: { textAlign: column.align ?? dataTableColumnDefaults.align, ...sticky.style }, children: summaryRow(column.id) }, column.id));
                                    })] }) })) : null] }) }), footer ? _jsx("div", { className: "hjm-data-table__footer", children: footer }) : null] }));
});
export { LineScore, MatrixTable, ComparisonTable, } from "./table-family.js";
//# sourceMappingURL=data-table.js.map