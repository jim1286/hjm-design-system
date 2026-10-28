"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { dateRangeRecipe, emptyDateRange, defaultDateRangeLimit, isDateWithinRangeLimit, isCompleteDateRange, resolveDateRangeActiveEdge, resolveDateRangeCellPaint, resolveDateRangeCellState, resolveDateRangeExpandedAfterSelection, resolveDateRangePreset, resolveDateRangeSelection, validateDateRange, } from "@hjmds/design-contracts/components/date-range";
import { useState } from "react";
import { Icon } from "./supplemental-display.js";
import { Calendar } from "./calendar.js";
import { classNames, useControllableState } from "./internal.js";
import { CalendarPaintContext } from "./internal/calendar-paint.js";
import { Chip } from "./selection.js";
export function DateRangePicker({ descriptor, composeAccessibleName, value: controlledValue, defaultValue, onValueChange, previousMonth, nextMonth, rangeLabels, maxRange = defaultDateRangeLimit, renderCellContent, summary, presets, collapsible, className, layoutStyle, }) {
    if (collapsible && !summary)
        throw new TypeError("DateRangePicker collapsible needs summary to act as its toggle");
    const [value, setValue] = useControllableState({
        ...(controlledValue === undefined ? {} : { value: controlledValue }),
        defaultValue: defaultValue ?? emptyDateRange,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    validateDateRange(value, maxRange);
    const [expanded, setExpanded] = useControllableState({
        ...(collapsible?.expanded === undefined ? {} : { value: collapsible.expanded }),
        defaultValue: collapsible?.defaultExpanded ?? false,
        ...(collapsible?.onExpandedChange === undefined ? {} : { onChange: collapsible.onExpandedChange }),
    });
    const open = collapsible === undefined || expanded;
    const select = (next, source) => {
        setValue(next);
        if (collapsible && !resolveDateRangeExpandedAfterSelection(next, source))
            setExpanded(false);
    };
    // The hovered date previews the not-yet-committed end through the same cell
    // state function the committed range uses.
    const [pointer, setPointer] = useState(null);
    const hovered = pointer !== null && isDateWithinRangeLimit(value, pointer, maxRange) ? pointer : null;
    const activeEdge = resolveDateRangeActiveEdge(value);
    // A button may only hold phrasing content, so the fields become spans when the summary is the toggle.
    const Field = collapsible ? "span" : "div";
    const field = (edge) => {
        const date = value[edge];
        return (_jsxs(Field, { className: "hjm-date-range__field", "data-active": activeEdge === edge || undefined, "data-empty": date === null || undefined, children: [_jsx("span", { className: "hjm-date-range__field-label", children: edge === "start" ? summary.startLabel : summary.endLabel }), _jsx("span", { className: "hjm-date-range__field-value", children: date === null ? summary.placeholder : summary.formatDate(date) })] }, edge));
    };
    return (_jsxs("div", { style: layoutStyle, className: classNames("hjm-date-range", className), "data-selecting": value.start !== null && value.end === null ? "" : undefined, "data-complete": isCompleteDateRange(value) || undefined, "data-expanded": collapsible ? String(open) : undefined, onMouseLeave: () => setPointer(null), children: [summary && collapsible ? (_jsxs("button", { type: "button", className: "hjm-date-range__summary", "data-toggle": "", "aria-expanded": open, onClick: () => setExpanded(!open), children: [field("start"), field("end"), _jsx(Icon, { name: open ? dateRangeRecipe.toggle.icon.expanded : dateRangeRecipe.toggle.icon.collapsed, size: dateRangeRecipe.toggle.glyph, tone: "secondary", decorative: true })] })) : summary ? _jsxs("div", { className: "hjm-date-range__summary", children: [field("start"), field("end")] }) : null, presets?.length ? (_jsx("div", { className: "hjm-date-range__presets", children: presets.map((preset) => {
                    const range = resolveDateRangePreset(descriptor.grid.todayDate, preset.length);
                    return (_jsx(Chip, { label: preset.label, size: dateRangeRecipe.presets.chipSize, selectionMode: "single", selected: range.start === value.start && range.end === value.end, onSelectedChange: () => {
                            validateDateRange(range, maxRange);
                            select(range, "preset");
                            // A preset ends today; bring its end month into view like a jump, so the band is visible.
                            // The `all` preset is the empty range and has no month to show.
                            const month = range.end?.slice(0, 7);
                            if (month !== undefined && descriptor.focusedMonth !== month)
                                descriptor.onFocusedMonthChange?.(month, "jump");
                        } }, preset.id));
                }) })) : null, open ? _jsx(CalendarPaintContext.Provider, { value: { paint: (date) => resolveDateRangeCellPaint(value, date, hovered), onDayHover: setPointer }, children: _jsx(Calendar, { descriptor: {
                        ...descriptor,
                        // The range owns eligibility; Calendar keeps the same disabled-day interaction contract.
                        grid: { ...descriptor.grid, cells: descriptor.grid.cells.map(cell => cell.date === undefined ? cell :
                                { ...cell, disabled: cell.disabled === true || !isDateWithinRangeLimit(value, cell.date, maxRange) }) },
                        // Calendar keeps single selection; the two edges and the band are painted through the internal
                        // paint context, and each day's name carries the range position for assistive tech.
                        selectedDate: value.end ?? value.start,
                        onSelectionChange: (date) => { if (date !== null)
                            select(resolveDateRangeSelection(value, date, maxRange), "date"); },
                    }, composeAccessibleName: (info) => {
                        const state = resolveDateRangeCellState(value, info.date, hovered);
                        const base = composeAccessibleName(info);
                        return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
                    }, ...(previousMonth === undefined ? {} : { previousMonth }), ...(nextMonth === undefined ? {} : { nextMonth }), ...(renderCellContent === undefined ? {} : { renderCellContent: (cell) => renderCellContent(cell.date) }) }) }) : null] }));
}
//# sourceMappingURL=date-range.js.map