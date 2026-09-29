import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from "@hjmds/design-contracts/components/calendar";
import { resolveDatePickerTriggerText, validateDatePickerDescriptor, } from "@hjmds/design-contracts/components/date-picker";
import { useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
import { Calendar } from "./calendar.js";
import { classNames } from "./internal.js";
const popoverViewportInset = 16;
/** Single-date field with an anchored, focus-bearing calendar dialog. */
export function DatePicker({ descriptor, monthLabel, composeAccessibleName, previousMonth, nextMonth, clearLabel, closeLabel, size = "medium", description, error, renderCellContent, onNavigateBeyondGrid, className, }) {
    validateDatePickerDescriptor(descriptor);
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
    const requestOpen = (next, reason) => {
        if (!controlledOpen)
            setInternalOpen(next);
        descriptor.onOpenChange?.(next, reason);
    };
    const commit = (date, reason) => {
        // A controlled open field can become read-only while its grid remains mounted.
        if (descriptor.disabled || descriptor.readOnly)
            return;
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
        const outside = (event) => {
            const target = event.target;
            if (!dialogRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
                requestOpen(false, "outside");
            }
        };
        document.addEventListener("pointerdown", outside);
        return () => {
            document.removeEventListener("pointerdown", outside);
        };
    }, [open]);
    // Keep the popover inside the viewport (2026-09-30 audit WR-0930-3): shift inline, flip up
    // when short. Not portaled: Calendar autoFocus runs before a portal popup is measured.
    useLayoutEffect(() => {
        const popover = dialogRef.current;
        if (!open || !popover)
            return;
        const place = () => {
            const viewport = window.visualViewport;
            const left = (viewport?.offsetLeft ?? 0) + popoverViewportInset;
            const right = (viewport?.offsetLeft ?? 0) + (viewport?.width ?? document.documentElement.clientWidth) - popoverViewportInset;
            // Layout offset, not translate: mobile Chromium widened the page for a translated box.
            popover.style.insetInlineStart = "";
            popover.style.maxInlineSize = `${Math.max(0, right - left)}px`;
            const rect = popover.getBoundingClientRect();
            let shift = rect.right > right ? Math.floor(right - rect.right) : 0;
            if (rect.left + shift < left)
                shift = Math.ceil(left - rect.left);
            const logical = getComputedStyle(popover).direction === "rtl" ? -shift : shift;
            popover.style.insetInlineStart = shift === 0 ? "" : `${logical}px`;
            popover.style.insetBlockStart = "";
            popover.style.insetBlockEnd = "";
            const box = popover.getBoundingClientRect();
            const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) - popoverViewportInset;
            const anchor = popover.parentElement?.getBoundingClientRect();
            if (anchor && box.bottom > bottom && anchor.top - box.height - popoverViewportInset >= (viewport?.offsetTop ?? 0)) {
                popover.style.insetBlockStart = "auto";
                popover.style.insetBlockEnd = "calc(100% + var(--hjm-space-xs))";
            }
        };
        place();
        window.addEventListener("resize", place);
        window.visualViewport?.addEventListener("resize", place);
        return () => {
            window.removeEventListener("resize", place);
            window.visualViewport?.removeEventListener("resize", place);
        };
    }, [open]);
    // The outer field owns selection; the shared grid receives only its resolved controlled value.
    const { defaultSelectedDate: _defaultSelectedDate, ...calendarDescriptor } = descriptor;
    const calendarGrid = descriptor.disabled || descriptor.readOnly
        ? { ...descriptor.grid, cells: descriptor.grid.cells.map((cell) => cell.date ? { ...cell, disabled: true } : cell) }
        : descriptor.grid;
    const label = descriptor.label ?? descriptor.accessibilityLabel;
    const triggerText = resolveDatePickerTriggerText(descriptor);
    return (_jsxs("div", { className: classNames("hjm-date-picker", className), "data-invalid": descriptor.invalid || error !== undefined || undefined, "data-size": size, children: [descriptor.label === undefined ? null : _jsx("span", { className: "hjm-date-picker__label", children: descriptor.label }), _jsxs("div", { className: "hjm-date-picker__anchor", children: [_jsxs("button", { "aria-controls": open ? dialogId : undefined, "aria-expanded": open, "aria-haspopup": "dialog", "aria-label": descriptor.accessibilityLabel, className: "hjm-date-picker__trigger", disabled: descriptor.disabled, onClick: () => !descriptor.readOnly && requestOpen(!open, "trigger"), ref: triggerRef, type: "button", children: [_jsx("span", { "aria-hidden": "true", children: "\u25A3" }), _jsx("span", { "data-placeholder": descriptor.displayValue === null || undefined, children: triggerText })] }), selectedDate === null ? null : (_jsx("button", { "aria-label": clearLabel, className: "hjm-date-picker__clear", disabled: descriptor.disabled || descriptor.readOnly, onClick: () => commit(null, "clear"), type: "button", children: "\u00D7" })), open ? (_jsxs("div", { "aria-label": label, className: "hjm-date-picker__popover", id: dialogId, ref: dialogRef, role: "dialog", onKeyDown: (event) => { if (event.key === "Escape") {
                            event.preventDefault();
                            requestOpen(false, "escape");
                        } }, children: [_jsx("button", { "aria-label": closeLabel, className: "hjm-date-picker__calendar-close", onClick: () => requestOpen(false, "trigger"), type: "button", children: "\u00D7" }), _jsx(Calendar, { descriptor: { ...calendarDescriptor, grid: calendarGrid, monthLabel, selectedDate, onSelectionChange: (date) => commit(date, "activate") }, composeAccessibleName: composeAccessibleName, size: size, autoFocus: true, ...(previousMonth ? { previousMonth } : {}), ...(nextMonth ? { nextMonth } : {}), ...(renderCellContent ? { renderCellContent } : {}), ...(onNavigateBeyondGrid ? { onNavigateBeyondGrid } : {}) })] })) : null] }), description === undefined ? null : _jsx("span", { className: "hjm-date-picker__description", children: description }), error === undefined ? null : _jsx("span", { className: "hjm-date-picker__error", role: "alert", children: error })] }));
}
//# sourceMappingURL=date-picker.js.map