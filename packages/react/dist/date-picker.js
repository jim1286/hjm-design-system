import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getCalendarNavigationIntent, getCalendarNavigationTarget, } from "@hjmds/design-contracts/components/calendar";
import { resolveDatePickerGrid, resolveDatePickerTriggerText, validateDatePickerDescriptor, } from "@hjmds/design-contracts/components/date-picker";
import { useEffect, useId, useRef, useState, } from "react";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
/** Single-date field with an anchored, focus-bearing calendar dialog. */
export function DatePicker({ descriptor, monthLabel, composeAccessibleName, previousMonth, nextMonth, clearLabel, closeLabel, size = "medium", description, error, renderCellContent, className, }) {
    validateDatePickerDescriptor(descriptor);
    const theme = useOptionalHjmTheme();
    const generatedId = useId().replaceAll(":", "");
    const dialogId = `hjm-date-picker-${generatedId}`;
    const triggerRef = useRef(null);
    const dialogRef = useRef(null);
    const controlledOpen = descriptor.open !== undefined;
    const [internalOpen, setInternalOpen] = useState(descriptor.defaultOpen ?? false);
    const open = controlledOpen ? descriptor.open === true : internalOpen;
    const controlledSelection = descriptor.selectedDate !== undefined;
    const [internalSelection, setInternalSelection] = useState(descriptor.defaultSelectedDate ?? null);
    const selectedDate = controlledSelection ? descriptor.selectedDate ?? null : internalSelection;
    const gridDescriptor = { ...descriptor, selectedDate };
    const cells = resolveDatePickerGrid(gridDescriptor, { composeAccessibleName });
    const firstDate = cells.find((cell) => !("filler" in cell));
    const [focusedDate, setFocusedDate] = useState(selectedDate ?? firstDate?.date ?? "");
    const requestOpen = (next, reason) => {
        if (!controlledOpen)
            setInternalOpen(next);
        descriptor.onOpenChange?.(next, reason);
    };
    const commit = (date, reason) => {
        if (!controlledSelection)
            setInternalSelection(date);
        descriptor.onSelectionChange?.(date, reason);
        requestOpen(false, reason === "activate" ? "selection" : "clear");
    };
    const wasOpenRef = useRef(open);
    useEffect(() => {
        const wasOpen = wasOpenRef.current;
        wasOpenRef.current = open;
        if (!open) {
            if (wasOpen)
                triggerRef.current?.focus();
            return;
        }
        setFocusedDate(selectedDate ?? firstDate?.date ?? "");
        const frame = requestAnimationFrame(() => {
            dialogRef.current?.querySelector("[data-focus-date='true']")?.focus();
        });
        const outside = (event) => {
            const target = event.target;
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
    const handleGridKey = (event, date) => {
        if (event.key === "Escape") {
            event.preventDefault();
            requestOpen(false, "escape");
            return;
        }
        const intent = getCalendarNavigationIntent(event.key, theme?.environment.direction ?? "ltr");
        if (!intent)
            return;
        event.preventDefault();
        const target = getCalendarNavigationTarget(descriptor.grid, date, intent);
        if ("date" in target && target.date) {
            setFocusedDate(target.date);
            queueMicrotask(() => dialogRef.current?.querySelector(`[data-date='${target.date}']`)?.focus());
        }
    };
    const label = descriptor.label ?? descriptor.accessibilityLabel;
    const triggerText = resolveDatePickerTriggerText(descriptor);
    return (_jsxs("div", { className: classNames("hjm-date-picker", className), "data-invalid": descriptor.invalid || error !== undefined || undefined, "data-size": size, children: [descriptor.label === undefined ? null : _jsx("span", { className: "hjm-date-picker__label", children: descriptor.label }), _jsxs("div", { className: "hjm-date-picker__anchor", children: [_jsxs("button", { "aria-controls": open ? dialogId : undefined, "aria-expanded": open, "aria-haspopup": "dialog", "aria-label": descriptor.accessibilityLabel, className: "hjm-date-picker__trigger", disabled: descriptor.disabled, onClick: () => !descriptor.readOnly && requestOpen(!open, "trigger"), ref: triggerRef, type: "button", children: [_jsx("span", { "aria-hidden": "true", children: "\u25A3" }), _jsx("span", { "data-placeholder": descriptor.displayValue === null || undefined, children: triggerText })] }), selectedDate === null ? null : (_jsx("button", { "aria-label": clearLabel, className: "hjm-date-picker__clear", disabled: descriptor.disabled || descriptor.readOnly, onClick: () => commit(null, "clear"), type: "button", children: "\u00D7" })), open ? (_jsxs("div", { "aria-label": label, className: "hjm-date-picker__popover", id: dialogId, ref: dialogRef, role: "dialog", children: [_jsxs("header", { className: "hjm-date-picker__calendar-header", children: [previousMonth ? _jsx("button", { "aria-label": previousMonth.label, onClick: () => descriptor.onFocusedMonthChange?.(previousMonth.month, "previous"), type: "button", children: "\u2039" }) : _jsx("span", { "aria-hidden": "true" }), _jsx("strong", { children: monthLabel }), nextMonth ? _jsx("button", { "aria-label": nextMonth.label, onClick: () => descriptor.onFocusedMonthChange?.(nextMonth.month, "next"), type: "button", children: "\u203A" }) : _jsx("span", { "aria-hidden": "true" }), _jsx("button", { "aria-label": closeLabel, onClick: () => requestOpen(false, "trigger"), type: "button", children: "\u00D7" })] }), _jsx("div", { className: "hjm-date-picker__weekdays", "aria-hidden": "true", children: descriptor.grid.weekdayLabels.map((weekday, index) => _jsx("span", { children: weekday }, `${weekday}-${index}`)) }), _jsx("div", { "aria-label": monthLabel, className: "hjm-date-picker__grid", role: "grid", children: Array.from({ length: cells.length / 7 }, (_, row) => (_jsx("div", { className: "hjm-date-picker__week", role: "row", children: cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell ? (_jsx("span", { "aria-hidden": "true", className: "hjm-date-picker__day", role: "gridcell" }, `filler-${row}-${column}`)) : (_jsxs("button", { "aria-label": cell.accessibleName, "aria-selected": cell.isSelected, className: "hjm-date-picker__day", "data-date": cell.date, "data-disabled": !cell.selectable || undefined, "data-focus-date": cell.date === focusedDate || undefined, "data-outside": cell.outsideFocusedMonth || undefined, "data-selected": cell.isSelected || undefined, "data-today": cell.isToday || undefined, onClick: () => cell.selectable && commit(cell.date, "activate"), onKeyDown: (event) => handleGridKey(event, cell.date), role: "gridcell", tabIndex: cell.date === focusedDate ? 0 : -1, type: "button", children: [_jsx("span", { children: Number(cell.date.slice(-2)) }), renderCellContent?.(cell)] }, cell.date))) }, row))) })] })) : null] }), description === undefined ? null : _jsx("span", { className: "hjm-date-picker__description", children: description }), error === undefined ? null : _jsx("span", { className: "hjm-date-picker__error", role: "alert", children: error })] }));
}
//# sourceMappingURL=date-picker.js.map