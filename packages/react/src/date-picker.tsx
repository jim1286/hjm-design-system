import {
  getCalendarNavigationIntent,
  getCalendarNavigationTarget,
  type ComposeCalendarAccessibleName,
  type ResolvedCalendarDateCell,
} from "@hjm/design-contracts/components/calendar";
import {
  resolveDatePickerGrid,
  resolveDatePickerTriggerText,
  validateDatePickerDescriptor,
  type DatePickerDescriptor,
  type DatePickerOpenChangeReason,
  type DatePickerSize,
} from "@hjm/design-contracts/components/date-picker";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

export type DatePickerMonthAction = Readonly<{ month: string; label: string }>;

export type DatePickerProps<Content = unknown> = Readonly<{
  descriptor: DatePickerDescriptor<Content>;
  monthLabel: string;
  composeAccessibleName: ComposeCalendarAccessibleName<Content>;
  previousMonth?: DatePickerMonthAction;
  nextMonth?: DatePickerMonthAction;
  clearLabel: string;
  closeLabel: string;
  size?: DatePickerSize;
  description?: ReactNode;
  error?: ReactNode;
  renderCellContent?: (cell: ResolvedCalendarDateCell<Content>) => ReactNode;
  className?: string;
}>;

/** Single-date field with an anchored, focus-bearing calendar dialog. */
export function DatePicker<Content>({
  descriptor,
  monthLabel,
  composeAccessibleName,
  previousMonth,
  nextMonth,
  clearLabel,
  closeLabel,
  size = "medium",
  description,
  error,
  renderCellContent,
  className,
}: DatePickerProps<Content>) {
  validateDatePickerDescriptor(descriptor);
  const theme = useOptionalHjmTheme();
  const generatedId = useId().replaceAll(":", "");
  const dialogId = `hjm-date-picker-${generatedId}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const controlledOpen = descriptor.open !== undefined;
  const [internalOpen, setInternalOpen] = useState(descriptor.defaultOpen ?? false);
  const open = controlledOpen ? descriptor.open === true : internalOpen;
  const controlledSelection = descriptor.selectedDate !== undefined;
  const [internalSelection, setInternalSelection] = useState(
    descriptor.defaultSelectedDate ?? null,
  );
  const selectedDate = controlledSelection ? descriptor.selectedDate ?? null : internalSelection;
  const gridDescriptor = { ...descriptor, selectedDate } as DatePickerDescriptor<Content>;
  const cells = resolveDatePickerGrid(gridDescriptor, { composeAccessibleName });
  const firstDate = cells.find((cell): cell is ResolvedCalendarDateCell<Content> => !("filler" in cell));
  const [focusedDate, setFocusedDate] = useState(selectedDate ?? firstDate?.date ?? "");

  const requestOpen = (next: boolean, reason: DatePickerOpenChangeReason) => {
    if (!controlledOpen) setInternalOpen(next);
    descriptor.onOpenChange?.(next, reason);
  };
  const commit = (date: string | null, reason: "activate" | "clear") => {
    if (!controlledSelection) setInternalSelection(date);
    descriptor.onSelectionChange?.(date, reason);
    requestOpen(false, reason === "activate" ? "selection" : "clear");
  };

  const wasOpenRef = useRef(open);
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!open) {
      if (wasOpen) triggerRef.current?.focus();
      return;
    }
    setFocusedDate(selectedDate ?? firstDate?.date ?? "");
    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("[data-focus-date='true']")?.focus();
    });
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!dialogRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        requestOpen(false, "outside");
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  const handleGridKey = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestOpen(false, "escape");
      return;
    }
    const intent = getCalendarNavigationIntent(
      event.key as Parameters<typeof getCalendarNavigationIntent>[0],
      theme?.environment.direction ?? "ltr",
    );
    if (!intent) return;
    event.preventDefault();
    const target = getCalendarNavigationTarget(descriptor.grid, date, intent);
    if ("date" in target && target.date) {
      setFocusedDate(target.date);
      queueMicrotask(() => dialogRef.current?.querySelector<HTMLElement>(`[data-date='${target.date}']`)?.focus());
    }
  };

  const label = descriptor.label ?? descriptor.accessibilityLabel;
  const triggerText = resolveDatePickerTriggerText(descriptor);
  return (
    <div className={classNames("hjm-date-picker", className)} data-invalid={descriptor.invalid || error !== undefined || undefined} data-size={size}>
      {descriptor.label === undefined ? null : <span className="hjm-date-picker__label">{descriptor.label}</span>}
      <div className="hjm-date-picker__anchor">
        <button
          aria-controls={open ? dialogId : undefined}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={descriptor.accessibilityLabel}
          className="hjm-date-picker__trigger"
          disabled={descriptor.disabled}
          onClick={() => !descriptor.readOnly && requestOpen(!open, "trigger")}
          ref={triggerRef}
          type="button"
        >
          <span aria-hidden="true">▣</span>
          <span data-placeholder={descriptor.displayValue === null || undefined}>{triggerText}</span>
        </button>
        {selectedDate === null ? null : (
          <button aria-label={clearLabel} className="hjm-date-picker__clear" disabled={descriptor.disabled || descriptor.readOnly} onClick={() => commit(null, "clear")} type="button">×</button>
        )}
        {open ? (
          <div aria-label={label} className="hjm-date-picker__popover" id={dialogId} ref={dialogRef} role="dialog">
            <header className="hjm-date-picker__calendar-header">
              {previousMonth ? <button aria-label={previousMonth.label} onClick={() => descriptor.onFocusedMonthChange?.(previousMonth.month, "previous")} type="button">‹</button> : <span aria-hidden="true" />}
              <strong>{monthLabel}</strong>
              {nextMonth ? <button aria-label={nextMonth.label} onClick={() => descriptor.onFocusedMonthChange?.(nextMonth.month, "next")} type="button">›</button> : <span aria-hidden="true" />}
              <button aria-label={closeLabel} onClick={() => requestOpen(false, "trigger")} type="button">×</button>
            </header>
            <div className="hjm-date-picker__weekdays" aria-hidden="true">
              {descriptor.grid.weekdayLabels.map((weekday, index) => <span key={`${weekday}-${index}`}>{weekday}</span>)}
            </div>
            <div aria-label={monthLabel} className="hjm-date-picker__grid" role="grid">
              {Array.from({ length: cells.length / 7 }, (_, row) => (
                <div className="hjm-date-picker__week" key={row} role="row">
                  {cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell ? (
                    <span aria-hidden="true" className="hjm-date-picker__day" key={`filler-${row}-${column}`} role="gridcell" />
                  ) : (
                    <button
                      aria-label={cell.accessibleName}
                      aria-selected={cell.isSelected}
                      className="hjm-date-picker__day"
                      data-date={cell.date}
                      data-disabled={!cell.selectable || undefined}
                      data-focus-date={cell.date === focusedDate || undefined}
                      data-outside={cell.outsideFocusedMonth || undefined}
                      data-selected={cell.isSelected || undefined}
                      data-today={cell.isToday || undefined}
                      key={cell.date}
                      onClick={() => cell.selectable && commit(cell.date, "activate")}
                      onKeyDown={(event) => handleGridKey(event, cell.date)}
                      role="gridcell"
                      tabIndex={cell.date === focusedDate ? 0 : -1}
                      type="button"
                    >
                      <span>{Number(cell.date.slice(-2))}</span>
                      {renderCellContent?.(cell)}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {description === undefined ? null : <span className="hjm-date-picker__description">{description}</span>}
      {error === undefined ? null : <span className="hjm-date-picker__error" role="alert">{error}</span>}
    </div>
  );
}
