import { type ReactNode, type Ref } from "react";
import { type CalendarDescriptor, type CalendarSize, type CalendarNavigationIntent, type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell } from "@hjmds/design-contracts/components/calendar";
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
    autoFocus?: boolean;
    className?: string;
    ref?: Ref<CalendarHandle>;
}>;
/** Inline single-date grid shared with DatePicker; month data remains product-owned. */
export declare function Calendar<Content>({ descriptor, composeAccessibleName, previousMonth, nextMonth, onNavigateBeyondGrid, renderCellContent, size, autoFocus, className, ref }: CalendarProps<Content>): import("react").JSX.Element;
//# sourceMappingURL=calendar.d.ts.map