import { accentColor, themeColor, type ColorReference } from "./color-references.js";
import type {
  AsyncCollectionState,
  BehaviorContract,
  CheckboxState,
  CollectionKey,
  CollectionSelectionModel,
} from "./behaviors.js";
import { collectionItemContract, focusIndicatorContract } from "./component-contracts.js";
import { control, fontWeight, spacing, type FontWeightValue, type TextVariant } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

export type DataTableAlign = "start" | "center" | "end";

export type DataTableColumnDescriptor<Key extends CollectionKey = CollectionKey> = Readonly<{
  id: Key;
  /** Visible column header text; also the columnheader's accessible name. */
  header: string;
  align?: DataTableAlign;
  sortable?: boolean;
  /** Layout hint only (px or flex-basis); renderers may ignore or clamp it. */
  width?: number;
  /**
   * First press sorts descending (TanStack Table `sortDescFirst`). Stat tables read "highest first";
   * lower-is-better columns (ERA, rank) leave it false. Added 2026-10-14 with the Native renderer.
   */
  sortDescFirst?: boolean;
  /**
   * Keeps the column visible while the others scroll horizontally (AG Grid / TanStack column
   * pinning, start edge only). Only a leading run of pinned columns is honored.
   */
  pinned?: "start";
}>;

export const dataTableColumnDefaults = {
  align: "start",
  sortable: false,
} as const satisfies Readonly<{ align: DataTableAlign; sortable: boolean }>;

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`DataTable ${field} must not be empty`);
  }
}

export function validateDataTableColumns<Key extends CollectionKey>(
  columns: readonly DataTableColumnDescriptor<Key>[],
): void {
  if (columns.length === 0) {
    throw new TypeError("DataTable must declare at least one column");
  }
  const ids = new Set<Key>();
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

/**
 * Row identity and selection deliberately do NOT reuse `CollectionItemDescriptor`
 * verbatim: a table row has no single visible `label`/`textValue` the way a
 * Menu or Select item does — its "content" is however many columns the
 * product renders per row. Only the parts of the Collection base contract
 * that are genuinely row-shaped (`CollectionKey` identity, `disabled`) apply.
 */
export type DataTableRowDescriptor<Key extends CollectionKey = CollectionKey> = Readonly<{
  id: Key;
  disabled?: boolean;
  /** Sub-row nesting (TanStack `depth`): 1 indents a substitute under a starter. 0–3. */
  depth?: number;
}>;

export function validateDataTableRows<Key extends CollectionKey>(
  rows: readonly DataTableRowDescriptor<Key>[],
): void {
  const ids = new Set<Key>();
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

/** Row selection is the unmodified Collection base contract — no DataTable-only selection shape. */
export type DataTableSelection<Key extends CollectionKey = CollectionKey> =
  CollectionSelectionModel<Key>;

/**
 * Header "select all" state as the same tri-state `CheckboxState` the
 * selection column's checkbox already renders (check/dash), instead of a new
 * `"none" | "some" | "all"` enum the recipe would have to translate again.
 * Disabled rows are excluded from both the denominator and the count.
 */
export function resolveDataTableSelectAllState<Key extends CollectionKey>(
  rows: readonly DataTableRowDescriptor<Key>[],
  selectedKeys: ReadonlySet<Key>,
): CheckboxState {
  const selectable = rows.filter((row) => !row.disabled);
  if (selectable.length === 0) return false;
  const selectedCount = selectable.filter((row) => selectedKeys.has(row.id)).length;
  if (selectedCount === 0) return false;
  if (selectedCount === selectable.length) return true;
  return "mixed";
}

/**
 * Values are the literal `aria-sort` vocabulary (minus `"none"`, which is
 * `null`) so the Web renderer passes them through without a translation
 * table — the same "pass the platform value through" choice Slider makes
 * for `valueText`.
 */
export type DataTableSortDirection = "ascending" | "descending";

export type DataTableSortState<Key extends CollectionKey = CollectionKey> = Readonly<{
  columnId: Key;
  direction: DataTableSortDirection;
}> | null;

export type DataTableSortCycle = "two-state" | "three-state";

export const dataTableDefaults = {
  sortCycle: "three-state",
} as const satisfies Readonly<{ sortCycle: DataTableSortCycle }>;

export function validateDataTableSortState<Key extends CollectionKey>(
  state: DataTableSortState<Key>,
  columns: readonly DataTableColumnDescriptor<Key>[],
): void {
  if (state === null) return;
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
export function getNextDataTableSortState<Key extends CollectionKey>(
  current: DataTableSortState<Key>,
  columnId: Key,
  cycle: DataTableSortCycle = dataTableDefaults.sortCycle,
  firstDirection: DataTableSortDirection = "ascending",
): DataTableSortState<Key> {
  const second: DataTableSortDirection = firstDirection === "ascending" ? "descending" : "ascending";
  if (current === null || current.columnId !== columnId) {
    return { columnId, direction: firstDirection };
  }
  if (current.direction === firstDirection) {
    return { columnId, direction: second };
  }
  return cycle === "three-state" ? null : { columnId, direction: firstDirection };
}

/** The first direction a column's header applies, from `sortDescFirst`. */
export function dataTableFirstSortDirection(column: Pick<DataTableColumnDescriptor, "sortDescFirst">): DataTableSortDirection {
  return column.sortDescFirst ? "descending" : "ascending";
}

export type DataTableSortValue = number | string | null | undefined;

/**
 * Sort key for a displayed cell string: "0.340", ".340", "36 ⅓", "13.5억", "61.0%" → numbers;
 * text such as "7승0무3패" or names stay strings; "—", "-" and "" are missing.
 */
export function toDataTableSortValue(value: unknown): DataTableSortValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value).trim();
  if (!text || text === "—" || text === "-" || text === "–") return null;
  // Two or more letters (any script) mean a label, not a number with a unit.
  if (/\p{L}.*\p{L}/u.test(text.replace(/[⅓⅔]/g, ""))) return text;
  const number = Number.parseFloat(text.replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(number) ? number : text;
}

/**
 * Pure comparison: numbers numerically, strings with `localeCompare`, numbers before strings.
 * Missing values are not compared here; `sortDataTableRows` always sinks them.
 */
export function compareDataTableValues(a: Exclude<DataTableSortValue, null | undefined>, b: Exclude<DataTableSortValue, null | undefined>, locale?: string): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "number") return -1;
  if (typeof b === "number") return 1;
  return a.localeCompare(b, locale);
}

