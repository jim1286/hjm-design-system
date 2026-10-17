import { accentColor, themeColor } from "./color-references.js";
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
        if (row.depth !== undefined && (!Number.isInteger(row.depth) || row.depth < 0 || row.depth > 3)) {
            throw new RangeError(`DataTable row "${String(row.id)}" depth must be an integer from 0 to 3`);
        }
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
export function getNextDataTableSortState(current, columnId, cycle = dataTableDefaults.sortCycle, firstDirection = "ascending") {
    const second = firstDirection === "ascending" ? "descending" : "ascending";
    if (current === null || current.columnId !== columnId) {
        return { columnId, direction: firstDirection };
    }
    if (current.direction === firstDirection) {
        return { columnId, direction: second };
    }
    return cycle === "three-state" ? null : { columnId, direction: firstDirection };
}
/** The first direction a column's header applies, from `sortDescFirst`. */
export function dataTableFirstSortDirection(column) {
    return column.sortDescFirst ? "descending" : "ascending";
}
/**
 * Sort key for a displayed cell string: "0.340", ".340", "36 ⅓", "13.5억", "61.0%" → numbers;
 * text such as "7승0무3패" or names stay strings; "—", "-" and "" are missing.
 */
export function toDataTableSortValue(value) {
    if (value === null || value === undefined)
        return null;
    if (typeof value === "number")
        return Number.isFinite(value) ? value : null;
    const text = String(value).trim();
    if (!text || text === "—" || text === "-" || text === "–")
        return null;
    // Two or more letters (any script) mean a label, not a number with a unit.
    if (/\p{L}.*\p{L}/u.test(text.replace(/[⅓⅔]/g, "")))
        return text;
    const number = Number.parseFloat(text.replace(/[^0-9.+-]/g, ""));
    return Number.isFinite(number) ? number : text;
}
/**
 * Pure comparison: numbers numerically, strings with `localeCompare`, numbers before strings.
 * Missing values are not compared here; `sortDataTableRows` always sinks them.
 */
export function compareDataTableValues(a, b, locale) {
    if (typeof a === "number" && typeof b === "number")
        return a - b;
    if (typeof a === "number")
        return -1;
    if (typeof b === "number")
        return 1;
    return a.localeCompare(b, locale);
}
/**
 * Optional row-model helper (TanStack `getSortedRowModel` with `sortUndefined: "last"`): stable,
 * missing values always last in both directions. 1.20 left all sorting to products; Yajalal and
 * other stat tables reimplemented the same rules, so the shared helper exists now. Products with
 * server-side sorting keep calling `getNextDataTableSortState` only.
 */
export function sortDataTableRows(rows, sort, getValue, options = {}) {
    const indexed = rows.map((row, index) => ({ row, index }));
    if (!sort)
        return indexed.map(item => item.row);
    const sign = sort.direction === "ascending" ? 1 : -1;
    return indexed.sort((x, y) => {
        const a = getValue(x.row, sort.columnId), b = getValue(y.row, sort.columnId);
        const missingA = a === null || a === undefined, missingB = b === null || b === undefined;
        if (missingA || missingB)
            return missingA === missingB ? x.index - y.index : missingA ? 1 : -1;
        return sign * compareDataTableValues(a, b, options.locale) || x.index - y.index;
    }).map(item => item.row);
}
/** Leading pinned columns (only an unbroken run from the start is pinned). */
export function splitPinnedDataTableColumns(columns) {
    let count = 0;
    while (count < columns.length && columns[count].pinned === "start")
        count++;
    return { pinned: columns.slice(0, count), scrolling: columns.slice(count) };
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
        background: semanticColors.canvas,
        color: semanticColors.content.secondary,
        textVariant: "label",
        fontWeight: fontWeight.medium,
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
export const dataTableFamilyScenarios = [
    "header-groups-span-contiguous-leaf-columns-and-pad-ungrouped-columns",
    "row-groups-insert-a-section-label-before-their-rows",
    "cell-tone-and-heat-are-product-decided-semantic-emphasis",
    "percentile-rank-flips-for-lower-is-better-stats-and-ties-take-the-midpoint",
    "bounded-height-tables-keep-the-header-fixed-while-the-body-scrolls",
    "line-score-pads-to-nine-periods-and-extends-for-extra-periods",
    "matrix-diagonal-is-a-blank-self-cell",
    "comparison-bars-favor-the-better-side-even-when-lower-is-better",
];
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
    native: { roles: ["button", "header"], states: ["selected"], actions: ["activate"] },
    scenarios: [
        "sort-desc-first-columns-start-descending-and-cycle-back",
        "missing-values-sink-to-the-bottom-in-both-directions",
        "pinned-start-columns-stay-visible-while-the-rest-scrolls",
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
        ...dataTableFamilyScenarios,
    ],
};
/**
 * Resolves group bands over the given (already pinned-split) column order. A group must cover a
 * contiguous run; columns outside every group become placeholder bands so leaf widths still line up.
 */
