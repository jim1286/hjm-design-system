import { control, glyph, layout, opacity, spacing, stroke, typography } from "./foundations.js";
import { focusIndicatorContract } from "./component-contracts.js";
import { semanticColors } from "./semantic-colors.js";
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const GRID_COLUMNS = 7;
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`Calendar ${field} must not be empty`);
    }
}
/**
 * The descriptor accepts product-owned calendar keys. This only checks the
 * "YYYY-MM-DD" shape products already use as their KBO schedule date key.
 */
export function isIsoCalendarDate(value) {
    return typeof value === "string" && ISO_DATE_PATTERN.test(value);
}
export function assertIsoCalendarDate(value, field) {
    if (!isIsoCalendarDate(value)) {
        throw new TypeError(`Calendar ${field} must be an ISO "YYYY-MM-DD" date string`);
    }
}
export function isIsoCalendarMonth(value) {
    return typeof value === "string" && ISO_MONTH_PATTERN.test(value);
}
export function assertIsoCalendarMonth(value, field) {
    if (!isIsoCalendarMonth(value)) {
        throw new TypeError(`Calendar ${field} must be an ISO "YYYY-MM" month string`);
    }
}
/** Civil Gregorian display cells only; business dates, time zones and the clock remain caller-owned. */
export function createCalendarMonthCells(month, { weekStartsOn = 0, outsideMonth = "adjacent" } = {}) {
    assertIsoCalendarMonth(month, "month");
    if (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
        throw new RangeError("Calendar weekStartsOn must be an integer from zero to six");
    }
    if (outsideMonth !== "adjacent" && outsideMonth !== "blank") {
        throw new TypeError("Calendar outsideMonth must be adjacent or blank");
    }
    // UTC is a coordinate system for civil-day layout, never a conversion of the
    // traveller's/service's date. Local Date arithmetic skips/repeats hours at DST.
    const first = new Date(`${month}-01T00:00:00Z`);
    const next = new Date(first);
    next.setUTCMonth(next.getUTCMonth() + 1);
    const day = 86_400_000;
    const leading = (first.getUTCDay() - weekStartsOn + 7) % 7;
    const count = Math.ceil((leading + (next.getTime() - first.getTime()) / day) / 7) * 7;
    return Array.from({ length: count }, (_, index) => {
        const value = new Date(first.getTime() + (index - leading) * day);
        // Four-digit descriptor keys cannot represent the adjacent year at the
        // outer supported boundaries. Those cells stay non-interactive fillers.
        if (value.getUTCFullYear() < 0 || value.getUTCFullYear() > 9999)
            return {};
        const date = value.toISOString().slice(0, 10);
        const outsideFocusedMonth = !date.startsWith(month);
        return outsideFocusedMonth
            ? outsideMonth === "blank" ? {} : { date, outsideFocusedMonth: true }
            : { date };
    });
}
export function validateCalendarGridDescriptor(grid) {
    if (grid.cells.length === 0 || grid.cells.length % GRID_COLUMNS !== 0) {
        throw new RangeError("Calendar grid cells must be a non-empty multiple of seven");
    }
    if (grid.weekdayLabels.length !== GRID_COLUMNS) {
        throw new RangeError("Calendar weekdayLabels must have exactly seven entries");
    }
    grid.weekdayLabels.forEach((label, index) => assertNonEmpty(label, `weekdayLabels[${index}]`));
    assertIsoCalendarDate(grid.todayDate, "todayDate");
    const seen = new Set();
    for (const cell of grid.cells) {
        if (cell.date === undefined)
            continue;
        assertIsoCalendarDate(cell.date, "cell date");
        if (seen.has(cell.date)) {
            throw new TypeError(`Duplicate Calendar cell date: ${cell.date}`);
        }
        seen.add(cell.date);
    }
}
export function validateCalendarMonthNavigation(navigation) {
    const month = navigation.focusedMonth ?? navigation.defaultFocusedMonth;
    if (month !== undefined)
        assertIsoCalendarMonth(month, "focusedMonth");
}
export function validateCalendarSelection(selection) {
    const selected = selection.selectedDate ?? selection.defaultSelectedDate;
    if (selected != null)
        assertIsoCalendarDate(selected, "selectedDate");
}
export function validateCalendarDescriptor(descriptor) {
    validateCalendarGridDescriptor(descriptor.grid);
    assertNonEmpty(descriptor.monthLabel, "monthLabel");
    validateCalendarMonthNavigation(descriptor);
    validateCalendarSelection(descriptor);
}
/**
 * Resolves per-cell semantic state against a selection supplied separately
 * from the raw grid (mirroring `resolveSelectSelectedItem`'s separation of
 * source data from selection state) — the same grid page renders identically
 * whether it is hosted by Calendar or by DatePicker's popover/sheet.
 */
