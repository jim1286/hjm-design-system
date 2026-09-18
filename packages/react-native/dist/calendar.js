import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { typography } from "@hjmds/design-contracts/foundations";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { isWebRenderer, webOnly } from "./internal/web-a11y.js";
import { useImperativeHandle, useRef, useEffect, useState } from "react";
import { AccessibilityInfo, Pressable, ScrollView, View, findNodeHandle } from "react-native";
import { calendarRecipe as recipe, assertIsoCalendarMonth, validateCalendarDescriptor, resolveCalendarGridDescriptor, } from "@hjmds/design-contracts/components/calendar";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
/** Inline dates stay individually accessible; Native month paging uses explicit buttons. */
export function Calendar({ descriptor, composeAccessibleName, previousMonth, nextMonth, renderCellContent, size = "medium", ref }) {
    validateCalendarDescriptor(descriptor);
    for (const action of [previousMonth, nextMonth]) {
        if (!action)
            continue;
        assertIsoCalendarMonth(action.month, "month action");
        if (!action.label.trim())
            throw new TypeError("Calendar month action label must not be empty");
    }
    const { colors, environment, palette } = useHjmNativeTheme();
    const [selected, setSelected] = useControllableState({
        ...(descriptor.selectedDate === undefined ? {} : { value: descriptor.selectedDate }),
        defaultValue: descriptor.defaultSelectedDate ?? null,
        ...(descriptor.onSelectionChange ? { onChange: descriptor.onSelectionChange } : {}),
    });
    const cells = resolveCalendarGridDescriptor(descriptor.grid, selected, { composeAccessibleName });
    const targets = useRef(new Map());
    const pending = useRef(undefined);
    const [request, setRequest] = useState(0);
    useImperativeHandle(ref, () => ({ focusDate(date) { pending.current = date; setRequest((value) => value + 1); } }), []);
    const gridKey = descriptor.grid.cells.map((cell) => cell.date ?? "").join(",");
    useEffect(() => {
        if (!pending.current)
            return;
        const node = targets.current.get(pending.current);
        // RN Web refs are DOM nodes; the native accessibility bridge cannot focus them.
        if (node && isWebRenderer) {
            node.focus?.();
            pending.current = undefined;
            return;
        }
        const handle = node ? findNodeHandle(node) : null;
        if (handle != null) {
            AccessibilityInfo.setAccessibilityFocus(handle);
            pending.current = undefined;
        }
    }, [gridKey, request]);
    const diameter = recipe.sizes[size].cellDiameter;
    const nav = (action, reason) => action
        ? _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: action.label, disabled: !descriptor.onFocusedMonthChange, accessibilityState: { disabled: !descriptor.onFocusedMonthChange }, onPress: () => descriptor.onFocusedMonthChange?.(action.month, reason), style: [minimumTargetStyle, { alignItems: "center", justifyContent: "center" }], children: _jsx(Text, { accessible: false, children: (reason === "previous") !== (environment.direction === "rtl") ? "‹" : "›" }) }) : _jsx(View, { accessible: false, style: minimumTargetStyle });
    return _jsxs(View, { style: { gap: recipe.header.gap, direction: environment.direction }, children: [_jsxs(View, { style: { flexDirection: "row", alignItems: "center", gap: recipe.header.gap }, children: [nav(previousMonth, "previous"), _jsx(Text, { accessibilityRole: "header", accessibilityLiveRegion: "polite", variant: recipe.header.monthLabel.textVariant, emphasis: "strong", align: "center", style: { flex: 1 }, children: descriptor.monthLabel }), nav(nextMonth, "next")] }), _jsx(ScrollView, { horizontal: true, contentContainerStyle: { flexGrow: 1 }, children: _jsxs(View, { style: { flex: 1, minWidth: diameter * 7 }, children: [_jsx(View, { accessible: false, style: { flexDirection: "row" }, children: descriptor.grid.weekdayLabels.map((label, index) => _jsx(Text, { accessible: false, align: "center", tone: "muted", variant: recipe.weekdayLabel.textVariant, style: { flex: 1 }, children: label }, index)) }), Array.from({ length: cells.length / 7 }, (_, row) => _jsx(View, { style: { flexDirection: "row" }, children: cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell
                                ? _jsx(View, { accessible: false, style: { flex: 1, minHeight: diameter } }, `filler-${column}`)
                                : _jsxs(Pressable, { ref: (node) => { if (node)
                                        targets.current.set(cell.date, node);
                                    else
                                        targets.current.delete(cell.date); }, accessibilityRole: "button", accessibilityLabel: cell.accessibleName, ...webOnly({ "aria-pressed": cell.isSelected, "aria-disabled": !cell.selectable }), accessibilityState: { selected: cell.isSelected, disabled: !cell.selectable }, onPress: () => { if (cell.selectable)
                                        setSelected(cell.date); }, style: { flex: 1, minWidth: diameter, minHeight: diameter, alignItems: "center", justifyContent: "flex-start",
                                        borderRadius: diameter / 2,
                                        opacity: !cell.selectable ? recipe.day.disabledOpacity : cell.outsideFocusedMonth ? recipe.day.outsideFocusedMonthOpacity : 1 }, children: [_jsx(View, { accessible: false, style: { width: diameter, minHeight: diameter, alignItems: "center", justifyContent: "center", borderRadius: diameter / 2, borderWidth: recipe.day.today.borderWidth, borderColor: cell.isToday ? resolveColorReference(recipe.day.today.border, palette) : "transparent", backgroundColor: cell.isSelected ? colors.primary : "transparent" }, children: _jsx(Text, { accessible: false, variant: recipe.sizes[size].textVariant, align: "center", style: { color: cell.isSelected ? colors.onPrimary : colors.textBody, fontVariant: ["tabular-nums"] }, children: Number(cell.date.slice(-2)) }) }), renderCellContent ? _jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { minHeight: typography.label.lineHeight * environment.textScale }, children: renderCellContent(cell) }) : null] }, cell.date)) }, row))] }) })] });
}
//# sourceMappingURL=calendar.js.map