/**
 * Optional row-model helper (TanStack `getSortedRowModel` with `sortUndefined: "last"`): stable,
 * missing values always last in both directions. 1.20 left all sorting to products; Yajalal and
 * other stat tables reimplemented the same rules, so the shared helper exists now. Products with
 * server-side sorting keep calling `getNextDataTableSortState` only.
 */
export function sortDataTableRows<Row, Key extends CollectionKey>(
  rows: readonly Row[],
  sort: DataTableSortState<Key>,
  getValue: (row: Row, columnId: Key) => DataTableSortValue,
  options: Readonly<{ locale?: string }> = {},
): Row[] {
  const indexed = rows.map((row, index) => ({ row, index }));
  if (!sort) return indexed.map(item => item.row);
  const sign = sort.direction === "ascending" ? 1 : -1;
  return indexed.sort((x, y) => {
    const a = getValue(x.row, sort.columnId), b = getValue(y.row, sort.columnId);
    const missingA = a === null || a === undefined, missingB = b === null || b === undefined;
    if (missingA || missingB) return missingA === missingB ? x.index - y.index : missingA ? 1 : -1;
    return sign * compareDataTableValues(a, b, options.locale) || x.index - y.index;
  }).map(item => item.row);
}

/** Leading pinned columns (only an unbroken run from the start is pinned). */
export function splitPinnedDataTableColumns<Column extends Pick<DataTableColumnDescriptor, "pinned">>(columns: readonly Column[]): Readonly<{ pinned: readonly Column[]; scrolling: readonly Column[] }> {
  let count = 0;
  while (count < columns.length && columns[count]!.pinned === "start") count++;
  return { pinned: columns.slice(0, count), scrolling: columns.slice(count) };
}

/** The whole table's row-loading status — the unmodified Collection base async contract. */
export type DataTableAsyncState = AsyncCollectionState;

