import { type DateRangeLimit, type DateRangePresetLength, type DateRangeValue } from "@hjmds/design-contracts/components/date-range";
import type { CalendarDescriptor, ComposeCalendarAccessibleName } from "@hjmds/design-contracts/components/calendar";
import type { ReactNode } from "react";
import { type CalendarMonthAction } from "./calendar.js";
export type DateRangeSummary = Readonly<{
    startLabel: string;
    endLabel: string;
    /** Shown in a field whose date is not chosen yet. */
    placeholder: string;
    formatDate: (date: string) => string;
}>;
/** A shortcut such as "최근 7일" or "1개월" that ends on the grid's `todayDate`. */
export type DateRangePresetOption = Readonly<{
    id: string;
    label: string;
    length: DateRangePresetLength;
}>;
type RangeCalendarDescriptor<T> = T extends unknown ? Omit<T, "selectedDate" | "defaultSelectedDate" | "onSelectionChange"> : never;
export type DateRangePickerProps<Content = unknown> = Readonly<{
    /** The same grid Calendar renders; the product still owns month data. */
    descriptor: RangeCalendarDescriptor<CalendarDescriptor<Content>>;
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
    /** Inclusive calendar span; one year by default, null removes the limit. */
    maxRange?: DateRangeLimit | null;
    renderCellContent?: (date: string) => ReactNode;
    /** Start/end fields above the grid; the edge the next tap sets is marked (replaces a hint sentence). */
    summary?: DateRangeSummary;
    /** Shortcut chips between the summary and the grid; each ends on `descriptor.grid.todayDate`. */
    presets?: readonly DateRangePresetOption[];
}>;
export declare function DateRangePicker<Content = unknown>({ descriptor, composeAccessibleName, value: controlledValue, defaultValue, onValueChange, previousMonth, nextMonth, rangeLabels, maxRange, renderCellContent, summary, presets, }: DateRangePickerProps<Content>): import("react").JSX.Element;
export {};
//# sourceMappingURL=date-range.d.ts.map