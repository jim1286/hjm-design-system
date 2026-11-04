"use client";

import { useContext, useEffect, useId, useImperativeHandle, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import {
  calendarRecipe as recipe, assertIsoCalendarMonth, validateCalendarDescriptor, resolveCalendarGridDescriptor,
  getCalendarNavigationIntent, getCalendarNavigationTarget, resolveCalendarVisibleRows, calendarFoldStep,
  type CalendarDescriptor, type CalendarFold, type CalendarSize, type CalendarNavigationIntent,
  type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell,
} from "@hjmds/design-contracts/components/calendar";
import { classNames, useControllableState } from "./internal.js";
import { CalendarPaintContext } from "./internal/calendar-paint.js";
import { Icon } from "./supplemental-display.js";
import { useOptionalHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type CalendarMonthAction = Readonly<{ month: string; label: string }>;
export type CalendarHandle = Readonly<{ focusDate(date: string): void }>;
export type CalendarOverflow = Readonly<{ date: string; intent: CalendarNavigationIntent; overflow: "before" | "after" }>;
export type CalendarProps<Content = unknown> = Readonly<{
  descriptor: CalendarDescriptor<Content>;
  composeAccessibleName: ComposeCalendarAccessibleName<Content>;
  previousMonth?: CalendarMonthAction;
  nextMonth?: CalendarMonthAction;
  /** The product owns adjacent month/date arithmetic. Call focusDate after requesting its page. */
  onNavigateBeyondGrid?: (detail: CalendarOverflow, focusDate: CalendarHandle["focusDate"]) => void;
  renderCellContent?: (cell: ResolvedCalendarDateCell<Content>) => ReactNode;
  size?: CalendarSize;
  /** Shows one week with a handle that unfolds the month in place (see `CalendarFold`). */
  fold?: CalendarFold;
  /** `hidden` keeps the month label as the grid's accessible name without drawing it (same contract as Native). */
  monthLabelVisibility?: "visible" | "hidden";
  autoFocus?: boolean;
  className?: string;
  ref?: Ref<CalendarHandle>;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Inline single-date grid shared with DatePicker; month data remains product-owned. */
export function Calendar<Content>({ descriptor, composeAccessibleName, previousMonth, nextMonth,
  onNavigateBeyondGrid, renderCellContent, size = "medium", fold, monthLabelVisibility = "visible", autoFocus = false, className, layoutStyle, ref }: CalendarProps<Content>) {
  validateCalendarDescriptor(descriptor);
  for (const action of [previousMonth, nextMonth]) {
    if (!action) continue;
    assertIsoCalendarMonth(action.month, "month action");
    if (!action.label.trim()) throw new TypeError("Calendar month action label must not be empty");
  }
  const theme = useOptionalHjmTheme();
  const rangePaint = useContext(CalendarPaintContext);
  const [selected, setSelected] = useControllableState<string | null>({
    ...(descriptor.selectedDate === undefined ? {} : { value: descriptor.selectedDate }),
    defaultValue: descriptor.defaultSelectedDate ?? null,
    ...(descriptor.onSelectionChange ? { onChange: descriptor.onSelectionChange } : {}),
  });
  const cells = resolveCalendarGridDescriptor(descriptor.grid, selected, { composeAccessibleName });
  if (fold && !fold.label.trim()) throw new TypeError("Calendar fold label must not be empty");
  const visibleRows = resolveCalendarVisibleRows(cells, fold?.expanded ?? true);
  const gridId = `hjm-calendar-grid-${useId()}`;
  const dates = cells.filter((cell): cell is ResolvedCalendarDateCell<Content> => !("filler" in cell));
  const initial = dates.find((cell) => cell.isSelected) ?? dates.find((cell) => cell.isToday) ?? dates[0];
  const [focused, setFocused] = useState(initial?.date);
  const active = dates.some((cell) => cell.date === focused) ? focused : initial?.date;
  const root = useRef<HTMLDivElement>(null);
  const pending = useRef<string | undefined>(undefined);
  const [request, setRequest] = useState(0);
  const focusDate = (date: string) => { pending.current = date; setFocused(date); setRequest((value) => value + 1); };
  useImperativeHandle(ref, () => ({ focusDate }), []);
  const gridKey = dates.map((cell) => cell.date).join(",");
  const mountedFocus = useRef(false);
  useEffect(() => {
    if (autoFocus && !mountedFocus.current && active) pending.current = active;
    mountedFocus.current = true;
    const date = pending.current;
    if (!date) return;
    // A requested adjacent date may arrive in a later render; retain it until that page exists.
    const button = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("[data-date]") ?? []).find((node) => node.dataset.date === date);
    if (button) { button.focus(); setFocused(date); pending.current = undefined; }
  }, [gridKey, request, autoFocus, active]);
  const titleId = `hjm-calendar-${useId()}`;
  return <div ref={root} className={classNames("hjm-calendar", className)} data-size={size}
    style={{ "--hjm-calendar-max-width": `${recipe.maxWidth}px`, ...layoutStyle, "--hjm-calendar-cell-size": `${recipe.sizes[size].cellDiameter}px`,
      "--hjm-calendar-indicator-size": `${recipe.sizes[size].indicatorDiameter}px`,
      "--hjm-calendar-disabled-opacity": recipe.day.disabledOpacity,
      "--hjm-calendar-outside-opacity": recipe.day.outsideFocusedMonthOpacity, "--hjm-calendar-content-gap": `${recipe.day.contentGap}px`,
    } as CSSProperties}>
    <div className="hjm-calendar__header">
      {previousMonth ? <button type="button" aria-label={previousMonth.label} disabled={!descriptor.onFocusedMonthChange}
        onClick={() => descriptor.onFocusedMonthChange?.(previousMonth.month, "previous")}><Icon name={recipe.header.navIcon.previous} size={recipe.sizes[size].glyph} tone="secondary" decorative /></button> : <span />}
      <strong id={titleId} aria-live="polite" aria-atomic="true" className={monthLabelVisibility === "hidden" ? "hjm-visually-hidden" : undefined}>{descriptor.monthLabel}</strong>
      {nextMonth ? <button type="button" aria-label={nextMonth.label} disabled={!descriptor.onFocusedMonthChange}
        onClick={() => descriptor.onFocusedMonthChange?.(nextMonth.month, "next")}><Icon name={recipe.header.navIcon.next} size={recipe.sizes[size].glyph} tone="secondary" decorative /></button> : <span />}
    </div>
    <div className="hjm-calendar__viewport">
      <div role="grid" id={gridId} aria-labelledby={titleId} className="hjm-calendar__grid">
        <div role="row" className="hjm-calendar__week">
          {descriptor.grid.weekdayLabels.map((label, index) => <span role="columnheader" className="hjm-calendar__weekday" key={index}>{label}</span>)}
        </div>
        {visibleRows.map((row) => <div role="row" className="hjm-calendar__week" key={row}>
          {cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell
            ? <span role="gridcell" aria-hidden="true" key={`filler-${column}`} />
            : (() => {
              const range = rangePaint?.paint(cell.date);
              const filled = range ? range.edge : cell.isSelected;
              return <button type="button" role="gridcell" key={cell.date} className="hjm-calendar__day"
              data-date={cell.date} data-focus-date={cell.date === active || undefined}
              data-today={cell.isToday || undefined} data-selected={filled || undefined}
              data-range-band={range && range.band !== "none" ? range.band : undefined}
              data-disabled={!cell.selectable || undefined} data-outside={cell.outsideFocusedMonth || undefined}
              aria-label={cell.accessibleName} aria-selected={filled} aria-disabled={!cell.selectable || undefined}
              aria-current={cell.isToday ? "date" : undefined} tabIndex={cell.date === active ? 0 : -1}
              onMouseEnter={rangePaint ? () => rangePaint.onDayHover(cell.date) : undefined}
              onFocus={() => setFocused(cell.date)} onClick={() => {
                if (!cell.selectable) return;
                // Range completion and DatePicker confirmation still need activation
                // when the date already equals Calendar's single selected value.
                if (cell.date === selected) descriptor.onSelectionChange?.(cell.date);
                else setSelected(cell.date);
              }}
              onKeyDown={(event) => {
                if (event.altKey || event.ctrlKey || event.metaKey) return;
                const intent = getCalendarNavigationIntent(event.key as Parameters<typeof getCalendarNavigationIntent>[0], theme?.environment.direction ?? "ltr");
                if (!intent) return;
                event.preventDefault();
                const target = getCalendarNavigationTarget(descriptor.grid, cell.date, intent);
                if (target.date) focusDate(target.date);
                else if (target.overflow) onNavigateBeyondGrid?.({ date: cell.date, intent, overflow: target.overflow }, focusDate);
              }}>
              {range && range.band !== "none" ? <span aria-hidden="true" className="hjm-calendar__band" /> : null}
              <span aria-hidden="true" className="hjm-calendar__day-label">{Number(cell.date.slice(-2))}</span>
              {renderCellContent ? <span aria-hidden="true" className="hjm-calendar__content">{renderCellContent(cell)}</span> : null}
            </button>;
            })())}
        </div>)}
      </div>
    </div>
    {fold ? <button type="button" className="hjm-calendar__fold" aria-label={fold.label} aria-expanded={fold.expanded} aria-controls={gridId}
      onClick={() => fold.onExpandedChange(!fold.expanded)}><Icon name={fold.expanded ? recipe.fold.handle.icon.collapse : recipe.fold.handle.icon.expand} size={recipe.fold.handle.glyph} tone="secondary" decorative /></button> : null}
  </div>;
}

export type CalendarFoldHeaderProps = Readonly<{
  monthLabel: string;
  expanded: boolean;
  selectedDate: string;
  focusedMonth: string;
  labels: Readonly<{ previousWeek: string; nextWeek: string; previousMonth: string; nextMonth: string }>;
  onSelectedDateChange(date: string): void;
  onFocusedMonthChange(month: string): void;
  className?: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** ‹ month › for a folding Calendar placed in a host header; a week per step folded, a month unfolded (same as Native). */
export function CalendarFoldHeader({ monthLabel, expanded, selectedDate, focusedMonth, labels, onSelectedDateChange, onFocusedMonthChange, className, layoutStyle }: CalendarFoldHeaderProps) {
  const step = (direction: -1 | 1) => {
    const next = calendarFoldStep({ expanded, selectedDate, focusedMonth }, direction);
    if ("selectedDate" in next) onSelectedDateChange(next.selectedDate); else onFocusedMonthChange(next.focusedMonth);
  };
  return <div className={classNames("hjm-calendar__header hjm-calendar-fold-header", className)} style={layoutStyle}>
    <button type="button" aria-label={expanded ? labels.previousMonth : labels.previousWeek} onClick={() => step(-1)}><Icon name={recipe.header.navIcon.previous} size={recipe.sizes.medium.glyph} tone="secondary" decorative /></button>
    <strong aria-live="polite" aria-atomic="true">{monthLabel}</strong>
    <button type="button" aria-label={expanded ? labels.nextMonth : labels.nextWeek} onClick={() => step(1)}><Icon name={recipe.header.navIcon.next} size={recipe.sizes.medium.glyph} tone="secondary" decorative /></button>
  </div>;
}
