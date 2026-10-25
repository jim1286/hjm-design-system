import {
  dateRangeSpans,
  defaultDateRangeLimit,
  emptyDateRange,
  isDateWithinRangeLimit,
  resolveDateRangeCellState,
  resolveDateRangeSelection,
  validateDateRange,
  type DateRangeLimit,
  type DateRangeValue,
} from "@hjmds/design-contracts/components/date-range";
import type {
  CalendarDescriptor,
  ComposeCalendarAccessibleName,
} from "@hjmds/design-contracts/components/calendar";
import type { ReactNode } from "react";
import { CalendarGrid, type CalendarMonthAction } from "./internal/calendar-grid.js";
import { useControllableState } from "./internal/state.js";

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
  rangeLabels: Readonly<{ start: string; end: string; between: string }>;
  /** Longest span, end inclusive. Defaults to one year; `null` removes the limit. */
  maxRange?: DateRangeLimit | null;
  renderCellContent?: (date: string) => ReactNode;
}>;

export function DateRangePicker<Content = unknown>({
  descriptor,
  composeAccessibleName,
  value: controlledValue,
  defaultValue,
  onValueChange,
  previousMonth,
  nextMonth,
  rangeLabels,
  maxRange = defaultDateRangeLimit,
  renderCellContent,
}: DateRangePickerProps<Content>) {
  const [value, setValue] = useControllableState<DateRangeValue>({
    ...(controlledValue === undefined ? {} : { value: controlledValue }),
    defaultValue: defaultValue ?? emptyDateRange,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  validateDateRange(value, maxRange);
  return (
    <CalendarGrid<Content>
      descriptor={{
        ...descriptor,
        // Calendar keeps single selection; the grid paints both edges and the band
        // from `range`, so this only routes presses.
        selectedDate: value.end ?? value.start,
        onSelectionChange: (date) => { if (date !== null) setValue(resolveDateRangeSelection(value, date, maxRange)); },
      } as CalendarDescriptor<Content>}
      composeAccessibleName={(info) => {
        const state = resolveDateRangeCellState(value, info.date, null);
        const base = composeAccessibleName(info);
        return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
      }}
      range={{
        stateOf: (date) => resolveDateRangeCellState(value, date, null),
        spans: dateRangeSpans(value),
        allows: (date) => isDateWithinRangeLimit(value, date, maxRange),
      }}
      {...(previousMonth === undefined ? {} : { previousMonth })}
      {...(nextMonth === undefined ? {} : { nextMonth })}
      {...(renderCellContent === undefined ? {} : { renderCellContent: (cell) => renderCellContent(cell.date) })}
    />
  );
}
