import { type DateRangePresetLength, type DateRangeValue } from "@hjmds/design-contracts/components/date-range";
import type { CalendarDescriptor, ComposeCalendarAccessibleName } from "@hjmds/design-contracts/components/calendar";
import { type ReactNode } from "react";
import { type CalendarMonthAction } from "./calendar.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
    /** Start/end fields above the grid; the edge the next tap sets is marked (replaces a hint sentence). */
    summary?: DateRangeSummary;
    /** Shortcut chips between the summary and the grid; each ends on `descriptor.grid.todayDate`. */
    presets?: readonly DateRangePresetOption[];
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function DateRangePicker<Content = unknown>({ descriptor, composeAccessibleName, value: controlledValue, defaultValue, onValueChange, previousMonth, nextMonth, rangeLabels, renderCellContent, summary, presets, className, layoutStyle, }: DateRangePickerProps<Content>): import("react").JSX.Element;
//# sourceMappingURL=date-range.d.ts.map