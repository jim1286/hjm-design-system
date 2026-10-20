import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { timePickerDraft, timePickerItems, resolveTimePickerValue, validateTimePicker, timePickerRecipe } from "@hjmds/design-contracts/components/time-picker";
import { Button } from "./actions.js";
import { Sheet } from "./overlays.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function TimePicker(props) {
    validateTimePicker(props);
    const { value, onValueChange, labels, disabled, readOnly, description, error, presentation = "field", layoutStyle, safeAreaInsets } = props;
    const { colors, tokens, environment } = useHjmNativeTheme();
    const [open, setOpen] = useState(false), [draft, setDraft] = useState(() => timePickerDraft(value));
    const triggerRef = useRef(null);
    const locked = !!(disabled || readOnly);
    const emitted = useRef(null);
    useEffect(() => {
        // Preserve an incomplete inline draft when the parent echoes its null validity value.
        if (presentation === "inline" && emitted.current?.value === value) {
            emitted.current = null;
            return;
        }
        emitted.current = null;
        setDraft(timePickerDraft(value));
    }, [value, open, presentation]);
    useEffect(() => { if (locked)
        setOpen(false); }, [locked]);
    const resolved = resolveTimePickerValue(draft, props);
    function select(part, next) {
        if (locked)
            return;
        const updated = { ...draft, [part]: next };
        setDraft(updated);
        const result = resolveTimePickerValue(updated, props);
        if (presentation === "inline") {
            emitted.current = { value: result };
            onValueChange(result);
        }
    }
    const confirm = _jsx(Button, { disabled: locked || resolved === null, onPress: () => { const current = resolveTimePickerValue(draft, props); if (!locked && current !== null) {
            onValueChange(current);
            setOpen(false);
        } }, children: labels.confirm });
    const panel = _jsxs(View, { style: { gap: timePickerRecipe.sectionGap, direction: environment.direction }, children: [_jsxs(Text, { fontRole: "ui", accessibilityLiveRegion: "polite", accessibilityLabel: `${draft.hour ?? "--"}:${draft.minute ?? "--"}`, style: { textAlign: "center", fontSize: timePickerRecipe.readoutSize, lineHeight: timePickerRecipe.readoutLineHeight, fontVariant: ["tabular-nums"], fontWeight: "500" }, children: [draft.hour ?? "--", ":", draft.minute ?? "--"] }), _jsx(View, { style: { flexDirection: "row", gap: timePickerRecipe.gap }, children: ["hour", "minute"].map(part => _jsx(TimeColumn, { part: part, label: labels[part], draft: draft, options: props, locked: locked, onSelect: next => select(part, next) }, part)) })] });
    return _jsxs(View, { style: [{ gap: tokens.spacing.xs, opacity: disabled ? 0.5 : 1 }, layoutStyle], children: [presentation === "inline" ? panel : _jsxs(_Fragment, { children: [_jsx(Text, { variant: "label", emphasis: "strong", children: labels.label }), _jsx(Pressable, { ref: triggerRef, accessibilityRole: "button", accessibilityLabel: `${labels.label}, ${value ?? labels.placeholder}`, accessibilityState: { disabled: locked, expanded: open }, disabled: locked, onPress: () => setOpen(true), style: ({ pressed }) => ({ minHeight: timePickerRecipe.rowHeight, justifyContent: "center", borderWidth: 1, borderColor: error ? colors.danger : colors.borderControl, borderRadius: tokens.radius[timePickerRecipe.radius], paddingHorizontal: tokens.spacing.sm, backgroundColor: colors.bg, opacity: pressed ? 0.72 : 1 }), children: _jsx(Text, { fontRole: "ui", style: { color: value === null ? colors.textMuted : colors.textBody, fontVariant: ["tabular-nums"] }, children: value ?? labels.placeholder }) }), _jsx(Sheet, { open: open, onOpenChange: setOpen, title: labels.label, closeLabel: labels.cancel, showClose: true, returnFocusRef: triggerRef, footer: confirm, ...(safeAreaInsets ? { safeAreaInsets } : {}), children: panel })] }), description ? _jsx(Text, { variant: "label", tone: "muted", children: description }) : null, error ? _jsx(Text, { variant: "label", accessibilityLiveRegion: "assertive", style: { color: colors.danger }, children: error }) : null] });
}
function TimeColumn({ part, label, draft, options, locked, onSelect }) {
    const { colors, tokens } = useHjmNativeTheme();
    const scroll = useRef(null);
    const items = timePickerItems(part, draft, options);
    const rowHeight = timePickerRecipe.rowHeight, height = rowHeight * timePickerRecipe.visibleRows;
    const index = items.findIndex(item => item.value === draft[part]);
    const reveal = () => { if (index >= 0)
        scroll.current?.scrollTo({ y: Math.max(0, (index - 2) * rowHeight), animated: false }); };
    useEffect(reveal, [index]);
    return _jsxs(View, { style: { flex: 1, minWidth: 0, gap: tokens.spacing.xs }, children: [_jsx(Text, { variant: "label", tone: "muted", style: { textAlign: "center" }, children: label }), _jsx(ScrollView, { ref: scroll, onLayout: reveal, nestedScrollEnabled: true, keyboardShouldPersistTaps: "handled", style: { height, flexGrow: 0 }, children: items.map(item => _jsx(Pressable, { accessibilityRole: "radio", accessibilityLabel: `${item.value} ${label}`, accessibilityState: { checked: draft[part] === item.value, disabled: locked || item.disabled }, disabled: locked || item.disabled, onPress: () => { if (!locked && !item.disabled)
                        onSelect(item.value); }, style: ({ pressed }) => ({ height: rowHeight, alignItems: "center", justifyContent: "center", borderRadius: tokens.radius[timePickerRecipe.radius], backgroundColor: draft[part] === item.value ? colors.surfaceAccent : "transparent", opacity: locked || item.disabled ? 0.4 : pressed ? 0.72 : 1 }), children: _jsx(Text, { fontRole: "ui", style: { color: draft[part] === item.value ? colors.contentBrand : colors.textBody, fontVariant: ["tabular-nums"] }, children: item.value }) }, item.value)) })] });
}
//# sourceMappingURL=time-picker.js.map