export function resolveCalendarGridDescriptor(grid, selectedDate, options) {
    validateCalendarGridDescriptor(grid);
    if (typeof options.composeAccessibleName !== "function") {
        throw new TypeError("Calendar composeAccessibleName must be a function");
    }
    return grid.cells.map((cell, index) => {
        const row = Math.floor(index / GRID_COLUMNS) + 1;
        const column = (index % GRID_COLUMNS) + 1;
        if (cell.date === undefined) {
            return { row, column, filler: true };
        }
        const isToday = cell.date === grid.todayDate;
        const isSelected = cell.date === selectedDate;
        const disabled = cell.disabled ?? false;
        const nameInfo = cell.content === undefined
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
export function resolveCalendarDescriptor(descriptor, options) {
    validateCalendarDescriptor(descriptor);
    const selectedDate = descriptor.selectedDate ?? descriptor.defaultSelectedDate ?? null;
    return resolveCalendarGridDescriptor(descriptor.grid, selectedDate, options);
}
/**
 * ArrowLeft/Right flip under RTL, matching `getSelectionNavigationIntent`'s
 * `direction` parameter.
 */
export function getCalendarNavigationIntent(key, direction = "ltr") {
    if (key === "Home")
        return "first-of-week";
    if (key === "End")
        return "last-of-week";
    if (key === "ArrowDown")
        return "next-week";
    if (key === "ArrowUp")
        return "previous-week";
    if (key === "ArrowRight")
        return direction === "rtl" ? "previous-day" : "next-day";
    if (key === "ArrowLeft")
        return direction === "rtl" ? "next-day" : "previous-day";
    return undefined;
}
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
export function getCalendarNavigationTarget(grid, currentDate, intent) {
    validateCalendarGridDescriptor(grid);
    const currentIndex = grid.cells.findIndex((cell) => cell.date === currentDate);
    if (currentIndex < 0) {
        throw new RangeError(`Calendar currentDate is not part of this grid page: ${currentDate}`);
    }
    const findDated = (from, step) => {
        for (let index = from; index >= 0 && index < grid.cells.length; index += step) {
            if (grid.cells[index]?.date !== undefined)
                return index;
        }
        return undefined;
    };
    const rowStart = Math.floor(currentIndex / GRID_COLUMNS) * GRID_COLUMNS;
    const rowEnd = rowStart + GRID_COLUMNS - 1;
    if (intent === "first-of-week") {
        const found = findDated(rowStart, 1);
        return found !== undefined && found <= rowEnd
            ? { date: grid.cells[found].date }
            : { overflow: "before" };
    }
    if (intent === "last-of-week") {
        const found = findDated(rowEnd, -1);
        return found !== undefined && found >= rowStart
            ? { date: grid.cells[found].date }
            : { overflow: "after" };
    }
    const forward = intent === "next-day" || intent === "next-week";
    const stride = intent === "next-week" || intent === "previous-week" ? GRID_COLUMNS : 1;
    const step = forward ? 1 : -1;
    const target = currentIndex + step * stride;
    if (target < 0)
        return { overflow: "before" };
    if (target >= grid.cells.length)
        return { overflow: "after" };
    if (grid.cells[target]?.date !== undefined)
        return { date: grid.cells[target].date };
    // Landed on a filler (only reachable for a week-step into a partially
    // filled edge row): keep scanning the same direction for the nearest real
    // date rather than asking a renderer to interpret a blank cell.
    const resolved = findDated(target, step);
    return resolved !== undefined
        ? { date: grid.cells[resolved].date }
        : { overflow: forward ? "after" : "before" };
}
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
    ],
    defaults: { size: "medium" },
    // A week stays scannable: the 1280 Web host spread seven columns to ~135px each (2026-10-17 review). Same width as the
    // DatePicker popover.
    maxWidth: layout.readingMaxWidth / 2,
    header: {
        gap: spacing.xs,
        monthLabel: {
            textVariant: "title",
            fontWeight: typography.title.fontWeight,
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
        // Dense annotated calendars need a smaller visual marker without shrinking the hit target.
        compact: { cellDiameter: control.minTouchTarget, indicatorDiameter: 28, textVariant: "body", glyph: "sm" },
        medium: { cellDiameter: control.minTouchTarget, indicatorDiameter: control.minTouchTarget, textVariant: "body", glyph: "sm" },
        large: { cellDiameter: glyph.xxl, indicatorDiameter: glyph.xxl, textVariant: "bodyLarge", glyph: "md" },
    },
    day: {
        radius: "full",
        // Space between the date circle and product content (dots, results). Native drew content flush against a
        // selected circle while Web already used this gap (2026-11-04 오늘야구 games screen).
        contentGap: spacing.xxs,
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
    /**
     * Folded calendar (2026-11-04, 오늘야구 games screen): one week row with a handle under it that unfolds the month in
     * place. The handle is a chevron pointing where the grid will go (down folded, up unfolded): a plain grab bar did not
     * say it opens anything (same-day user request). It keeps the full touch target.
     */
    fold: {
        handle: { icon: { expand: "chevronDown", collapse: "chevronUp" }, glyph: "md", color: semanticColors.content.secondary, touchTarget: control.minTouchTarget },
    },
};
/** Row indexes of a grid to draw: all unfolded; folded, the week of the selected date, then today, then the first date. */
function visibleRowIndexes(cells, { expanded, selectedDate, todayDate }) {
    const rows = Array.from({ length: Math.ceil(cells.length / GRID_COLUMNS) }, (_, index) => index);
    if (expanded)
        return rows;
    const index = [selectedDate, todayDate].map((date) => date ? cells.findIndex((cell) => cell.date === date) : -1).find((found) => found >= 0)
        ?? cells.findIndex((cell) => cell.date !== undefined);
    return index >= 0 ? [Math.floor(index / GRID_COLUMNS)] : rows.slice(0, 1);
}
/**
 * The week rows a calendar shows: every row when unfolded, otherwise the row holding the selected date, then today,
 * then the first date of the grid (2026-11-04).
 */
export function resolveCalendarVisibleRows(cells, expanded) {
    const dated = cells.filter((cell) => !("filler" in cell));
    return visibleRowIndexes(cells.map((cell) => "filler" in cell ? {} : { date: cell.date }), {
        expanded, selectedDate: dated.find((cell) => cell.isSelected)?.date ?? null, todayDate: dated.find((cell) => cell.isToday)?.date ?? "",
    });
}
/**
 * First and last date the calendar will draw, so a product loads exactly that (2026-11-04: 오늘야구 asked for a six-week
 * grid, past its range API's 31-day limit, and lost every game dot). Folded, that is one week, which may cross into the
 * adjacent month when its cells come from `createCalendarMonthCells(..., { outsideMonth: "adjacent" })`.
 */
export function calendarVisibleDateRange(cells, view) {
    const dates = visibleRowIndexes(cells, view)
        .flatMap((row) => cells.slice(row * GRID_COLUMNS, row * GRID_COLUMNS + GRID_COLUMNS))
        .flatMap((cell) => cell.date ? [cell.date] : []);
    return dates.length ? { from: dates[0], to: dates[dates.length - 1] } : null;
}
/**
 * The header arrows of a folding calendar move one week while folded (the selected date) and one month while unfolded
 * (the focused month), so the folded week never jumps a whole month (2026-11-04 오늘야구 games screen).
 */
export function calendarFoldStep(view, direction) {
    assertIsoCalendarDate(view.selectedDate, "selectedDate");
    assertIsoCalendarMonth(view.focusedMonth, "focusedMonth");
    if (view.expanded) {
        const [year, month] = view.focusedMonth.split("-").map(Number);
        return { focusedMonth: new Date(Date.UTC(year, month - 1 + direction, 1)).toISOString().slice(0, 7) };
    }
    return { selectedDate: new Date(Date.parse(`${view.selectedDate}T00:00:00Z`) + direction * 7 * 86_400_000).toISOString().slice(0, 10) };
}
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
};
//# sourceMappingURL=calendar.js.map