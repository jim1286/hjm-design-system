import { useEffect, useId, useImperativeHandle, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import {
  calendarRecipe as recipe, assertIsoCalendarMonth, validateCalendarDescriptor, resolveCalendarGridDescriptor,
  getCalendarNavigationIntent, getCalendarNavigationTarget,
  type CalendarDescriptor, type CalendarSize, type CalendarNavigationIntent,
  type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell,
} from "@hjmds/design-contracts/components/calendar";
import { classNames, useControllableState } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

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
  autoFocus?: boolean;
  className?: string;
  ref?: Ref<CalendarHandle>;
}>;

/** Inline single-date grid shared with DatePicker; month data remains product-owned. */
export function Calendar<Content>({ descriptor, composeAccessibleName, previousMonth, nextMonth,
  onNavigateBeyondGrid, renderCellContent, size = "medium", autoFocus = false, className, ref }: CalendarProps<Content>) {
  validateCalendarDescriptor(descriptor);
  for (const action of [previousMonth, nextMonth]) {
    if (!action) continue;
    assertIsoCalendarMonth(action.month, "month action");
    if (!action.label.trim()) throw new TypeError("Calendar month action label must not be empty");
  }
  const theme = useOptionalHjmTheme();
  const [selected, setSelected] = useControllableState<string | null>({
    ...(descriptor.selectedDate === undefined ? {} : { value: descriptor.selectedDate }),
    defaultValue: descriptor.defaultSelectedDate ?? null,
    ...(descriptor.onSelectionChange ? { onChange: descriptor.onSelectionChange } : {}),
  });
  const cells = resolveCalendarGridDescriptor(descriptor.grid, selected, { composeAccessibleName });
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
    style={{ "--hjm-calendar-cell-size": `${recipe.sizes[size].cellDiameter}px`,
      "--hjm-calendar-disabled-opacity": recipe.day.disabledOpacity,
      "--hjm-calendar-outside-opacity": recipe.day.outsideFocusedMonthOpacity } as CSSProperties}>
    <div className="hjm-calendar__header">
      {previousMonth ? <button type="button" aria-label={previousMonth.label} disabled={!descriptor.onFocusedMonthChange}
        onClick={() => descriptor.onFocusedMonthChange?.(previousMonth.month, "previous")}><span aria-hidden="true">{theme?.environment.direction === "rtl" ? "›" : "‹"}</span></button> : <span />}
      <strong id={titleId} aria-live="polite" aria-atomic="true">{descriptor.monthLabel}</strong>
      {nextMonth ? <button type="button" aria-label={nextMonth.label} disabled={!descriptor.onFocusedMonthChange}
        onClick={() => descriptor.onFocusedMonthChange?.(nextMonth.month, "next")}><span aria-hidden="true">{theme?.environment.direction === "rtl" ? "‹" : "›"}</span></button> : <span />}
    </div>
    <div className="hjm-calendar__viewport">
      <div role="grid" aria-labelledby={titleId} className="hjm-calendar__grid">
        <div role="row" className="hjm-calendar__week">
          {descriptor.grid.weekdayLabels.map((label, index) => <span role="columnheader" className="hjm-calendar__weekday" key={index}>{label}</span>)}
        </div>
        {Array.from({ length: cells.length / 7 }, (_, row) => <div role="row" className="hjm-calendar__week" key={row}>
          {cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell
            ? <span role="gridcell" aria-hidden="true" key={`filler-${column}`} />
            : <button type="button" role="gridcell" key={cell.date} className="hjm-calendar__day"
              data-date={cell.date} data-focus-date={cell.date === active || undefined}
              data-today={cell.isToday || undefined} data-selected={cell.isSelected || undefined}
              data-disabled={!cell.selectable || undefined} data-outside={cell.outsideFocusedMonth || undefined}
              aria-label={cell.accessibleName} aria-selected={cell.isSelected} aria-disabled={!cell.selectable || undefined}
              aria-current={cell.isToday ? "date" : undefined} tabIndex={cell.date === active ? 0 : -1}
              onFocus={() => setFocused(cell.date)} onClick={() => { if (cell.selectable) setSelected(cell.date); }}
              onKeyDown={(event) => {
                if (event.altKey || event.ctrlKey || event.metaKey) return;
                const intent = getCalendarNavigationIntent(event.key as Parameters<typeof getCalendarNavigationIntent>[0], theme?.environment.direction ?? "ltr");
                if (!intent) return;
                event.preventDefault();
                const target = getCalendarNavigationTarget(descriptor.grid, cell.date, intent);
                if (target.date) focusDate(target.date);
                else if (target.overflow) onNavigateBeyondGrid?.({ date: cell.date, intent, overflow: target.overflow }, focusDate);
              }}>
              <span aria-hidden="true" className="hjm-calendar__day-label">{Number(cell.date.slice(-2))}</span>
              {renderCellContent ? <span aria-hidden="true" className="hjm-calendar__content">{renderCellContent(cell)}</span> : null}
            </button>)}
        </div>)}
      </div>
    </div>
  </div>;
}
