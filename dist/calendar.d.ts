import type { WebKeyboardKey } from "./behaviors.js";
/**
 * The grid never parses or computes dates — month/leap-year/timezone
 * arithmetic stays product-owned (see docs/calendar.md). This only checks the
 * "YYYY-MM-DD" shape products already use as their KBO schedule date key.
 */
export declare function isIsoCalendarDate(value: string): boolean;
export declare function assertIsoCalendarDate(value: string, field: string): void;
export declare function isIsoCalendarMonth(value: string): boolean;
export declare function assertIsoCalendarMonth(value: string, field: string): void;
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
    string
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
export declare function validateCalendarGridDescriptor<Content>(grid: CalendarGridDescriptor<Content>): void;
/**
 * A cursor's committed value and the one displayed month page are
 * independent controlled axes, mirroring `SelectSelection`/`SelectOpenState`
 * in spirit: paging the visible month never clears or moves the selection.
 */
export type CalendarMonthChangeReason = "previous" | "next" | "jump";
export type CalendarMonthNavigation = Readonly<{
    focusedMonth: string;
    defaultFocusedMonth?: never;
    onFocusedMonthChange(month: string, reason: CalendarMonthChangeReason): void;
}> | Readonly<{
    focusedMonth?: never;
    defaultFocusedMonth?: string;
    onFocusedMonthChange?: (month: string, reason: CalendarMonthChangeReason) => void;
}>;
export declare function validateCalendarMonthNavigation(navigation: CalendarMonthNavigation): void;
/**
 * Single committed date only. Range selection is deliberately excluded — no
 * Yajalal or BurnTok flow has measured demand for it (see docs/calendar.md).
 */
export type CalendarSelection = Readonly<{
    selectedDate: string | null;
    defaultSelectedDate?: never;
    onSelectionChange(date: string | null): void;
}> | Readonly<{
    selectedDate?: never;
    defaultSelectedDate?: string | null;
    onSelectionChange?: (date: string | null) => void;
}>;
export declare function validateCalendarSelection(selection: CalendarSelection): void;
export type CalendarDescriptor<Content = unknown> = Readonly<{
    grid: CalendarGridDescriptor<Content>;
    /** Product-formatted heading copy ("2026년 8월"); the grid never formats a date itself. */
    monthLabel: string;
}> & CalendarMonthNavigation & CalendarSelection;
export declare function validateCalendarDescriptor<Content>(descriptor: CalendarDescriptor<Content>): void;
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
export type ComposeCalendarAccessibleName<Content = unknown> = (info: CalendarAccessibleNameInfo<Content>) => string;
export type ResolvedCalendarDateCell<Content = unknown> = CalendarDateCellDescriptor<Content> & Readonly<{
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
export type ResolvedCalendarGridCell<Content = unknown> = ResolvedCalendarDateCell<Content> | ResolvedCalendarFillerCell;
/**
 * Resolves per-cell semantic state against a selection supplied separately
 * from the raw grid (mirroring `resolveSelectSelectedItem`'s separation of
 * source data from selection state) — the same grid page renders identically
 * whether it is hosted by Calendar or by DatePicker's popover/sheet.
 */
export declare function resolveCalendarGridDescriptor<Content>(grid: CalendarGridDescriptor<Content>, selectedDate: string | null, options: Readonly<{
    composeAccessibleName: ComposeCalendarAccessibleName<Content>;
}>): readonly ResolvedCalendarGridCell<Content>[];
/** Top-level entry point: validates the descriptor and resolves its grid page. */
export declare function resolveCalendarDescriptor<Content>(descriptor: CalendarDescriptor<Content>, options: Readonly<{
    composeAccessibleName: ComposeCalendarAccessibleName<Content>;
}>): readonly ResolvedCalendarGridCell<Content>[];
export type CalendarNavigationIntent = "next-day" | "previous-day" | "next-week" | "previous-week" | "first-of-week" | "last-of-week";
/**
 * ArrowLeft/Right flip under RTL, matching `getSelectionNavigationIntent`'s
 * `direction` parameter.
 */
export declare function getCalendarNavigationIntent(key: WebKeyboardKey, direction?: "ltr" | "rtl"): CalendarNavigationIntent | undefined;
export type CalendarNavigationResult = Readonly<{
    date: string;
    overflow?: never;
}> | Readonly<{
    date?: never;
    overflow: "before" | "after";
}>;
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
export declare function getCalendarNavigationTarget<Content>(grid: CalendarGridDescriptor<Content>, currentDate: string, intent: CalendarNavigationIntent): CalendarNavigationResult;
export type CalendarSize = "medium" | "large";
/**
 * `today` and `selected` are visually independent (a non-selected today and
 * a selected past day must both read clearly) and neither is color-only:
 * today gets a persistent border, selected gets a filled background, and
 * both remain in `accessibleName`/`isToday`/`isSelected` for assistive tech.
 */
export declare const calendarRecipe: {
    readonly slots: readonly ["root", "header", "monthLabel", "previousMonth", "nextMonth", "weekdayRow", "weekdayLabel", "grid", "week", "day", "dayLabel", "content"];
    readonly defaults: {
        readonly size: "medium";
    };
    readonly header: {
        readonly gap: 8;
        readonly monthLabel: {
            readonly textVariant: "title";
            readonly fontWeight: "700";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly navButton: {
            readonly diameter: 44;
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly navIcon: {
            readonly previous: "chevronStart";
            readonly next: "chevronEnd";
        };
    };
    readonly weekdayLabel: {
        readonly textVariant: "label";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly sizes: {
        readonly medium: {
            readonly cellDiameter: 44;
            readonly textVariant: "body";
            readonly glyph: "sm";
        };
        readonly large: {
            readonly cellDiameter: 44;
            readonly textVariant: "bodyLarge";
            readonly glyph: "md";
        };
    };
    readonly day: {
        readonly radius: "full";
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly numericVariant: "tabular";
        };
        readonly outsideFocusedMonthOpacity: 0.72;
        readonly disabledOpacity: 0.5;
        readonly today: {
            readonly border: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
        };
        readonly selected: {
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
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
export declare const calendarBehavior: {
    readonly controlled: readonly ["selectedDate", "defaultSelectedDate", "onSelectionChange", "focusedMonth", "defaultFocusedMonth", "onFocusedMonthChange"];
    readonly inputs: readonly ["grid", "monthLabel"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly value: readonly ["selected"];
    };
    readonly web: {
        readonly roles: readonly ["grid", "row", "gridcell", "button"];
        readonly keyboard: readonly ["Tab", "Enter", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
        readonly focus: "roving";
    };
    readonly native: {
        readonly roles: readonly ["button"];
        readonly states: readonly ["disabled", "selected"];
        readonly actions: readonly ["activate"];
    };
    readonly scenarios: readonly ["today-and-selected-are-independent-and-both-non-color-marked", "disabled-dates-remain-focusable-but-never-activate", "arrow-keys-move-by-day-and-week-inside-the-visible-month-page", "home-and-end-move-to-the-first-and-last-dated-cell-of-the-focused-row", "moving-past-the-visible-grid-edge-requests-a-month-change-instead-of-wrapping", "filler-cells-carry-no-accessible-name-and-are-hidden-from-assistive-tech", "every-dated-cell-accessible-name-is-composed-by-the-product", "changing-the-focused-month-never-changes-or-clears-the-selection", "range-selection-is-not-part-of-the-contract"];
};
//# sourceMappingURL=calendar.d.ts.map