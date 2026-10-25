import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { dateRangeRecipe, emptyDateRange, defaultDateRangeLimit, isDateWithinRangeLimit, resolveDateRangeActiveEdge, resolveDateRangeCellPaint, resolveDateRangeCellState, resolveDateRangePreset, resolveDateRangeSelection, validateDateRange, } from "@hjmds/design-contracts/components/date-range";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { View } from "react-native";
import { Calendar } from "./calendar.js";
import { CalendarPaintContext } from "./internal/calendar-paint.js";
import { Chip } from "./inputs.js";
import { useControllableState } from "./internal/state.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function DateRangePicker({ descriptor, composeAccessibleName, value: controlledValue, defaultValue, onValueChange, previousMonth, nextMonth, rangeLabels, maxRange = defaultDateRangeLimit, renderCellContent, summary, presets, }) {
    const [value, setValue] = useControllableState({
        ...(controlledValue === undefined ? {} : { value: controlledValue }),
        defaultValue: defaultValue ?? emptyDateRange,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    validateDateRange(value, maxRange);
    const { palette, tokens } = useHjmNativeTheme();
    const color = (reference) => resolveColorReference(reference, palette);
    const activeEdge = resolveDateRangeActiveEdge(value);
    const field = (edge) => {
        const date = value[edge];
        const label = edge === "start" ? summary.startLabel : summary.endLabel;
        const text = date === null ? summary.placeholder : summary.formatDate(date);
        const recipe = dateRangeRecipe.summary;
        return (_jsxs(View, { accessible: true, accessibilityLabel: `${label}, ${text}`, style: { flex: 1, minWidth: 0, gap: recipe.field.gap, paddingVertical: recipe.field.paddingVertical,
                paddingHorizontal: recipe.field.paddingHorizontal, borderRadius: tokens.radius[recipe.field.radius],
                backgroundColor: color(recipe.field.background), borderWidth: recipe.field.activeBorderWidth,
                borderColor: activeEdge === edge ? color(recipe.field.activeBorder) : "transparent" }, children: [_jsx(Text, { accessible: false, variant: recipe.label.textVariant, style: { color: color(recipe.label.color) }, children: label }), _jsx(Text, { accessible: false, variant: recipe.value.textVariant, numberOfLines: 1, style: { color: color(date === null ? recipe.value.placeholderColor : recipe.value.color), fontVariant: ["tabular-nums"] }, children: text })] }, edge));
    };
    return (_jsxs(View, { style: { gap: dateRangeRecipe.gap }, children: [summary ? _jsxs(View, { style: { flexDirection: "row", gap: dateRangeRecipe.summary.gap }, children: [field("start"), field("end")] }) : null, presets?.length ? (_jsx(View, { style: { flexDirection: "row", flexWrap: "wrap", gap: dateRangeRecipe.presets.gap }, children: presets.map((preset) => {
                    const range = resolveDateRangePreset(descriptor.grid.todayDate, preset.length);
                    return (_jsx(Chip, { label: preset.label, size: dateRangeRecipe.presets.chipSize, selectionMode: "single", selected: range.start === value.start && range.end === value.end, onPress: () => {
                            validateDateRange(range, maxRange);
                            setValue(range);
                            // A preset ends today; bring its end month into view like a jump, so the band is visible.
                            const month = range.end.slice(0, 7);
                            if (descriptor.focusedMonth !== month)
                                descriptor.onFocusedMonthChange?.(month, "jump");
                        } }, preset.id));
                }) })) : null, _jsx(CalendarPaintContext.Provider, { value: (date) => resolveDateRangeCellPaint(value, date, null), children: _jsx(Calendar, { descriptor: {
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
                        const state = resolveDateRangeCellState(value, info.date, null);
                        const base = composeAccessibleName(info);
                        return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
                    }, ...(previousMonth === undefined ? {} : { previousMonth }), ...(nextMonth === undefined ? {} : { nextMonth }), ...(renderCellContent === undefined ? {} : { renderCellContent: (cell) => renderCellContent(cell.date) }) }) })] }));
}
//# sourceMappingURL=date-range.js.map