export type DataTableDensity = "compact" | "regular";

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
  ] as const,
  defaults: { density: "regular" },
  density: {
    compact: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
    regular: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  },
  header: {
    background: semanticColors.canvas,
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
} as const satisfies {
  slots: readonly [
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
  ];
  defaults: { density: DataTableDensity };
  density: Record<DataTableDensity, { paddingVertical: number; paddingHorizontal: number }>;
  header: {
    background: ColorReference;
    color: ColorReference;
    textVariant: TextVariant;
    fontWeight: FontWeightValue;
    borderBottom: ColorReference;
  };
  row: {
    borderBottom: ColorReference;
    hoverBackground: ColorReference;
    selectedBackground: ColorReference;
  };
  cell: { color: ColorReference; textVariant: TextVariant };
  sortButton: { minTarget: number; color: ColorReference; activeColor: ColorReference };
  selectionCell: { width: number };
  emptyState: { color: ColorReference; textVariant: TextVariant };
  errorState: { color: ColorReference; textVariant: TextVariant };
  states: { focus: typeof focusIndicatorContract };
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
] as const;

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
} as const satisfies BehaviorContract;

/* ------------------------------------------------------------------------------------------------
 * Table family, 2026-10-14 (user request: research table libraries and absorb several table types).
 * Concepts re-derived, nothing vendored:
 * - column header groups (TanStack Table `getHeaderGroups`, AG Grid column groups),
 * - row groups with a section label and indented sub-rows (AG Grid row grouping, TanStack expanding),
 * - conditional cell tone and percentile heat (AG Grid `cellClassRules`/cellStyle heatmaps,
 *   Baseball Savant percentile color: deeper red toward the best, deeper blue toward the worst),
 * - a vertically bounded body with a fixed header (react-native-sticky-table, CSS sticky headers),
 * - sports layouts that products kept hand-building: line score (period columns + totals, MLB/ESPN),
 *   cross-table matrix (head-to-head records), and two-sided comparison rows (ESPN matchup).
 * ---------------------------------------------------------------------------------------------- */

/** One header band above leaf columns. Columns not listed in any group get an empty placeholder cell. */
export type DataTableColumnGroup<Key extends CollectionKey = CollectionKey> = Readonly<{
  id: string;
  header: string;
  columns: readonly Key[];
}>;

export type DataTableHeaderBand = Readonly<{ id: string; header: string | null; span: number; columnIds: readonly string[] }>;

/**
 * Resolves group bands over the given (already pinned-split) column order. A group must cover a
 * contiguous run; columns outside every group become placeholder bands so leaf widths still line up.
 */
export function resolveDataTableHeaderBands<Key extends CollectionKey>(
  columns: readonly Pick<DataTableColumnDescriptor<Key>, "id">[],
  groups: readonly DataTableColumnGroup<Key>[],
): DataTableHeaderBand[] {
  const owner = new Map<Key, DataTableColumnGroup<Key>>();
  for (const group of groups) {
    assertNonEmpty(group.id, "column group id");
    assertNonEmpty(group.header, `column group "${group.id}" header`);
    for (const id of group.columns) {
      if (owner.has(id)) throw new TypeError(`DataTable column "${String(id)}" belongs to two groups`);
      owner.set(id, group);
    }
  }
  const bands: { id: string; header: string | null; columnIds: string[] }[] = [];
  for (const column of columns) {
    const group = owner.get(column.id) ?? null;
    const last = bands.at(-1);
    if (group && last && last.id === group.id) { last.columnIds.push(column.id); continue; }
    if (group && bands.some((band) => band.id === group.id)) throw new TypeError(`DataTable column group "${group.id}" must be contiguous`);
    bands.push({ id: group ? group.id : `placeholder-${column.id}`, header: group ? group.header : null, columnIds: [column.id] });
  }
  return bands.map((band) => ({ ...band, span: band.columnIds.length }));
}

/** Labeled row section (e.g. 선발 / 교체, 동부 / 서부). Rows not in any group render first, ungrouped. */
export type DataTableRowGroup<Key extends CollectionKey = CollectionKey> = Readonly<{
  id: string;
  label: string;
  rows: readonly Key[];
}>;

export type DataTableBodyItem<Key extends CollectionKey = CollectionKey> =
  | Readonly<{ kind: "group"; id: string; label: string }>
  | Readonly<{ kind: "row"; id: Key }>;

