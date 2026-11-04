import { type ReactNode, type Ref } from "react";
import { type CalendarDescriptor, type CalendarFold, type CalendarSize, type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell } from "@hjmds/design-contracts/components/calendar";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CalendarMonthAction = Readonly<{
    month: string;
    label: string;
}>;
export type CalendarHandle = Readonly<{
    focusDate(date: string): void;
}>;
export type CalendarProps<Content = unknown> = Readonly<{
    descriptor: CalendarDescriptor<Content>;
    composeAccessibleName: ComposeCalendarAccessibleName<Content>;
    previousMonth?: CalendarMonthAction;
    nextMonth?: CalendarMonthAction;
    renderCellContent?: (cell: ResolvedCalendarDateCell<Content>) => ReactNode;
    size?: CalendarSize;
    /** Shows one week with a handle that unfolds the month in place (see `CalendarFold`). */
    fold?: CalendarFold;
    /**
     * `hidden` keeps the month label as the grid's accessible name but does not draw it, for hosts that already show the
     * month in their own header (2026-11-04 오늘야구 games screen). Month buttons still draw when provided.
     */
    monthLabelVisibility?: "visible" | "hidden";
    ref?: Ref<CalendarHandle>;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Inline dates stay individually accessible; Native month paging uses explicit buttons. */
export declare function Calendar<Content>({ descriptor, composeAccessibleName, previousMonth, nextMonth, renderCellContent, size, fold, monthLabelVisibility, ref, layoutStyle }: CalendarProps<Content>): import("react").JSX.Element;
export type CalendarFoldHeaderProps = Readonly<{
    monthLabel: string;
    expanded: boolean;
    selectedDate: string;
    focusedMonth: string;
    labels: Readonly<{
        previousWeek: string;
        nextWeek: string;
        previousMonth: string;
        nextMonth: string;
    }>;
    onSelectedDateChange(date: string): void;
    onFocusedMonthChange(month: string): void;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * ‹ month › for a folding Calendar that a host places in its own header line (2026-11-04 오늘야구 games screen keeps
 * it in the top bar). The arrows step a week while folded and a month while unfolded (`calendarFoldStep`).
 */
export declare function CalendarFoldHeader({ monthLabel, expanded, selectedDate, focusedMonth, labels, onSelectedDateChange, onFocusedMonthChange, layoutStyle }: CalendarFoldHeaderProps): import("react").JSX.Element;
//# sourceMappingURL=calendar.d.ts.map