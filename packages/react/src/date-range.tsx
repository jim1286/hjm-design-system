import {
  emptyDateRange,
  isCompleteDateRange,
  resolveDateRangeCellState,
  resolveDateRangeSelection,
  validateDateRange,
  type DateRangeValue,
} from "@hjmds/design-contracts/components/date-range";
import type {
  CalendarDescriptor,
  ComposeCalendarAccessibleName,
} from "@hjmds/design-contracts/components/calendar";
import { useState, type ReactNode } from "react";
import { Calendar, type CalendarMonthAction } from "./calendar.js";
import { classNames, useControllableState } from "./internal.js";

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
  renderCellContent?: (date: string) => ReactNode;
  className?: string;
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
  renderCellContent,
  className,
}: DateRangePickerProps<Content>) {
  const [value, setValue] = useControllableState<DateRangeValue>({
    ...(controlledValue === undefined ? {} : { value: controlledValue }),
    defaultValue: defaultValue ?? emptyDateRange,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  validateDateRange(value);
  // The hovered date previews the not-yet-committed end through the same cell
  // state function the committed range uses.
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className={classNames("hjm-date-range", className)}
      data-selecting={value.start !== null && value.end === null ? "" : undefined}
      data-complete={isCompleteDateRange(value) || undefined}
      onMouseLeave={() => setHovered(null)}
    >
      <Calendar<Content>
        descriptor={{
          ...descriptor,
          // Calendar keeps single selection: the range's own edges are painted
          // through cell content and data attributes, not by lying to it.
          selectedDate: value.end ?? value.start,
          onSelectionChange: (date) => { if (date !== null) setValue(resolveDateRangeSelection(value, date)); },
        } as CalendarDescriptor<Content>}
        composeAccessibleName={(info) => {
          const state = resolveDateRangeCellState(value, info.date, hovered);
          const base = composeAccessibleName(info);
          return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
        }}
        {...(previousMonth === undefined ? {} : { previousMonth })}
        {...(nextMonth === undefined ? {} : { nextMonth })}
        renderCellContent={(cell) => (
          <span
            className="hjm-date-range__cell"
            data-range={resolveDateRangeCellState(value, cell.date, hovered)}
            onMouseEnter={() => setHovered(cell.date)}
          >
            {renderCellContent?.(cell.date) ?? null}
          </span>
        )}
      />
    </div>
  );
}
