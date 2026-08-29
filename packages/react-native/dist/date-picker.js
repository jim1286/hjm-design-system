import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { calendarRecipe, } from "@hjmds/design-contracts/components/calendar";
import { resolveDatePickerGrid, resolveDatePickerTriggerText, validateDatePickerDescriptor, } from "@hjmds/design-contracts/components/date-picker";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { minimumTargetStyle } from "./internal/styles.js";
import { Sheet } from "./overlays.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
/** Native single-date trigger backed by the canonical Sheet overlay. */
export function DatePicker({ descriptor, monthLabel, composeAccessibleName, previousMonth, nextMonth, clearLabel, closeLabel, size = "medium", description, error, renderCellContent, style, }) {
    validateDatePickerDescriptor(descriptor);
    const { colors, environment } = useHjmNativeTheme();
    const controlledOpen = descriptor.open !== undefined;
    const [internalOpen, setInternalOpen] = useState(descriptor.defaultOpen ?? false);
    const open = controlledOpen ? descriptor.open === true : internalOpen;
    const controlledSelection = descriptor.selectedDate !== undefined;
    const [internalSelection, setInternalSelection] = useState(descriptor.defaultSelectedDate ?? null);
    const selectedDate = controlledSelection ? descriptor.selectedDate ?? null : internalSelection;
    const cells = resolveDatePickerGrid({ ...descriptor, selectedDate }, { composeAccessibleName });
    const returnFocusRef = useRef(null);
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
    const label = descriptor.label ?? descriptor.accessibilityLabel;
    const triggerText = resolveDatePickerTriggerText(descriptor);
    const sizeMetrics = calendarRecipe.sizes[size];
    return (_jsxs(View, { style: [{ gap: 6 }, style], children: [descriptor.label === undefined ? null : _jsx(Text, { emphasis: "strong", variant: "label", children: descriptor.label }), _jsxs(View, { style: { alignItems: "center", direction: environment.direction, flexDirection: "row" }, children: [_jsxs(Pressable, { accessibilityLabel: descriptor.accessibilityLabel ?? `${label}, ${triggerText}`, accessibilityRole: "button", accessibilityState: { disabled: descriptor.disabled, expanded: open }, disabled: descriptor.disabled, onPress: () => !descriptor.readOnly && requestOpen(!open, "trigger"), ref: returnFocusRef, style: ({ pressed }) => ({ alignItems: "center", backgroundColor: colors.surface, borderColor: descriptor.invalid || error ? colors.danger : colors.border, borderRadius: 12, borderWidth: 1, flex: 1, flexDirection: "row", gap: 8, minHeight: size === "large" ? 56 : 48, opacity: pressed ? 0.72 : 1, paddingHorizontal: size === "large" ? 20 : 16 }), children: [_jsx(Text, { accessible: false, children: "\u25A3" }), _jsx(Text, { style: { color: descriptor.displayValue === null ? colors.textMuted : colors.textBody }, children: triggerText })] }), selectedDate === null ? null : (_jsx(Pressable, { accessibilityLabel: clearLabel, accessibilityRole: "button", disabled: descriptor.disabled || descriptor.readOnly, onPress: () => commit(null, "clear"), style: ({ pressed }) => [minimumTargetStyle, { alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 }], children: _jsx(Text, { tone: "muted", children: "\u00D7" }) }))] }), description === undefined ? null : _jsx(Text, { tone: "muted", variant: "label", children: description }), error === undefined ? null : _jsx(Text, { accessibilityLiveRegion: "assertive", style: { color: colors.danger }, variant: "label", children: error }), _jsx(Sheet, { closeLabel: closeLabel, onOpenChange: (next) => { if (!next)
                    requestOpen(false, "outside"); }, open: open, returnFocusRef: returnFocusRef, title: monthLabel, children: _jsxs(View, { style: { gap: 8 }, children: [_jsxs(View, { style: { alignItems: "center", flexDirection: "row", gap: 4 }, children: [previousMonth === undefined ? _jsx(View, { accessible: false, style: minimumTargetStyle }) : _jsx(Pressable, { accessibilityLabel: previousMonth.label, accessibilityRole: "button", onPress: () => descriptor.onFocusedMonthChange?.(previousMonth.month, "previous"), style: ({ pressed }) => [minimumTargetStyle, { alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 }], children: _jsx(Text, { children: "\u2039" }) }), _jsx(Text, { align: "center", emphasis: "strong", style: { flex: 1 }, variant: "title", children: monthLabel }), nextMonth === undefined ? _jsx(View, { accessible: false, style: minimumTargetStyle }) : _jsx(Pressable, { accessibilityLabel: nextMonth.label, accessibilityRole: "button", onPress: () => descriptor.onFocusedMonthChange?.(nextMonth.month, "next"), style: ({ pressed }) => [minimumTargetStyle, { alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 }], children: _jsx(Text, { children: "\u203A" }) })] }), _jsx(View, { accessible: false, style: { flexDirection: "row" }, children: descriptor.grid.weekdayLabels.map((weekday, index) => _jsx(Text, { align: "center", style: { flex: 1 }, tone: "muted", variant: "label", children: weekday }, `${weekday}-${index}`)) }), Array.from({ length: cells.length / 7 }, (_, row) => (_jsx(View, { style: { flexDirection: "row" }, children: cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell ? (_jsx(View, { accessible: false, style: { flex: 1, height: sizeMetrics.cellDiameter } }, `filler-${row}-${column}`)) : (_jsx(View, { style: { alignItems: "center", flex: 1 }, children: _jsxs(Pressable, { accessibilityLabel: cell.accessibleName, accessibilityRole: "button", accessibilityState: { disabled: !cell.selectable, selected: cell.isSelected }, onPress: () => cell.selectable && commit(cell.date, "activate"), style: ({ pressed }) => ({ alignItems: "center", backgroundColor: cell.isSelected ? colors.primary : "transparent", borderColor: cell.isToday ? colors.contentBrand : "transparent", borderRadius: sizeMetrics.cellDiameter / 2, borderWidth: cell.isToday ? 1 : 0, height: sizeMetrics.cellDiameter, justifyContent: "center", opacity: !cell.selectable ? 0.4 : cell.outsideFocusedMonth ? 0.56 : pressed ? 0.72 : 1, width: sizeMetrics.cellDiameter }), children: [_jsx(Text, { align: "center", style: { color: cell.isSelected ? colors.onPrimary : colors.textBody }, children: Number(cell.date.slice(-2)) }), renderCellContent?.(cell)] }) }, cell.date))) }, row)))] }) })] }));
}
//# sourceMappingURL=date-picker.js.map