/** Flattens rows + groups into the body order renderers draw. Unknown or duplicated ids throw. */
export function resolveDataTableBody<Key extends CollectionKey>(
  rows: readonly DataTableRowDescriptor<Key>[],
  groups: readonly DataTableRowGroup<Key>[] = [],
): DataTableBodyItem<Key>[] {
  if (groups.length === 0) return rows.map((row) => ({ kind: "row", id: row.id }));
  const known = new Set(rows.map((row) => row.id)), placed = new Set<Key>();
  const grouped: DataTableBodyItem<Key>[] = [];
  for (const group of groups) {
    assertNonEmpty(group.id, "row group id");
    assertNonEmpty(group.label, `row group "${group.id}" label`);
    grouped.push({ kind: "group", id: group.id, label: group.label });
    for (const id of group.rows) {
      if (!known.has(id)) throw new TypeError(`DataTable row group "${group.id}" references unknown row id: ${String(id)}`);
      if (placed.has(id)) throw new TypeError(`DataTable row "${String(id)}" belongs to two row groups`);
      placed.add(id);
      grouped.push({ kind: "row", id });
    }
  }
  const loose: DataTableBodyItem<Key>[] = rows.filter((row) => !placed.has(row.id)).map((row) => ({ kind: "row", id: row.id }));
  return [...loose, ...grouped];
}

/**
 * Semantic cell emphasis, decided by the product per cell (AG Grid cellClassRules):
 * `leader` marks a league/table best, `positive`/`negative` a direction, `muted` a non-qualifying value.
 */
export type DataTableCellTone = "leader" | "positive" | "negative" | "muted";

/** Percentile heat (Savant): `high` side toward the best values, `low` toward the worst; strength 1–3. */
export type DataTableCellHeat = Readonly<{ side: "high" | "low"; strength: 1 | 2 | 3 }>;

/**
 * Percentile rank (0–100, best = 100) of `value` among `sample`. `lowerIsBetter` flips ERA-style stats.
 * Ties take the midpoint rank, missing values return null. A one-value sample is the 50th percentile.
 */
export function percentileRank(value: number | null | undefined, sample: readonly (number | null | undefined)[], options: Readonly<{ lowerIsBetter?: boolean }> = {}): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const values = sample.filter((item): item is number => item !== null && item !== undefined && Number.isFinite(item));
  if (values.length <= 1) return 50;
  let below = 0, equal = 0;
  for (const item of values) {
    const better = options.lowerIsBetter ? item > value : item < value;
    if (item === value) equal++;
    else if (better) below++;
  }
  return Math.round(((below + (equal - 1) / 2) / (values.length - 1)) * 100);
}

/** Maps a percentile to heat: ≥90/≥75/≥60 high, ≤10/≤25/≤40 low, the middle stays neutral (null). */
export function percentileHeat(percentile: number | null): DataTableCellHeat | null {
  if (percentile === null) return null;
  if (percentile >= 90) return { side: "high", strength: 3 };
  if (percentile >= 75) return { side: "high", strength: 2 };
  if (percentile >= 60) return { side: "high", strength: 1 };
  if (percentile <= 10) return { side: "low", strength: 3 };
  if (percentile <= 25) return { side: "low", strength: 2 };
  if (percentile <= 40) return { side: "low", strength: 1 };
  return null;
}

export const dataTableFamilyRecipe = {
  /** Heat background alpha per strength, over the high/low base colors. */
  heatAlpha: { 1: 0.14, 2: 0.26, 3: 0.42 },
  heat: { high: themeColor("danger"), low: accentColor("info") },
  tone: {
    leader: { color: semanticColors.content.primary, fontWeight: fontWeight.bold },
    positive: { color: themeColor("danger"), fontWeight: fontWeight.bold },
    negative: { color: accentColor("info"), fontWeight: fontWeight.bold },
    muted: { color: semanticColors.content.tertiary, fontWeight: fontWeight.regular },
  },
  groupRow: { background: semanticColors.surface.sunken, color: semanticColors.content.secondary, textVariant: "label" as TextVariant },
  /** Indent per sub-row depth level (substitutes under a starter, players under a team). */
  depthIndent: spacing.md,
  headerBand: { color: semanticColors.content.secondary, borderBottom: semanticColors.border.subtle },
  /**
   * Live period (LineScore) and "my team" row (MatrixTable). These tables sit on the surface tone, where DataTable's
   * canvas-colored selected row read as a white gap that split the table (2026-10-17 review E17).
   */
  highlight: { background: semanticColors.surface.brand },
} as const;

