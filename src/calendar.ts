import type { ColorReference } from "./color-references.js";
import type { BehaviorContract, WebKeyboardKey } from "./behaviors.js";
import type { SemanticIconName } from "./icon.js";
import { control, glyph, opacity, spacing, stroke, type GlyphSize, type TextVariant } from "./foundations.js";
import { focusIndicatorContract } from "./component-contracts.js";
import { semanticColors } from "./semantic-colors.js";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const GRID_COLUMNS = 7;

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Calendar ${field} must not be empty`);
  }
}

/**
 * The grid never parses or computes dates — month/leap-year/timezone
 * arithmetic stays product-owned (see docs/calendar.md). This only checks the
 * "YYYY-MM-DD" shape products already use as their KBO schedule date key.
 */
export function isIsoCalendarDate(value: string): boolean {
  return typeof value === "string" && ISO_DATE_PATTERN.test(value);
}

export function assertIsoCalendarDate(value: string, field: string): void {
  if (!isIsoCalendarDate(value)) {
    throw new TypeError(`Calendar ${field} must be an ISO "YYYY-MM-DD" date string`);
  }
}

export function isIsoCalendarMonth(value: string): boolean {
  return typeof value === "string" && ISO_MONTH_PATTERN.test(value);
}

export function assertIsoCalendarMonth(value: string, field: string): void {
  if (!isIsoCalendarMonth(value)) {
    throw new TypeError(`Calendar ${field} must be an ISO "YYYY-MM" month string`);
  }
}

/**
 * One visible cell. A cell with no `date` is a pure filler that keeps the
 * seven-column alignment (a leading/trailing blank before day 1 or after the
 * month's last day) — it is never focusable, selectable, or announced.
 * `content` is an opaque product payload (Yajalal's per-day game count, a
 * dot, anything) the renderer's cell-content slot receives untouched; the
 * grid never inspects it.
 */
export type CalendarDateCellDescriptor<Content = unknown> = Readonly<{
  date?: string;
  /** The date exists but falls outside the month currently in focus (a leading/trailing day from an adjacent month). Still selectable unless `disabled`. */
  outsideFocusedMonth?: boolean;
  disabled?: boolean;
  content?: Content;
}>;

export type CalendarWeekdayLabels = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

/**
 * Raw product data for one visible month page. HJM does not compute which
 * dates belong to a month or the leading/trailing blanks — the product
 * already owns that arithmetic (see `buildCalendarCells` in Yajalal's
 * schedule explorer). HJM only validates the row-major seven-column shape
 * and resolves per-cell semantic state on top of it.
 */
export type CalendarGridDescriptor<Content = unknown> = Readonly<{
  /** Row-major, seven columns per row (one per weekday), so length must be a positive multiple of seven. */
  cells: readonly CalendarDateCellDescriptor<Content>[];
  /** Localized short weekday labels in the same column order as `cells`, e.g. ["일","월","화","수","목","금","토"]. */
  weekdayLabels: CalendarWeekdayLabels;
  /** ISO date of "today" per the product's clock. The grid never calls `Date.now()` itself. */
  todayDate: string;
}>;

export function validateCalendarGridDescriptor<Content>(
  grid: CalendarGridDescriptor<Content>,
): void {
  if (grid.cells.length === 0 || grid.cells.length % GRID_COLUMNS !== 0) {
    throw new RangeError("Calendar grid cells must be a non-empty multiple of seven");
  }
  if (grid.weekdayLabels.length !== GRID_COLUMNS) {
    throw new RangeError("Calendar weekdayLabels must have exactly seven entries");
  }
  grid.weekdayLabels.forEach((label, index) => assertNonEmpty(label, `weekdayLabels[${index}]`));
  assertIsoCalendarDate(grid.todayDate, "todayDate");
  const seen = new Set<string>();
  for (const cell of grid.cells) {
    if (cell.date === undefined) continue;
    assertIsoCalendarDate(cell.date, "cell date");
    if (seen.has(cell.date)) {
      throw new TypeError(`Duplicate Calendar cell date: ${cell.date}`);
    }
    seen.add(cell.date);
  }
}

/**
 * A cursor's committed value and the one displayed month page are
 * independent controlled axes, mirroring `SelectSelection`/`SelectOpenState`
 * in spirit: paging the visible month never clears or moves the selection.
 */
export type CalendarMonthChangeReason = "previous" | "next" | "jump";

export type CalendarMonthNavigation =
  | Readonly<{
      focusedMonth: string;
      defaultFocusedMonth?: never;
      onFocusedMonthChange(month: string, reason: CalendarMonthChangeReason): void;
    }>
  | Readonly<{
      focusedMonth?: never;
      defaultFocusedMonth?: string;
      onFocusedMonthChange?: (month: string, reason: CalendarMonthChangeReason) => void;
    }>;

export function validateCalendarMonthNavigation(navigation: CalendarMonthNavigation): void {
  const month = navigation.focusedMonth ?? navigation.defaultFocusedMonth;
  if (month !== undefined) assertIsoCalendarMonth(month, "focusedMonth");
}

/**
 * Single committed date only. Range selection is deliberately excluded — no
 * Yajalal or BurnTok flow has measured demand for it (see docs/calendar.md).
 */
export type CalendarSelection =
  | Readonly<{
      selectedDate: string | null;
      defaultSelectedDate?: never;
      onSelectionChange(date: string | null): void;
    }>
  | Readonly<{
      selectedDate?: never;
      defaultSelectedDate?: string | null;
      onSelectionChange?: (date: string | null) => void;
    }>;

export function validateCalendarSelection(selection: CalendarSelection): void {
  const selected = selection.selectedDate ?? selection.defaultSelectedDate;
  if (selected != null) assertIsoCalendarDate(selected, "selectedDate");
}

export type CalendarDescriptor<Content = unknown> = Readonly<{
  grid: CalendarGridDescriptor<Content>;
  /** Product-formatted heading copy ("2026년 8월"); the grid never formats a date itself. */
  monthLabel: string;
}> &
  CalendarMonthNavigation &
  CalendarSelection;

export function validateCalendarDescriptor<Content>(
  descriptor: CalendarDescriptor<Content>,
): void {
  validateCalendarGridDescriptor(descriptor.grid);
  assertNonEmpty(descriptor.monthLabel, "monthLabel");
  validateCalendarMonthNavigation(descriptor);
  validateCalendarSelection(descriptor);
}

export type CalendarAccessibleNameInfo<Content = unknown> = Readonly<{
  date: string;
  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
  content?: Content;
}>;

/**
 * "8월 19일 수요일, 경기 2개, 선택됨" is assembled by the product from its own
 * `content` payload and locale/grammar — the same reason Steps takes
 * `composeAccessibleName` instead of assembling copy itself.
 */
export type ComposeCalendarAccessibleName<Content = unknown> = (
  info: CalendarAccessibleNameInfo<Content>,
) => string;

export type ResolvedCalendarDateCell<Content = unknown> = CalendarDateCellDescriptor<Content> &
  Readonly<{
    date: string;
    /** 1-indexed. */
    row: number;
    /** 1-indexed, 1..7. */
    column: number;
    isToday: boolean;
    isSelected: boolean;
    /** `false` when disabled — the cell stays focusable (see `getCalendarNavigationTarget`) but must never commit or close on activate. */
    selectable: boolean;
    accessibleName: string;
  }>;

export type ResolvedCalendarFillerCell = Readonly<{
  date?: never;
  row: number;
  column: number;
  filler: true;
}>;

export type ResolvedCalendarGridCell<Content = unknown> =
  | ResolvedCalendarDateCell<Content>
  | ResolvedCalendarFillerCell;

/**
 * Resolves per-cell semantic state against a selection supplied separately
 * from the raw grid (mirroring `resolveSelectSelectedItem`'s separation of
 * source data from selection state) — the same grid page renders identically
 * whether it is hosted by Calendar or by DatePicker's popover/sheet.
 */
export function resolveCalendarGridDescriptor<Content>(
  grid: CalendarGridDescriptor<Content>,
  selectedDate: string | null,
  options: Readonly<{ composeAccessibleName: ComposeCalendarAccessibleName<Content> }>,
): readonly ResolvedCalendarGridCell<Content>[] {
  validateCalendarGridDescriptor(grid);
  if (typeof options.composeAccessibleName !== "function") {
    throw new TypeError("Calendar composeAccessibleName must be a function");
  }

  return grid.cells.map((cell, index) => {
    const row = Math.floor(index / GRID_COLUMNS) + 1;
    const column = (index % GRID_COLUMNS) + 1;
    if (cell.date === undefined) {
      return { row, column, filler: true as const };
    }
    const isToday = cell.date === grid.todayDate;
    const isSelected = cell.date === selectedDate;
    const disabled = cell.disabled ?? false;
    const nameInfo: CalendarAccessibleNameInfo<Content> =
      cell.content === undefined
        ? { date: cell.date, isToday, isSelected, disabled }
        : { date: cell.date, isToday, isSelected, disabled, content: cell.content };
    const accessibleName = options.composeAccessibleName(nameInfo);
    if (typeof accessibleName !== "string" || accessibleName.trim().length === 0) {
      throw new TypeError("Calendar composeAccessibleName must return a non-empty string");
    }
    return {
      ...cell,
      date: cell.date,
      row,
      column,
      isToday,
      isSelected,
      selectable: !disabled,
      accessibleName,
    };
  });
}

/** Top-level entry point: validates the descriptor and resolves its grid page. */
export function resolveCalendarDescriptor<Content>(
  descriptor: CalendarDescriptor<Content>,
  options: Readonly<{ composeAccessibleName: ComposeCalendarAccessibleName<Content> }>,
): readonly ResolvedCalendarGridCell<Content>[] {
  validateCalendarDescriptor(descriptor);
  const selectedDate = descriptor.selectedDate ?? descriptor.defaultSelectedDate ?? null;
  return resolveCalendarGridDescriptor(descriptor.grid, selectedDate, options);
}

export type CalendarNavigationIntent =
  | "next-day"
  | "previous-day"
  | "next-week"
  | "previous-week"
  | "first-of-week"
  | "last-of-week";

/**
 * ArrowLeft/Right flip under RTL, matching `getSelectionNavigationIntent`'s
 * `direction` parameter.
 */
export function getCalendarNavigationIntent(
  key: WebKeyboardKey,
  direction: "ltr" | "rtl" = "ltr",
): CalendarNavigationIntent | undefined {
  if (key === "Home") return "first-of-week";
  if (key === "End") return "last-of-week";
  if (key === "ArrowDown") return "next-week";
  if (key === "ArrowUp") return "previous-week";
  if (key === "ArrowRight") return direction === "rtl" ? "previous-day" : "next-day";
  if (key === "ArrowLeft") return direction === "rtl" ? "next-day" : "previous-day";
  return undefined;
}

export type CalendarNavigationResult =
  | Readonly<{ date: string; overflow?: never }>
  | Readonly<{ date?: never; overflow: "before" | "after" }>;

/**
 * Pure index arithmetic over the fixed seven-column page. Unlike
 * `getCollectionNavigationTarget`, this does NOT skip disabled dates —
 * per the WAI-ARIA date picker dialog pattern, arrow-key focus must land
 * predictably (down always moves exactly one row) even on a disabled date;
 * only the *activate* action is expected to no-op there. Moving past the
 * edge of this page returns an `overflow` signal instead of wrapping, since
 * HJM does not know the adjacent month's shape — the product pages the
 * month and refocuses the corresponding day.
 */
export function getCalendarNavigationTarget<Content>(
  grid: CalendarGridDescriptor<Content>,
  currentDate: string,
  intent: CalendarNavigationIntent,
): CalendarNavigationResult {
  validateCalendarGridDescriptor(grid);
  const currentIndex = grid.cells.findIndex((cell) => cell.date === currentDate);
  if (currentIndex < 0) {
    throw new RangeError(`Calendar currentDate is not part of this grid page: ${currentDate}`);
  }

  const findDated = (from: number, step: number): number | undefined => {
    for (let index = from; index >= 0 && index < grid.cells.length; index += step) {
      if (grid.cells[index]?.date !== undefined) return index;
    }
    return undefined;
  };

  const rowStart = Math.floor(currentIndex / GRID_COLUMNS) * GRID_COLUMNS;
  const rowEnd = rowStart + GRID_COLUMNS - 1;

  if (intent === "first-of-week") {
    const found = findDated(rowStart, 1);
    return found !== undefined && found <= rowEnd
      ? { date: grid.cells[found]!.date! }
      : { overflow: "before" };
  }
  if (intent === "last-of-week") {
    const found = findDated(rowEnd, -1);
    return found !== undefined && found >= rowStart
      ? { date: grid.cells[found]!.date! }
      : { overflow: "after" };
  }

  const forward = intent === "next-day" || intent === "next-week";
  const stride = intent === "next-week" || intent === "previous-week" ? GRID_COLUMNS : 1;
  const step = forward ? 1 : -1;
  const target = currentIndex + step * stride;
  if (target < 0) return { overflow: "before" };
  if (target >= grid.cells.length) return { overflow: "after" };
  if (grid.cells[target]?.date !== undefined) return { date: grid.cells[target]!.date! };
  // Landed on a filler (only reachable for a week-step into a partially
  // filled edge row): keep scanning the same direction for the nearest real
  // date rather than asking a renderer to interpret a blank cell.
  const resolved = findDated(target, step);
  return resolved !== undefined
    ? { date: grid.cells[resolved]!.date! }
    : { overflow: forward ? "after" : "before" };
}

export type CalendarSize = "medium" | "large";

/**
 * `today` and `selected` are visually independent (a non-selected today and
 * a selected past day must both read clearly) and neither is color-only:
 * today gets a persistent border, selected gets a filled background, and
 * both remain in `accessibleName`/`isToday`/`isSelected` for assistive tech.
 */
export const calendarRecipe = {
  slots: [
    "root",
    "header",
    "monthLabel",
    "previousMonth",
    "nextMonth",
    "weekdayRow",
    "weekdayLabel",
    "grid",
    "week",
    "day",
    "dayLabel",
    "content",
  ] as const,
  defaults: { size: "medium" },
  header: {
    gap: spacing.xs,
    monthLabel: {
      textVariant: "title",
      fontWeight: "700",
      color: semanticColors.content.primary,
    },
    navButton: { diameter: control.buttonHeight.medium, color: semanticColors.content.secondary },
    navIcon: { previous: "chevronStart", next: "chevronEnd" },
  },
  weekdayLabel: {
    textVariant: "label",
    color: semanticColors.content.secondary,
  },
  sizes: {
    medium: { cellDiameter: control.minTouchTarget, textVariant: "body", glyph: "sm" },
    large: { cellDiameter: glyph.xxl, textVariant: "bodyLarge", glyph: "md" },
  },
  day: {
    radius: "full" as const,
    label: { color: semanticColors.content.body, numericVariant: "tabular" },
    outsideFocusedMonthOpacity: opacity.muted,
    disabledOpacity: opacity.disabled,
    today: { border: semanticColors.border.focus, borderWidth: stroke.default },
    selected: {
      background: semanticColors.action.brand.background,
      content: semanticColors.action.brand.content,
    },
    focus: focusIndicatorContract,
  },
} as const satisfies {
  slots: readonly string[];
  defaults: { size: CalendarSize };
  header: {
    gap: number;
    monthLabel: { textVariant: TextVariant; fontWeight: string; color: ColorReference };
    navButton: { diameter: number; color: ColorReference };
    navIcon: { previous: SemanticIconName; next: SemanticIconName };
  };
  weekdayLabel: { textVariant: TextVariant; color: ColorReference };
  sizes: Record<CalendarSize, { cellDiameter: number; textVariant: TextVariant; glyph: GlyphSize }>;
  day: {
    radius: "full";
    label: { color: ColorReference; numericVariant: "tabular" };
    outsideFocusedMonthOpacity: number;
    disabledOpacity: number;
    today: { border: ColorReference; borderWidth: number };
    selected: { background: ColorReference; content: ColorReference };
    focus: typeof focusIndicatorContract;
  };
};

/**
 * Calendar is `shared`, not `adaptive`: the grid is always visible inline
 * (no popup/Sheet choice to make). Web gets `grid` role + roving-tabindex
 * arrow keys; Native has no composite-widget equivalent, so each date is
 * simply an independently focusable/tappable element and month paging goes
 * through the always-present previous/next buttons on both platforms — same
 * result (the user reaches and picks a date), different path, matching the
 * `beta → stable(adaptive)` gate's standard even though this component
 * itself is not adaptive.
 */
export const calendarBehavior = {
  controlled: [
    "selectedDate",
    "defaultSelectedDate",
    "onSelectionChange",
    "focusedMonth",
    "defaultFocusedMonth",
    "onFocusedMonthChange",
  ],
  inputs: ["grid", "monthLabel"],
  stateAxes: {
    availability: ["enabled", "disabled"],
    value: ["selected"],
  },
  web: {
    roles: ["grid", "row", "gridcell", "button"],
    keyboard: [
      "Tab",
      "Enter",
      "Space",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ],
    focus: "roving",
  },
  native: {
    roles: ["button"],
    states: ["disabled", "selected"],
    actions: ["activate"],
  },
  scenarios: [
    "today-and-selected-are-independent-and-both-non-color-marked",
    "disabled-dates-remain-focusable-but-never-activate",
    "arrow-keys-move-by-day-and-week-inside-the-visible-month-page",
    "home-and-end-move-to-the-first-and-last-dated-cell-of-the-focused-row",
    "moving-past-the-visible-grid-edge-requests-a-month-change-instead-of-wrapping",
    "filler-cells-carry-no-accessible-name-and-are-hidden-from-assistive-tech",
    "every-dated-cell-accessible-name-is-composed-by-the-product",
    "changing-the-focused-month-never-changes-or-clears-the-selection",
    "range-selection-is-not-part-of-the-contract",
  ],
} as const satisfies BehaviorContract;
