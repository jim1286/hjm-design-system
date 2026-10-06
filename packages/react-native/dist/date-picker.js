import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from "@hjmds/design-contracts/components/calendar";
import { datePickerRecipe, resolveDatePickerTriggerText, validateDatePickerDescriptor, } from "@hjmds/design-contracts/components/date-picker";
import { radius } from "@hjmds/design-contracts/foundations";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Calendar } from "./calendar.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Sheet } from "./overlays.js";
import { Text } from "./primitives.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { useHjmNativeTheme } from "./provider.js";
/** Native single-date trigger backed by the canonical Sheet overlay. */
export function DatePicker({ descriptor, monthLabel, composeAccessibleName, previousMonth, nextMonth, clearLabel, closeLabel, size = "medium", description, error, renderCellContent, safeAreaInsets, layoutStyle, style, }) {
    warnDeprecatedStyleProps("DatePicker", { style }, "layoutStyle for placement; size owns appearance");
    validateDatePickerDescriptor(descriptor);
    const { colors, environment } = useHjmNativeTheme();
    const controlledOpen = descriptor.open !== undefined;
    const [internalOpen, setInternalOpen] = useState(descriptor.defaultOpen ?? false);
    const open = controlledOpen ? descriptor.open === true : internalOpen;
    const controlledSelection = descriptor.selectedDate !== undefined;
    const [internalSelection, setInternalSelection] = useState(descriptor.defaultSelectedDate ?? null);
    const selectedDate = controlledSelection ? descriptor.selectedDate ?? null : internalSelection;
    const returnFocusRef = useRef(null);
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
    // The outer field owns selection; the shared grid receives only its resolved controlled value.
    const { defaultSelectedDate: _defaultSelectedDate, ...calendarDescriptor } = descriptor;
    const calendarGrid = descriptor.disabled || descriptor.readOnly
        ? { ...descriptor.grid, cells: descriptor.grid.cells.map((cell) => cell.date ? { ...cell, disabled: true } : cell) }
        : descriptor.grid;
    const label = descriptor.label ?? descriptor.accessibilityLabel;
    const triggerText = resolveDatePickerTriggerText(descriptor);
    return (_jsxs(View, { style: [{ gap: 6 }, style, layoutStyle], children: [descriptor.label === undefined ? null : _jsx(Text, { emphasis: "strong", variant: "label", style: descriptor.disabled ? { opacity: fieldRecipe.disabledOpacity } : undefined, children: descriptor.label }), _jsxs(View, { style: { alignItems: "center", direction: environment.direction, flexDirection: "row", opacity: descriptor.disabled ? fieldRecipe.disabledOpacity : 1 }, children: [_jsxs(Pressable, { accessibilityLabel: descriptor.accessibilityLabel ?? `${label}, ${triggerText}`, accessibilityRole: "button", accessibilityState: { disabled: descriptor.disabled, expanded: open }, disabled: descriptor.disabled, onPress: () => !descriptor.readOnly && requestOpen(!open, "trigger"), ref: returnFocusRef, 
                        // Trigger height and inset come from datePickerRecipe.sizes (medium 44 · 16, large 52 · 20), the field frame
                        // Select and NumberField share. Until 2026-10-06 Native drew 48/56 and Web 44/56, three different heights.
                        style: ({ pressed }) => ({ alignItems: "center", backgroundColor: colors.bg, borderColor: descriptor.invalid || error ? colors.danger : colors.borderControl, borderRadius: radius[datePickerRecipe.frame.radius], borderWidth: datePickerRecipe.frame.borderWidth, flex: 1, flexDirection: "row", gap: 8, minHeight: datePickerRecipe.sizes[size].minHeight, opacity: pressed ? 0.72 : 1, paddingHorizontal: datePickerRecipe.sizes[size].paddingHorizontal }), children: [_jsx(Text, { accessible: false, children: "\u25A3" }), _jsx(Text, { style: { color: descriptor.displayValue === null ? colors.textMuted : colors.textBody }, children: triggerText })] }), selectedDate === null ? null : (_jsx(Pressable, { accessibilityLabel: clearLabel, accessibilityRole: "button", disabled: descriptor.disabled || descriptor.readOnly, onPress: () => commit(null, "clear"), style: ({ pressed }) => [minimumTargetStyle, { alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 }], children: _jsx(Text, { tone: "muted", children: "\u00D7" }) }))] }), description === undefined ? null : _jsx(Text, { tone: "muted", variant: "label", children: description }), error === undefined ? null : _jsx(Text, { accessibilityLiveRegion: "assertive", style: { color: colors.danger }, variant: "label", children: error }), _jsx(Sheet, { closeLabel: closeLabel, onOpenChange: (next) => { if (!next)
                    requestOpen(false, "outside"); }, open: open, returnFocusRef: returnFocusRef, ...(safeAreaInsets === undefined ? {} : { safeAreaInsets }), title: label, children: _jsx(Calendar, { descriptor: { ...calendarDescriptor, grid: calendarGrid, monthLabel, selectedDate, onSelectionChange: (date) => commit(date, "activate") }, composeAccessibleName: composeAccessibleName, size: size, ...(previousMonth ? { previousMonth } : {}), ...(nextMonth ? { nextMonth } : {}), ...(renderCellContent ? { renderCellContent } : {}) }) })] }));
}
//# sourceMappingURL=date-picker.js.map