export function resolveDataTableHeaderBands(columns, groups) {
    const owner = new Map();
    for (const group of groups) {
        assertNonEmpty(group.id, "column group id");
        assertNonEmpty(group.header, `column group "${group.id}" header`);
        for (const id of group.columns) {
            if (owner.has(id))
                throw new TypeError(`DataTable column "${String(id)}" belongs to two groups`);
            owner.set(id, group);
        }
    }
    const bands = [];
    for (const column of columns) {
        const group = owner.get(column.id) ?? null;
        const last = bands.at(-1);
        if (group && last && last.id === group.id) {
            last.columnIds.push(column.id);
            continue;
        }
        if (group && bands.some((band) => band.id === group.id))
            throw new TypeError(`DataTable column group "${group.id}" must be contiguous`);
        bands.push({ id: group ? group.id : `placeholder-${column.id}`, header: group ? group.header : null, columnIds: [column.id] });
    }
    return bands.map((band) => ({ ...band, span: band.columnIds.length }));
}
/** Flattens rows + groups into the body order renderers draw. Unknown or duplicated ids throw. */
export function resolveDataTableBody(rows, groups = []) {
    if (groups.length === 0)
        return rows.map((row) => ({ kind: "row", id: row.id }));
    const known = new Set(rows.map((row) => row.id)), placed = new Set();
    const grouped = [];
    for (const group of groups) {
        assertNonEmpty(group.id, "row group id");
        assertNonEmpty(group.label, `row group "${group.id}" label`);
        grouped.push({ kind: "group", id: group.id, label: group.label });
        for (const id of group.rows) {
            if (!known.has(id))
                throw new TypeError(`DataTable row group "${group.id}" references unknown row id: ${String(id)}`);
            if (placed.has(id))
                throw new TypeError(`DataTable row "${String(id)}" belongs to two row groups`);
            placed.add(id);
            grouped.push({ kind: "row", id });
        }
    }
    const loose = rows.filter((row) => !placed.has(row.id)).map((row) => ({ kind: "row", id: row.id }));
    return [...loose, ...grouped];
}
/**
 * Percentile rank (0–100, best = 100) of `value` among `sample`. `lowerIsBetter` flips ERA-style stats.
 * Ties take the midpoint rank, missing values return null. A one-value sample is the 50th percentile.
 */
