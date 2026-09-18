import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { calendarRecipe as recipe, assertIsoCalendarMonth, validateCalendarDescriptor, resolveCalendarGridDescriptor, getCalendarNavigationIntent, getCalendarNavigationTarget, } from "@hjmds/design-contracts/components/calendar";
import { classNames, useControllableState } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
/** Inline single-date grid shared with DatePicker; month data remains product-owned. */
export function Calendar({ descriptor, composeAccessibleName, previousMonth, nextMonth, onNavigateBeyondGrid, renderCellContent, size = "medium", autoFocus = false, className, ref }) {
    validateCalendarDescriptor(descriptor);
    for (const action of [previousMonth, nextMonth]) {
        if (!action)
            continue;
        assertIsoCalendarMonth(action.month, "month action");
        if (!action.label.trim())
            throw new TypeError("Calendar month action label must not be empty");
    }
    const theme = useOptionalHjmTheme();
    const [selected, setSelected] = useControllableState({
        ...(descriptor.selectedDate === undefined ? {} : { value: descriptor.selectedDate }),
        defaultValue: descriptor.defaultSelectedDate ?? null,
        ...(descriptor.onSelectionChange ? { onChange: descriptor.onSelectionChange } : {}),
    });
    const cells = resolveCalendarGridDescriptor(descriptor.grid, selected, { composeAccessibleName });
    const dates = cells.filter((cell) => !("filler" in cell));
    const initial = dates.find((cell) => cell.isSelected) ?? dates.find((cell) => cell.isToday) ?? dates[0];
    const [focused, setFocused] = useState(initial?.date);
    const active = dates.some((cell) => cell.date === focused) ? focused : initial?.date;
    const root = useRef(null);
    const pending = useRef(undefined);
    const [request, setRequest] = useState(0);
    const focusDate = (date) => { pending.current = date; setFocused(date); setRequest((value) => value + 1); };
    useImperativeHandle(ref, () => ({ focusDate }), []);
    const gridKey = dates.map((cell) => cell.date).join(",");
    const mountedFocus = useRef(false);
    useEffect(() => {
        if (autoFocus && !mountedFocus.current && active)
            pending.current = active;
        mountedFocus.current = true;
        const date = pending.current;
        if (!date)
            return;
        // A requested adjacent date may arrive in a later render; retain it until that page exists.
        const button = Array.from(root.current?.querySelectorAll("[data-date]") ?? []).find((node) => node.dataset.date === date);
        if (button) {
            button.focus();
            setFocused(date);
            pending.current = undefined;
        }
    }, [gridKey, request, autoFocus, active]);
    const titleId = `hjm-calendar-${useId()}`;
    return _jsxs("div", { ref: root, className: classNames("hjm-calendar", className), "data-size": size, style: { "--hjm-calendar-cell-size": `${recipe.sizes[size].cellDiameter}px`,
            "--hjm-calendar-disabled-opacity": recipe.day.disabledOpacity,
            "--hjm-calendar-outside-opacity": recipe.day.outsideFocusedMonthOpacity }, children: [_jsxs("div", { className: "hjm-calendar__header", children: [previousMonth ? _jsx("button", { type: "button", "aria-label": previousMonth.label, disabled: !descriptor.onFocusedMonthChange, onClick: () => descriptor.onFocusedMonthChange?.(previousMonth.month, "previous"), children: _jsx("span", { "aria-hidden": "true", children: theme?.environment.direction === "rtl" ? "›" : "‹" }) }) : _jsx("span", {}), _jsx("strong", { id: titleId, "aria-live": "polite", "aria-atomic": "true", children: descriptor.monthLabel }), nextMonth ? _jsx("button", { type: "button", "aria-label": nextMonth.label, disabled: !descriptor.onFocusedMonthChange, onClick: () => descriptor.onFocusedMonthChange?.(nextMonth.month, "next"), children: _jsx("span", { "aria-hidden": "true", children: theme?.environment.direction === "rtl" ? "‹" : "›" }) }) : _jsx("span", {})] }), _jsx("div", { className: "hjm-calendar__viewport", children: _jsxs("div", { role: "grid", "aria-labelledby": titleId, className: "hjm-calendar__grid", children: [_jsx("div", { role: "row", className: "hjm-calendar__week", children: descriptor.grid.weekdayLabels.map((label, index) => _jsx("span", { role: "columnheader", className: "hjm-calendar__weekday", children: label }, index)) }), Array.from({ length: cells.length / 7 }, (_, row) => _jsx("div", { role: "row", className: "hjm-calendar__week", children: cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell
                                ? _jsx("span", { role: "gridcell", "aria-hidden": "true" }, `filler-${column}`)
                                : _jsxs("button", { type: "button", role: "gridcell", className: "hjm-calendar__day", "data-date": cell.date, "data-focus-date": cell.date === active || undefined, "data-today": cell.isToday || undefined, "data-selected": cell.isSelected || undefined, "data-disabled": !cell.selectable || undefined, "data-outside": cell.outsideFocusedMonth || undefined, "aria-label": cell.accessibleName, "aria-selected": cell.isSelected, "aria-disabled": !cell.selectable || undefined, "aria-current": cell.isToday ? "date" : undefined, tabIndex: cell.date === active ? 0 : -1, onFocus: () => setFocused(cell.date), onClick: () => { if (cell.selectable)
                                        setSelected(cell.date); }, onKeyDown: (event) => {
                                        if (event.altKey || event.ctrlKey || event.metaKey)
                                            return;
                                        const intent = getCalendarNavigationIntent(event.key, theme?.environment.direction ?? "ltr");
                                        if (!intent)
                                            return;
                                        event.preventDefault();
                                        const target = getCalendarNavigationTarget(descriptor.grid, cell.date, intent);
                                        if (target.date)
                                            focusDate(target.date);
                                        else if (target.overflow)
                                            onNavigateBeyondGrid?.({ date: cell.date, intent, overflow: target.overflow }, focusDate);
                                    }, children: [_jsx("span", { "aria-hidden": "true", className: "hjm-calendar__day-label", children: Number(cell.date.slice(-2)) }), renderCellContent ? _jsx("span", { "aria-hidden": "true", className: "hjm-calendar__content", children: renderCellContent(cell) }) : null] }, cell.date)) }, row))] }) })] });
}
//# sourceMappingURL=calendar.js.map