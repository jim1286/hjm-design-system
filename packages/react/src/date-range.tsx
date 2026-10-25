"use client";

import {
  dateRangeSpans,
  defaultDateRangeLimit,
  emptyDateRange,
  isCompleteDateRange,
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
import { useState, type ReactNode } from "react";
import { CalendarGrid, type CalendarMonthAction } from "./internal/calendar-grid.js";
import { classNames, useControllableState } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

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
  className?: string;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
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
  className,
  layoutStyle,
}: DateRangePickerProps<Content>) {
  const [value, setValue] = useControllableState<DateRangeValue>({
    ...(controlledValue === undefined ? {} : { value: controlledValue }),
    defaultValue: defaultValue ?? emptyDateRange,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  validateDateRange(value, maxRange);
  // The hovered date previews the not-yet-committed end through the same cell
  // state function the committed range uses. A date past the limit previews nothing.
  const [pointer, setPointer] = useState<string | null>(null);
  const hovered = pointer !== null && isDateWithinRangeLimit(value, pointer, maxRange) ? pointer : null;
  const selecting = value.start !== null && value.end === null;

  return (
    <div
      style={layoutStyle}
      className={classNames("hjm-date-range", className)}
      data-selecting={selecting ? "" : undefined}
      data-complete={isCompleteDateRange(value) || undefined}
    >
      <CalendarGrid<Content>
        descriptor={{
          ...descriptor,
          // Calendar keeps single selection; the grid paints both edges and the band
          // from `range`, so this only routes presses.
          selectedDate: value.end ?? value.start,
          onSelectionChange: (date) => { if (date !== null) setValue(resolveDateRangeSelection(value, date, maxRange)); },
        } as CalendarDescriptor<Content>}
        composeAccessibleName={(info) => {
          const state = resolveDateRangeCellState(value, info.date, hovered);
          const base = composeAccessibleName(info);
          return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
        }}
        range={{
          stateOf: (date) => resolveDateRangeCellState(value, date, hovered),
          spans: dateRangeSpans(value, hovered),
          previewing: selecting && hovered !== null && hovered !== value.start,
          allows: (date) => isDateWithinRangeLimit(value, date, maxRange),
          onHover: setPointer,
        }}
        {...(previousMonth === undefined ? {} : { previousMonth })}
        {...(nextMonth === undefined ? {} : { nextMonth })}
        {...(renderCellContent === undefined ? {} : { renderCellContent: (cell) => renderCellContent(cell.date) })}
      />
    </div>
  );
}
