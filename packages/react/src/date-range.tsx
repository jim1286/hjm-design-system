"use client";

import {
  dateRangeRecipe,
  emptyDateRange,
  defaultDateRangeLimit,
  isDateWithinRangeLimit,
  type DateRangeLimit,
  isCompleteDateRange,
  resolveDateRangeActiveEdge,
  resolveDateRangeCellPaint,
  resolveDateRangeCellState,
  resolveDateRangePreset,
  type DateRangePresetLength,
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
import { CalendarPaintContext } from "./internal/calendar-paint.js";
import { Chip } from "./selection.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type DateRangeSummary = Readonly<{
  startLabel: string;
  endLabel: string;
  /** Shown in a field whose date is not chosen yet. */
  placeholder: string;
  formatDate: (date: string) => string;
}>;

/** A shortcut such as "최근 7일" or "1개월" that ends on the grid's `todayDate`. */
export type DateRangePresetOption = Readonly<{ id: string; label: string; length: DateRangePresetLength }>;

// Preserve Calendar's controlled/uncontrolled month union when removing its single-date selection props.
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
  rangeLabels: Readonly<{ start: string; end: string; between: string }>;
  /** Inclusive calendar span; one year by default, null removes the limit. */
  maxRange?: DateRangeLimit | null;
  renderCellContent?: (date: string) => ReactNode;
  /** Start/end fields above the grid; the edge the next tap sets is marked (replaces a hint sentence). */
  summary?: DateRangeSummary;
  /** Shortcut chips between the summary and the grid; each ends on `descriptor.grid.todayDate`. */
  presets?: readonly DateRangePresetOption[];
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
  summary,
  presets,
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
  // state function the committed range uses.
  const [pointer, setPointer] = useState<string | null>(null);
  const hovered = pointer !== null && isDateWithinRangeLimit(value, pointer, maxRange) ? pointer : null;

  const activeEdge = resolveDateRangeActiveEdge(value);
  const field = (edge: "start" | "end") => {
    const date = value[edge];
    return (
      <div key={edge} className="hjm-date-range__field" data-active={activeEdge === edge || undefined} data-empty={date === null || undefined}>
        <span className="hjm-date-range__field-label">{edge === "start" ? summary!.startLabel : summary!.endLabel}</span>
        <span className="hjm-date-range__field-value">{date === null ? summary!.placeholder : summary!.formatDate(date)}</span>
      </div>
    );
  };

  return (
    <div
      style={layoutStyle}
      className={classNames("hjm-date-range", className)}
      data-selecting={value.start !== null && value.end === null ? "" : undefined}
      data-complete={isCompleteDateRange(value) || undefined}
      onMouseLeave={() => setPointer(null)}
    >
      {summary ? <div className="hjm-date-range__summary">{field("start")}{field("end")}</div> : null}
      {presets?.length ? (
        <div className="hjm-date-range__presets">
          {presets.map((preset) => {
            const range = resolveDateRangePreset(descriptor.grid.todayDate, preset.length);
            return (
              <Chip key={preset.id} label={preset.label} size={dateRangeRecipe.presets.chipSize} selectionMode="single"
                selected={range.start === value.start && range.end === value.end}
                onSelectedChange={() => {
                  validateDateRange(range, maxRange);
                  setValue(range);
                  // A preset ends today; bring its end month into view like a jump, so the band is visible.
                  const month = range.end!.slice(0, 7);
                  if (descriptor.focusedMonth !== month) descriptor.onFocusedMonthChange?.(month, "jump");
                }} />
            );
          })}
        </div>
      ) : null}
      <CalendarPaintContext.Provider value={{ paint: (date) => resolveDateRangeCellPaint(value, date, hovered), onDayHover: setPointer }}>
        <Calendar<Content>
          descriptor={{
            ...descriptor,
            // The range owns eligibility; Calendar keeps the same disabled-day interaction contract.
            grid: { ...descriptor.grid, cells: descriptor.grid.cells.map(cell => cell.date === undefined ? cell :
              { ...cell, disabled: cell.disabled === true || !isDateWithinRangeLimit(value, cell.date, maxRange) }) },
            // Calendar keeps single selection; the two edges and the band are painted through the internal
            // paint context, and each day's name carries the range position for assistive tech.
            selectedDate: value.end ?? value.start,
            onSelectionChange: (date) => { if (date !== null) setValue(resolveDateRangeSelection(value, date, maxRange)); },
          } as CalendarDescriptor<Content>}
          composeAccessibleName={(info) => {
            const state = resolveDateRangeCellState(value, info.date, hovered);
            const base = composeAccessibleName(info);
            return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
          }}
          {...(previousMonth === undefined ? {} : { previousMonth })}
          {...(nextMonth === undefined ? {} : { nextMonth })}
          {...(renderCellContent === undefined ? {} : { renderCellContent: (cell: { date: string }) => renderCellContent(cell.date) })}
        />
      </CalendarPaintContext.Provider>
    </div>
  );
}
