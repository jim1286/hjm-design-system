import { jsx as _jsx } from "react/jsx-runtime";
import { emptyDateRange, isCompleteDateRange, resolveDateRangeCellState, resolveDateRangeSelection, validateDateRange, } from "@hjmds/design-contracts/components/date-range";
import { useState } from "react";
import { Calendar } from "./calendar.js";
import { classNames, useControllableState } from "./internal.js";
export function DateRangePicker({ descriptor, composeAccessibleName, value: controlledValue, defaultValue, onValueChange, previousMonth, nextMonth, rangeLabels, renderCellContent, className, }) {
    const [value, setValue] = useControllableState({
        ...(controlledValue === undefined ? {} : { value: controlledValue }),
        defaultValue: defaultValue ?? emptyDateRange,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    validateDateRange(value);
    // The hovered date previews the not-yet-committed end through the same cell
    // state function the committed range uses.
    const [hovered, setHovered] = useState(null);
    return (_jsx("div", { className: classNames("hjm-date-range", className), "data-selecting": value.start !== null && value.end === null ? "" : undefined, "data-complete": isCompleteDateRange(value) || undefined, onMouseLeave: () => setHovered(null), children: _jsx(Calendar, { descriptor: {
                ...descriptor,
                // Calendar keeps single selection: the range's own edges are painted
                // through cell content and data attributes, not by lying to it.
                selectedDate: value.end ?? value.start,
                onSelectionChange: (date) => { if (date !== null)
                    setValue(resolveDateRangeSelection(value, date)); },
            }, composeAccessibleName: (info) => {
                const state = resolveDateRangeCellState(value, info.date, hovered);
                const base = composeAccessibleName(info);
                return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
            }, ...(previousMonth === undefined ? {} : { previousMonth }), ...(nextMonth === undefined ? {} : { nextMonth }), renderCellContent: (cell) => (_jsx("span", { className: "hjm-date-range__cell", "data-range": resolveDateRangeCellState(value, cell.date, hovered), onMouseEnter: () => setHovered(cell.date), children: renderCellContent?.(cell.date) ?? null })) }) }));
}
//# sourceMappingURL=date-range.js.map