import { collectionItemContract, focusIndicatorContract } from "./component-contracts.js";
import { control, fontWeight, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const dataTableColumnDefaults = {
    align: "start",
    sortable: false,
};
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`DataTable ${field} must not be empty`);
    }
}
export function validateDataTableColumns(columns) {
    if (columns.length === 0) {
        throw new TypeError("DataTable must declare at least one column");
    }
    const ids = new Set();
    for (const column of columns) {
        assertNonEmpty(column.id, "column id");
        if (ids.has(column.id)) {
            throw new TypeError(`Duplicate DataTable column id: ${column.id}`);
        }
        ids.add(column.id);
        assertNonEmpty(column.header, `column "${column.id}" header`);
        if (column.width !== undefined && (!Number.isFinite(column.width) || column.width <= 0)) {
            throw new RangeError(`DataTable column "${column.id}" width must be a positive finite number`);
        }
    }
}
export function validateDataTableRows(rows) {
    const ids = new Set();
    for (const row of rows) {
        assertNonEmpty(row.id, "row id");
        if (ids.has(row.id)) {
            throw new TypeError(`Duplicate DataTable row id: ${row.id}`);
        }
        ids.add(row.id);
    }
}
/**
 * Header "select all" state as the same tri-state `CheckboxState` the
 * selection column's checkbox already renders (check/dash), instead of a new
 * `"none" | "some" | "all"` enum the recipe would have to translate again.
 * Disabled rows are excluded from both the denominator and the count.
 */
export function resolveDataTableSelectAllState(rows, selectedKeys) {
    const selectable = rows.filter((row) => !row.disabled);
    if (selectable.length === 0)
        return false;
    const selectedCount = selectable.filter((row) => selectedKeys.has(row.id)).length;
    if (selectedCount === 0)
        return false;
    if (selectedCount === selectable.length)
        return true;
    return "mixed";
}
export const dataTableDefaults = {
    sortCycle: "three-state",
};
export function validateDataTableSortState(state, columns) {
    if (state === null)
        return;
    if (state.direction !== "ascending" && state.direction !== "descending") {
        throw new TypeError(`Unsupported DataTable sort direction: ${String(state.direction)}`);
    }
    const column = columns.find((candidate) => candidate.id === state.columnId);
    if (!column) {
        throw new TypeError(`DataTable sort references unknown column id: ${String(state.columnId)}`);
    }
    if (!column.sortable) {
        throw new TypeError(`DataTable column "${String(state.columnId)}" is not sortable`);
    }
}
/**
 * Pure toggle: does not read or write product data. The product still owns
 * actually re-sorting rows (Combobox's local/external filtering split is the
 * same boundary — HJM judges intent, never executes the data operation).
 */
export function getNextDataTableSortState(current, columnId, cycle = dataTableDefaults.sortCycle) {
    if (current === null || current.columnId !== columnId) {
        return { columnId, direction: "ascending" };
    }
    if (current.direction === "ascending") {
        return { columnId, direction: "descending" };
    }
    return cycle === "three-state" ? null : { columnId, direction: "ascending" };
}
/**
 * Reuses `collectionItemContract`'s hover/selected/focus tokens instead of a
 * second set of row-interaction colors — Menu, Select, and DataTable rows
 * stay one visual vocabulary.
 */
export const dataTableRecipe = {
    slots: [
        "root",
        "header",
        "headerCell",
        "sortButton",
        "sortIcon",
        "row",
        "cell",
        "selectionCell",
        "emptyState",
        "errorState",
    ],
    defaults: { density: "regular" },
    density: {
        compact: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
        regular: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    },
    header: {
        background: semanticColors.surface.sunken,
        color: semanticColors.content.secondary,
        textVariant: "label",
        fontWeight: fontWeight.bold,
        borderBottom: semanticColors.border.default,
    },
    row: {
        borderBottom: semanticColors.border.subtle,
        hoverBackground: collectionItemContract.highlightedBackground,
        selectedBackground: collectionItemContract.selectedBackground,
    },
    cell: {
        color: semanticColors.content.body,
        textVariant: "body",
    },
    sortButton: {
        minTarget: control.minTouchTarget,
        color: semanticColors.content.secondary,
        activeColor: semanticColors.content.brand,
    },
    selectionCell: {
        width: control.minTouchTarget,
    },
    emptyState: {
        color: semanticColors.content.secondary,
        textVariant: "body",
    },
    errorState: {
        color: semanticColors.content.danger,
        textVariant: "body",
    },
    states: {
        focus: focusIndicatorContract,
    },
};
/**
 * No roving-tabindex grid keyboard navigation (arrow keys between cells):
 * no product using this contract has measured demand for full ARIA-grid
 * traversal, and it is a materially bigger accessibility surface than a
 * sortable header button plus native checkbox/radio tab stops.
 */
export const dataTableBehavior = {
    controlled: ["selection"],
    inputs: ["columns", "rows", "sortState", "asyncState"],
    events: ["onSortChange"],
    configuration: { sortCycle: ["two-state", "three-state"] },
    defaults: dataTableDefaults,
    stateAxes: {
        value: ["selected"],
        content: ["idle", "loading", "loadingMore", "empty", "error"],
    },
    web: {
        roles: ["table", "row", "columnheader", "cell", "button", "checkbox", "radio"],
        keyboard: ["Tab", "Enter", "Space"],
        focus: "native",
    },
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "row-selection-reuses-the-shared-collection-selection-model-unchanged",
        "select-all-reuses-the-shared-tri-state-checkbox-value",
        "async-state-reuses-the-shared-collection-async-state-unchanged",
        "sortable-header-is-a-button-inside-the-columnheader-not-the-header-itself",
        "sort-direction-values-pass-through-to-aria-sort-without-translation",
        "disabled-rows-are-excluded-from-select-all-accounting",
        "pagination-or-load-more-is-composed-beneath-the-table-not-owned-by-it",
        "row-expansion-is-not-owned-here-compose-the-disclosure-group-contract-per-row",
        "a-data-cell-exposes-at-most-one-focusable-control",
        "no-roving-tabindex-grid-navigation-is-implied",
    ],
};
//# sourceMappingURL=data-table.js.map