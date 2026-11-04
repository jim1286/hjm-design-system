import { type ReactNode, type Ref } from "react";
import { type CalendarDescriptor, type CalendarFold, type CalendarSize, type CalendarNavigationIntent, type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell } from "@hjmds/design-contracts/components/calendar";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CalendarMonthAction = Readonly<{
    month: string;
    label: string;
}>;
export type CalendarHandle = Readonly<{
    focusDate(date: string): void;
}>;
export type CalendarOverflow = Readonly<{
    date: string;
    intent: CalendarNavigationIntent;
    overflow: "before" | "after";
}>;
export type CalendarProps<Content = unknown> = Readonly<{
    descriptor: CalendarDescriptor<Content>;
    composeAccessibleName: ComposeCalendarAccessibleName<Content>;
    previousMonth?: CalendarMonthAction;
    nextMonth?: CalendarMonthAction;
    /** The product owns adjacent month/date arithmetic. Call focusDate after requesting its page. */
    onNavigateBeyondGrid?: (detail: CalendarOverflow, focusDate: CalendarHandle["focusDate"]) => void;
    renderCellContent?: (cell: ResolvedCalendarDateCell<Content>) => ReactNode;
    size?: CalendarSize;
    /** Shows one week with a handle that unfolds the month in place (see `CalendarFold`). */
    fold?: CalendarFold;
    /** `hidden` keeps the month label as the grid's accessible name without drawing it (same contract as Native). */
    monthLabelVisibility?: "visible" | "hidden";
    autoFocus?: boolean;
    className?: string;
    ref?: Ref<CalendarHandle>;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Inline single-date grid shared with DatePicker; month data remains product-owned. */
export declare function Calendar<Content>({ descriptor, composeAccessibleName, previousMonth, nextMonth, onNavigateBeyondGrid, renderCellContent, size, fold, monthLabelVisibility, autoFocus, className, layoutStyle, ref }: CalendarProps<Content>): import("react").JSX.Element;
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
    className?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** ‹ month › for a folding Calendar placed in a host header; a week per step folded, a month unfolded (same as Native). */
export declare function CalendarFoldHeader({ monthLabel, expanded, selectedDate, focusedMonth, labels, onSelectedDateChange, onFocusedMonthChange, className, layoutStyle }: CalendarFoldHeaderProps): import("react").JSX.Element;
//# sourceMappingURL=calendar.d.ts.map