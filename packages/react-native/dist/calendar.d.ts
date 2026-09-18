import { type ReactNode, type Ref } from "react";
import { type CalendarDescriptor, type CalendarSize, type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell } from "@hjmds/design-contracts/components/calendar";
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
    ref?: Ref<CalendarHandle>;
}>;
/** Inline dates stay individually accessible; Native month paging uses explicit buttons. */
export declare function Calendar<Content>({ descriptor, composeAccessibleName, previousMonth, nextMonth, renderCellContent, size, ref }: CalendarProps<Content>): import("react").JSX.Element;
//# sourceMappingURL=calendar.d.ts.map