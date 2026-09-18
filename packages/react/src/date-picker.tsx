import {
  type ComposeCalendarAccessibleName,
  type ResolvedCalendarDateCell,
} from "@hjmds/design-contracts/components/calendar";
import {
  resolveDatePickerTriggerText,
  validateDatePickerDescriptor,
  type DatePickerDescriptor,
  type DatePickerOpenChangeReason,
  type DatePickerSize,
} from "@hjmds/design-contracts/components/date-picker";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Calendar, type CalendarOverflow, type CalendarHandle } from "./calendar.js";
import { classNames } from "./internal.js";

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
  onNavigateBeyondGrid?: (detail: CalendarOverflow, focusDate: CalendarHandle["focusDate"]) => void;
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
  onNavigateBeyondGrid,
  className,
}: DatePickerProps<Content>) {
  validateDatePickerDescriptor(descriptor);
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

  const requestOpen = (next: boolean, reason: DatePickerOpenChangeReason) => {
    if (!controlledOpen) setInternalOpen(next);
    descriptor.onOpenChange?.(next, reason);
  };
  const commit = (date: string | null, reason: "activate" | "clear") => {
    // A controlled open field can become read-only while its grid remains mounted.
    if (descriptor.disabled || descriptor.readOnly) return;
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
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!dialogRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        requestOpen(false, "outside");
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  // The outer field owns selection; the shared grid receives only its resolved controlled value.
  const { defaultSelectedDate: _defaultSelectedDate, ...calendarDescriptor } = descriptor;
  const calendarGrid = descriptor.disabled || descriptor.readOnly
    ? { ...descriptor.grid, cells: descriptor.grid.cells.map((cell) => cell.date ? { ...cell, disabled: true } : cell) }
    : descriptor.grid;
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
          <div aria-label={label} className="hjm-date-picker__popover" id={dialogId} ref={dialogRef} role="dialog" onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); requestOpen(false, "escape"); } }}>
            <button aria-label={closeLabel} className="hjm-date-picker__calendar-close" onClick={() => requestOpen(false, "trigger")} type="button">×</button>
            <Calendar descriptor={{ ...calendarDescriptor, grid: calendarGrid, monthLabel, selectedDate, onSelectionChange: (date) => commit(date, "activate") }}
              composeAccessibleName={composeAccessibleName} size={size} autoFocus
              {...(previousMonth ? { previousMonth } : {})} {...(nextMonth ? { nextMonth } : {})}
              {...(renderCellContent ? { renderCellContent } : {})} {...(onNavigateBeyondGrid ? { onNavigateBeyondGrid } : {})} />
          </div>
        ) : null}
      </div>
      {description === undefined ? null : <span className="hjm-date-picker__description">{description}</span>}
      {error === undefined ? null : <span className="hjm-date-picker__error" role="alert">{error}</span>}
    </div>
  );
}
