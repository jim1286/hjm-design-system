"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { dateRangeRecipe, emptyDateRange, defaultDateRangeLimit, isDateWithinRangeLimit, isCompleteDateRange, resolveDateRangeActiveEdge, resolveDateRangeCellPaint, resolveDateRangeCellState, resolveDateRangePreset, resolveDateRangeSelection, validateDateRange, } from "@hjmds/design-contracts/components/date-range";
import { useState } from "react";
import { Calendar } from "./calendar.js";
import { classNames, useControllableState } from "./internal.js";
import { CalendarPaintContext } from "./internal/calendar-paint.js";
import { Chip } from "./selection.js";
export function DateRangePicker({ descriptor, composeAccessibleName, value: controlledValue, defaultValue, onValueChange, previousMonth, nextMonth, rangeLabels, maxRange = defaultDateRangeLimit, renderCellContent, summary, presets, className, layoutStyle, }) {
    const [value, setValue] = useControllableState({
        ...(controlledValue === undefined ? {} : { value: controlledValue }),
        defaultValue: defaultValue ?? emptyDateRange,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    validateDateRange(value, maxRange);
    // The hovered date previews the not-yet-committed end through the same cell
    // state function the committed range uses.
    const [pointer, setPointer] = useState(null);
    const hovered = pointer !== null && isDateWithinRangeLimit(value, pointer, maxRange) ? pointer : null;
    const activeEdge = resolveDateRangeActiveEdge(value);
    const field = (edge) => {
        const date = value[edge];
        return (_jsxs("div", { className: "hjm-date-range__field", "data-active": activeEdge === edge || undefined, "data-empty": date === null || undefined, children: [_jsx("span", { className: "hjm-date-range__field-label", children: edge === "start" ? summary.startLabel : summary.endLabel }), _jsx("span", { className: "hjm-date-range__field-value", children: date === null ? summary.placeholder : summary.formatDate(date) })] }, edge));
    };
    return (_jsxs("div", { style: layoutStyle, className: classNames("hjm-date-range", className), "data-selecting": value.start !== null && value.end === null ? "" : undefined, "data-complete": isCompleteDateRange(value) || undefined, onMouseLeave: () => setPointer(null), children: [summary ? _jsxs("div", { className: "hjm-date-range__summary", children: [field("start"), field("end")] }) : null, presets?.length ? (_jsx("div", { className: "hjm-date-range__presets", children: presets.map((preset) => {
                    const range = resolveDateRangePreset(descriptor.grid.todayDate, preset.length);
                    return (_jsx(Chip, { label: preset.label, size: dateRangeRecipe.presets.chipSize, selectionMode: "single", selected: range.start === value.start && range.end === value.end, onSelectedChange: () => {
                            validateDateRange(range, maxRange);
                            setValue(range);
                            // A preset ends today; bring its end month into view like a jump, so the band is visible.
                            const month = range.end.slice(0, 7);
                            if (descriptor.focusedMonth !== month)
                                descriptor.onFocusedMonthChange?.(month, "jump");
                        } }, preset.id));
                }) })) : null, _jsx(CalendarPaintContext.Provider, { value: { paint: (date) => resolveDateRangeCellPaint(value, date, hovered), onDayHover: setPointer }, children: _jsx(Calendar, { descriptor: {
                        ...descriptor,
                        // The range owns eligibility; Calendar keeps the same disabled-day interaction contract.
                        grid: { ...descriptor.grid, cells: descriptor.grid.cells.map(cell => cell.date === undefined ? cell :
                                { ...cell, disabled: cell.disabled === true || !isDateWithinRangeLimit(value, cell.date, maxRange) }) },
                        // Calendar keeps single selection; the two edges and the band are painted through the internal
                        // paint context, and each day's name carries the range position for assistive tech.
                        selectedDate: value.end ?? value.start,
                        onSelectionChange: (date) => { if (date !== null)
                            setValue(resolveDateRangeSelection(value, date, maxRange)); },
                    }, composeAccessibleName: (info) => {
                        const state = resolveDateRangeCellState(value, info.date, hovered);
                        const base = composeAccessibleName(info);
                        return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
                    }, ...(previousMonth === undefined ? {} : { previousMonth }), ...(nextMonth === undefined ? {} : { nextMonth }), ...(renderCellContent === undefined ? {} : { renderCellContent: (cell) => renderCellContent(cell.date) }) }) })] }));
}
//# sourceMappingURL=date-range.js.map