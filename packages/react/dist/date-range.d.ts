import { type DateRangeValue } from "@hjmds/design-contracts/components/date-range";
import type { CalendarDescriptor, ComposeCalendarAccessibleName } from "@hjmds/design-contracts/components/calendar";
import { type ReactNode } from "react";
import { type CalendarMonthAction } from "./calendar.js";
export type DateRangePickerProps<Content = unknown> = Readonly<{
    /** The same grid Calendar renders; the product still owns month data. */
    descriptor: Omit<CalendarDescriptor<Content>, "selectedDate" | "defaultSelectedDate" | "onSelectionChange">;
    composeAccessibleName: ComposeCalendarAccessibleName<Content>;
    value?: DateRangeValue;
    defaultValue?: DateRangeValue;
    onValueChange?: (value: DateRangeValue) => void;
    previousMonth?: CalendarMonthAction;
    nextMonth?: CalendarMonthAction;
    /** Localized suffixes appended to a day's name when it is a range edge. */
    rangeLabels: Readonly<{
        start: string;
        end: string;
        between: string;
    }>;
    renderCellContent?: (date: string) => ReactNode;
    className?: string;
}>;
export declare function DateRangePicker<Content = unknown>({ descriptor, composeAccessibleName, value: controlledValue, defaultValue, onValueChange, previousMonth, nextMonth, rangeLabels, renderCellContent, className, }: DateRangePickerProps<Content>): import("react").JSX.Element;
//# sourceMappingURL=date-range.d.ts.map