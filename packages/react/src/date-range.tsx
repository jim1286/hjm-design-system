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
  resolveDateRangeExpandedAfterSelection,
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
import { Icon } from "./supplemental-display.js";
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

/** Fold the grid behind `summary`, which becomes the toggle; presets stay visible. */
export type DateRangeCollapsible = Readonly<{
  /** Controlled open state. Without it the grid starts folded and folds again after a preset or a completing date. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
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
  /**
   * Fold the grid behind `summary` (required), which becomes a toggle button; presets stay visible. A preset or a date
   * that completes the range folds it again (`resolveDateRangeExpandedAfterSelection`).
   */
  collapsible?: DateRangeCollapsible;
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
  collapsible,
  className,
  layoutStyle,
}: DateRangePickerProps<Content>) {
  if (collapsible && !summary) throw new TypeError("DateRangePicker collapsible needs summary to act as its toggle");
  const [value, setValue] = useControllableState<DateRangeValue>({
    ...(controlledValue === undefined ? {} : { value: controlledValue }),
    defaultValue: defaultValue ?? emptyDateRange,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  validateDateRange(value, maxRange);
  const [expanded, setExpanded] = useControllableState<boolean>({
    ...(collapsible?.expanded === undefined ? {} : { value: collapsible.expanded }),
    defaultValue: collapsible?.defaultExpanded ?? false,
    ...(collapsible?.onExpandedChange === undefined ? {} : { onChange: collapsible.onExpandedChange }),
  });
  const open = collapsible === undefined || expanded;
  const select = (next: DateRangeValue, source: "date" | "preset") => {
    setValue(next);
    if (collapsible && !resolveDateRangeExpandedAfterSelection(next, source)) setExpanded(false);
  };
  // The hovered date previews the not-yet-committed end through the same cell
  // state function the committed range uses.
  const [pointer, setPointer] = useState<string | null>(null);
  const hovered = pointer !== null && isDateWithinRangeLimit(value, pointer, maxRange) ? pointer : null;

  const activeEdge = resolveDateRangeActiveEdge(value);
  // A button may only hold phrasing content, so the fields become spans when the summary is the toggle.
  const Field = collapsible ? "span" : "div";
  const field = (edge: "start" | "end") => {
    const date = value[edge];
    return (
      <Field key={edge} className="hjm-date-range__field" data-active={activeEdge === edge || undefined} data-empty={date === null || undefined}>
        <span className="hjm-date-range__field-label">{edge === "start" ? summary!.startLabel : summary!.endLabel}</span>
        <span className="hjm-date-range__field-value">{date === null ? summary!.placeholder : summary!.formatDate(date)}</span>
      </Field>
    );
  };

  return (
    <div
      style={layoutStyle}
      className={classNames("hjm-date-range", className)}
      data-selecting={value.start !== null && value.end === null ? "" : undefined}
      data-complete={isCompleteDateRange(value) || undefined}
      data-expanded={collapsible ? String(open) : undefined}
      onMouseLeave={() => setPointer(null)}
    >
      {summary && collapsible ? (
        <button type="button" className="hjm-date-range__summary" data-toggle="" aria-expanded={open} onClick={() => setExpanded(!open)}>
          {field("start")}{field("end")}
          <Icon name={open ? dateRangeRecipe.toggle.icon.expanded : dateRangeRecipe.toggle.icon.collapsed}
            size={dateRangeRecipe.toggle.glyph} tone="secondary" decorative />
        </button>
      ) : summary ? <div className="hjm-date-range__summary">{field("start")}{field("end")}</div> : null}
      {presets?.length ? (
        <div className="hjm-date-range__presets">
          {presets.map((preset) => {
            const range = resolveDateRangePreset(descriptor.grid.todayDate, preset.length);
            return (
              <Chip key={preset.id} label={preset.label} size={dateRangeRecipe.presets.chipSize} selectionMode="single"
                selected={range.start === value.start && range.end === value.end}
                onSelectedChange={() => {
                  validateDateRange(range, maxRange);
                  select(range, "preset");
                  // A preset ends today; bring its end month into view like a jump, so the band is visible.
                  // The `all` preset is the empty range and has no month to show.
                  const month = range.end?.slice(0, 7);
                  if (month !== undefined && descriptor.focusedMonth !== month) descriptor.onFocusedMonthChange?.(month, "jump");
                }} />
            );
          })}
        </div>
      ) : null}
      {open ? <CalendarPaintContext.Provider value={{ paint: (date) => resolveDateRangeCellPaint(value, date, hovered), onDayHover: setPointer }}>
        <Calendar<Content>
          descriptor={{
            ...descriptor,
            // The range owns eligibility; Calendar keeps the same disabled-day interaction contract.
            grid: { ...descriptor.grid, cells: descriptor.grid.cells.map(cell => cell.date === undefined ? cell :
              { ...cell, disabled: cell.disabled === true || !isDateWithinRangeLimit(value, cell.date, maxRange) }) },
            // Calendar keeps single selection; the two edges and the band are painted through the internal
            // paint context, and each day's name carries the range position for assistive tech.
            selectedDate: value.end ?? value.start,
            onSelectionChange: (date) => { if (date !== null) select(resolveDateRangeSelection(value, date, maxRange), "date"); },
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
      </CalendarPaintContext.Provider> : null}
    </div>
  );
}