export function percentileRank(value, sample, options = {}) {
    if (value === null || value === undefined || !Number.isFinite(value))
        return null;
    const values = sample.filter((item) => item !== null && item !== undefined && Number.isFinite(item));
    if (values.length <= 1)
        return 50;
    let below = 0, equal = 0;
    for (const item of values) {
        const better = options.lowerIsBetter ? item > value : item < value;
        if (item === value)
            equal++;
        else if (better)
            below++;
    }
    return Math.round(((below + (equal - 1) / 2) / (values.length - 1)) * 100);
}
/** Maps a percentile to heat: ≥90/≥75/≥60 high, ≤10/≤25/≤40 low, the middle stays neutral (null). */
export function percentileHeat(percentile) {
    if (percentile === null)
        return null;
    if (percentile >= 90)
        return { side: "high", strength: 3 };
    if (percentile >= 75)
        return { side: "high", strength: 2 };
    if (percentile >= 60)
        return { side: "high", strength: 1 };
    if (percentile <= 10)
        return { side: "low", strength: 3 };
    if (percentile <= 25)
        return { side: "low", strength: 2 };
    if (percentile <= 40)
        return { side: "low", strength: 1 };
    return null;
}
export const dataTableFamilyRecipe = {
    /** Heat background alpha per strength, over the high/low base colors. */
    heatAlpha: { 1: 0.14, 2: 0.26, 3: 0.42 },
    heat: { high: themeColor("danger"), low: accentColor("info") },
    tone: {
        leader: { color: semanticColors.content.primary, fontWeight: fontWeight.medium },
        positive: { color: themeColor("danger"), fontWeight: fontWeight.medium },
        negative: { color: accentColor("info"), fontWeight: fontWeight.medium },
        muted: { color: semanticColors.content.tertiary, fontWeight: fontWeight.regular },
    },
    groupRow: { background: semanticColors.surface.sunken, color: semanticColors.content.secondary, textVariant: "label" },
    /** Indent per sub-row depth level (substitutes under a starter, players under a team). */
    depthIndent: spacing.md,
    headerBand: { color: semanticColors.content.secondary, borderBottom: semanticColors.border.subtle },
    /**
     * Live period (LineScore) and "my team" row (MatrixTable). These tables sit on the surface tone, where DataTable's
     * canvas-colored selected row read as a white gap that split the table (2026-10-17 review E17).
     */
    highlight: { background: semanticColors.surface.brand },
};
/**
 * Period columns are padded to `minPeriods` (9 innings) and extend for extra innings; totals follow.
 * The current period (live game) is reported so renderers can highlight it.
 */
export function resolveLineScore(teams, options) {
    if (teams.length < 2)
        throw new TypeError("LineScore needs at least two teams");
    const ids = new Set();
    for (const team of teams) {
        assertNonEmpty(team.id, "line score team id");
        if (ids.has(team.id))
            throw new TypeError(`Duplicate LineScore team id: ${team.id}`);
        ids.add(team.id);
    }
    const played = Math.max(...teams.map((team) => team.periods.length));
    const count = Math.max(options.minPeriods ?? 9, played);
    const columns = Array.from({ length: count }, (_, i) => ({ id: `p${i + 1}`, header: String(i + 1), kind: "period" }));
    for (const total of options.totals)
        columns.push({ id: `t-${total}`, header: total, kind: "total" });
    const runs = options.totals[0];
    let leaderId = null;
    if (runs) {
        const scores = teams.map((team) => ({ id: team.id, value: team.totals[runs] ?? null }));
        const best = Math.max(...scores.map((score) => score.value ?? -Infinity));
        const leaders = scores.filter((score) => score.value === best && Number.isFinite(best));
        leaderId = leaders.length === 1 ? leaders[0].id : null;
    }
    const current = options.currentPeriod ?? null;
    return { columns, currentPeriod: current !== null && current >= 1 && current <= count ? current : null, leaderId };
}
export function formatLineScoreCell(value) {
    return value === null || value === undefined ? "" : String(value);
}
/**
 * Square cross table (team × team head-to-head). Rows and columns share one id list; the diagonal is
 * a self cell and renders blank. `getCell(row, column)` returns null for no record.
 */
export function resolveMatrix(ids, getCell) {
    if (new Set(ids).size !== ids.length)
        throw new TypeError("Matrix ids must be unique");
    return ids.map((row) => ids.map((column) => (row === column ? "self" : getCell(row, column))));
}
/** Which side wins a row (null on ties/missing), and each side's bar share of the pair (0–1). */
export function resolveComparisonRow(row) {
    const [a, b] = row.values;
    if (a === null || b === null || !Number.isFinite(a) || !Number.isFinite(b))
        return { winner: null, shares: [a === null ? 0 : 0.5, b === null ? 0 : 0.5] };
    const winner = a === b ? null : (row.lowerIsBetter ? a < b : a > b) ? 0 : 1;
    // Lower-is-better rows invert the magnitudes so the better side still draws the longer bar.
    const left = Math.abs(row.lowerIsBetter ? b : a), right = Math.abs(row.lowerIsBetter ? a : b), sum = left + right;
    return { winner, shares: sum === 0 ? [0.5, 0.5] : [left / sum, right / sum] };
}
//# sourceMappingURL=data-table.js.map