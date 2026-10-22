import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { timePickerDraft, timePickerItems, resolveTimePickerValue, resolveTimePickerWheelIndex, moveTimePickerWheelIndex, validateTimePicker, timePickerRecipe } from "@hjmds/design-contracts/components/time-picker";
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
    const [moving, setMoving] = useState({ hour: false, minute: false });
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
    const confirm = _jsx(Button, { disabled: locked || resolved === null || moving.hour || moving.minute, onPress: () => { const current = resolveTimePickerValue(draft, props); if (!locked && current !== null) {
            onValueChange(current);
            setOpen(false);
        } }, children: labels.confirm });
    const panel = _jsxs(View, { style: { gap: timePickerRecipe.sectionGap, direction: environment.direction }, children: [_jsxs(Text, { fontRole: "ui", accessibilityLiveRegion: "polite", accessibilityLabel: `${draft.hour ?? "--"}:${draft.minute ?? "--"}`, style: { textAlign: "center", fontSize: timePickerRecipe.readoutSize, lineHeight: timePickerRecipe.readoutLineHeight, fontVariant: ["tabular-nums"], fontWeight: "500" }, children: [draft.hour ?? "--", ":", draft.minute ?? "--"] }), _jsx(View, { style: { flexDirection: "row", gap: timePickerRecipe.gap }, children: ["hour", "minute"].map(part => _jsx(TimeColumn, { part: part, label: labels[part], draft: draft, options: props, locked: locked, onSelect: next => select(part, next), onMoving: next => setMoving(current => current[part] === next ? current : { ...current, [part]: next }) }, part)) })] });
    return _jsxs(View, { style: [{ gap: tokens.spacing.xs, opacity: disabled ? 0.5 : 1 }, layoutStyle], children: [presentation === "inline" ? panel : _jsxs(_Fragment, { children: [_jsx(Text, { variant: "label", emphasis: "strong", children: labels.label }), _jsx(Pressable, { ref: triggerRef, accessibilityRole: "button", accessibilityLabel: `${labels.label}, ${value ?? labels.placeholder}`, accessibilityState: { disabled: locked, expanded: open }, disabled: locked, onPress: () => setOpen(true), style: ({ pressed }) => ({ minHeight: timePickerRecipe.rowHeight, justifyContent: "center", borderWidth: 1, borderColor: error ? colors.danger : colors.borderControl, borderRadius: tokens.radius[timePickerRecipe.radius], paddingHorizontal: tokens.spacing.sm, backgroundColor: colors.bg, opacity: pressed ? 0.72 : 1 }), children: _jsx(Text, { fontRole: "ui", style: { color: value === null ? colors.textMuted : colors.textBody, fontVariant: ["tabular-nums"] }, children: value ?? labels.placeholder }) }), _jsx(Sheet, { open: open, onOpenChange: setOpen, title: labels.label, closeLabel: labels.cancel, showClose: true, returnFocusRef: triggerRef, footer: confirm, ...(safeAreaInsets ? { safeAreaInsets } : {}), children: panel })] }), description ? _jsx(Text, { variant: "label", tone: "muted", children: description }) : null, error ? _jsx(Text, { variant: "label", accessibilityLiveRegion: "assertive", style: { color: colors.danger }, children: error }) : null] });
}
function TimeColumn({ part, label, draft, options, locked, onSelect, onMoving }) {
    const { colors, tokens, environment } = useHjmNativeTheme();
    const scroll = useRef(null);
    const interacting = useRef(false);
    const emitted = useRef(null);
    const wheel = options.selectionStyle === "wheel";
    const items = timePickerItems(part, draft, options);
    const rowHeight = timePickerRecipe.rowHeight, height = rowHeight * timePickerRecipe.visibleRows;
    const index = items.findIndex(item => item.value === draft[part]);
    const reveal = () => { if (index >= 0 || wheel)
        scroll.current?.scrollTo({ y: Math.max(0, wheel ? index : index - 2) * rowHeight, animated: false }); };
    useEffect(() => {
        // Parent echoes of scroll edits must not stop native deceleration.
        if (wheel && emitted.current === draft[part] && draft[part] !== null) {
            emitted.current = null;
            return;
        }
        interacting.current = false;
        onMoving(false);
        reveal();
    }, [index, wheel, locked, options.minuteStep]);
    function emit(target) {
        const item = items[target];
        if (locked || !item || item.disabled || (wheel && item.value === draft[part]))
            return;
        emitted.current = wheel ? item.value : null;
        onSelect(item.value);
    }
    function choose(target) {
        interacting.current = false;
        onMoving(false);
        emit(target);
        if (wheel)
            scroll.current?.scrollTo({ y: target * rowHeight, animated: !environment.reducedMotion });
    }
    function settle(offset) {
        if (!interacting.current || locked)
            return;
        const target = resolveTimePickerWheelIndex(items, offset);
        interacting.current = false;
        onMoving(false);
        if (target !== null)
            choose(target);
    }
    return _jsxs(View, { style: { flex: 1, minWidth: 0, gap: tokens.spacing.xs }, children: [_jsx(Text, { variant: "label", tone: "muted", style: { textAlign: "center" }, children: label }), _jsxs(View, { accessible: wheel, ...(wheel ? {
                    accessibilityRole: "adjustable",
                    accessibilityLabel: label,
                    accessibilityValue: { text: draft[part] === null ? options.labels.placeholder : `${draft[part]} ${label}` },
                    accessibilityState: { disabled: locked || items.every(item => item.disabled) },
                    accessibilityActions: [{ name: "increment" }, { name: "decrement" }],
                    onAccessibilityAction: (event) => {
                        if (locked || !["increment", "decrement"].includes(event.nativeEvent.actionName))
                            return;
                        const target = moveTimePickerWheelIndex(items, index, event.nativeEvent.actionName === "increment" ? 1 : -1);
                        if (target !== null)
                            choose(target);
                    },
                } : {}), style: { height }, children: [wheel && _jsx(View, { pointerEvents: "none", style: { position: "absolute", top: (height - rowHeight) / 2, left: 0, right: 0, height: rowHeight, borderWidth: timePickerRecipe.selectionStroke, borderColor: colors.borderControl, borderRadius: tokens.radius[timePickerRecipe.radius], zIndex: 1 } }), _jsx(ScrollView, { ref: scroll, onLayout: reveal, nestedScrollEnabled: true, keyboardShouldPersistTaps: "handled", style: { height, flexGrow: 0 }, ...(wheel ? {
                            contentContainerStyle: { paddingVertical: (height - rowHeight) / 2 },
                            snapToOffsets: items.flatMap((item, index) => item.disabled ? [] : [index * rowHeight]),
                            snapToStart: false, snapToEnd: false, bounces: false,
                            decelerationRate: environment.reducedMotion ? 0 : "fast",
                            scrollEnabled: !locked && items.some(item => !item.disabled),
                            showsVerticalScrollIndicator: false,
                            accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants",
                            onScrollBeginDrag: () => { if (!locked) {
                                interacting.current = true;
                                onMoving(true);
                            } },
                            onMomentumScrollBegin: () => { if (interacting.current)
                                onMoving(true); },
                            onScroll: (event) => {
                                if (!interacting.current || locked)
                                    return;
                                const target = resolveTimePickerWheelIndex(items, event.nativeEvent.contentOffset.y);
                                if (target !== null)
                                    emit(target);
                            },
                            scrollEventThrottle: 16,
                            // Zero velocity ends a drag without momentum. Otherwise native snapping owns the glide.
                            // https://reactnative.dev/docs/scrollview#onscrollenddrag
                            onScrollEndDrag: (event) => {
                                if (event.nativeEvent.velocity?.y === 0)
                                    settle(event.nativeEvent.contentOffset.y);
                            },
                            onMomentumScrollEnd: (event) => settle(event.nativeEvent.contentOffset.y),
                        } : {}), children: items.map((item, itemIndex) => _jsx(Pressable, { accessibilityRole: "radio", accessibilityLabel: `${item.value} ${label}`, accessibilityState: { checked: draft[part] === item.value, disabled: locked || item.disabled }, disabled: locked || item.disabled, onPress: () => { if (!locked && !item.disabled)
                                choose(itemIndex); }, style: ({ pressed }) => ({ height: rowHeight, alignItems: "center", justifyContent: "center", borderRadius: tokens.radius[timePickerRecipe.radius], backgroundColor: draft[part] === item.value ? colors.surfaceAccent : "transparent", opacity: locked || item.disabled ? 0.4 : pressed ? 0.72 : 1 }), children: _jsx(Text, { fontRole: "ui", style: { color: draft[part] === item.value ? colors.text : colors.textBody, fontWeight: draft[part] === item.value ? "500" : "400", fontVariant: ["tabular-nums"] }, children: item.value }) }, item.value)) })] })] });
}
//# sourceMappingURL=time-picker.js.map