/* ---------------------------------------------- Line score ------------------------------------- */

export type LineScoreTeam = Readonly<{
  id: string;
  name: string;
  /** Runs per period; null = not played yet, "X" = home team did not bat in the last inning. */
  periods: readonly (number | "X" | null)[];
  /** Totals in display order, e.g. { R: 5, H: 9, E: 0, B: 4 }. */
  totals: Readonly<Record<string, number | null>>;
}>;

export type LineScoreColumn = Readonly<{ id: string; header: string; kind: "period" | "total" }>;

/**
 * Period columns are padded to `minPeriods` (9 innings) and extend for extra innings; totals follow.
 * The current period (live game) is reported so renderers can highlight it.
 */
export function resolveLineScore(teams: readonly LineScoreTeam[], options: Readonly<{ minPeriods?: number; totals: readonly string[]; currentPeriod?: number | null }>): Readonly<{ columns: LineScoreColumn[]; currentPeriod: number | null; leaderId: string | null }> {
  if (teams.length < 2) throw new TypeError("LineScore needs at least two teams");
  const ids = new Set<string>();
  for (const team of teams) {
    assertNonEmpty(team.id, "line score team id");
    if (ids.has(team.id)) throw new TypeError(`Duplicate LineScore team id: ${team.id}`);
    ids.add(team.id);
  }
  const played = Math.max(...teams.map((team) => team.periods.length));
  const count = Math.max(options.minPeriods ?? 9, played);
  const columns: LineScoreColumn[] = Array.from({ length: count }, (_, i) => ({ id: `p${i + 1}`, header: String(i + 1), kind: "period" }));
  for (const total of options.totals) columns.push({ id: `t-${total}`, header: total, kind: "total" });
  const runs = options.totals[0];
  let leaderId: string | null = null;
  if (runs) {
    const scores = teams.map((team) => ({ id: team.id, value: team.totals[runs] ?? null }));
    const best = Math.max(...scores.map((score) => score.value ?? -Infinity));
    const leaders = scores.filter((score) => score.value === best && Number.isFinite(best));
    leaderId = leaders.length === 1 ? leaders[0]!.id : null;
  }
  const current = options.currentPeriod ?? null;
  return { columns, currentPeriod: current !== null && current >= 1 && current <= count ? current : null, leaderId };
}

export function formatLineScoreCell(value: number | "X" | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

/* ---------------------------------------------- Matrix table ----------------------------------- */

export type MatrixCell = Readonly<{ label: string; tone?: DataTableCellTone | null; heat?: DataTableCellHeat | null }>;

/**
 * Square cross table (team × team head-to-head). Rows and columns share one id list; the diagonal is
 * a self cell and renders blank. `getCell(row, column)` returns null for no record.
 */
export function resolveMatrix<Key extends string>(ids: readonly Key[], getCell: (row: Key, column: Key) => MatrixCell | null): readonly (readonly (MatrixCell | "self" | null)[])[] {
  if (new Set(ids).size !== ids.length) throw new TypeError("Matrix ids must be unique");
  return ids.map((row) => ids.map((column) => (row === column ? "self" : getCell(row, column))));
}

/* ---------------------------------------------- Comparison table ------------------------------- */

export type ComparisonRow = Readonly<{
  id: string;
  label: string;
  values: readonly [number | null, number | null];
  /** Display strings; defaults to String(value). */
  display?: readonly [string, string];
  lowerIsBetter?: boolean;
}>;

/** Which side wins a row (null on ties/missing), and each side's bar share of the pair (0–1). */
export function resolveComparisonRow(row: ComparisonRow): Readonly<{ winner: 0 | 1 | null; shares: readonly [number, number] }> {
  const [a, b] = row.values;
  if (a === null || b === null || !Number.isFinite(a) || !Number.isFinite(b)) return { winner: null, shares: [a === null ? 0 : 0.5, b === null ? 0 : 0.5] };
  const winner = a === b ? null : (row.lowerIsBetter ? a < b : a > b) ? 0 : 1;
  // Lower-is-better rows invert the magnitudes so the better side still draws the longer bar.
  const left = Math.abs(row.lowerIsBetter ? b : a), right = Math.abs(row.lowerIsBetter ? a : b), sum = left + right;
  return { winner, shares: sum === 0 ? [0.5, 0.5] : [left / sum, right / sum] };
}

