import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, AppState, View } from "react-native";
import Sortable from "react-native-sortables";
import { reorderIntent, validateItems } from "@hjmds/design-contracts/components/interaction-adapters";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function SortableCollection(props) {
    validateItems(props.items);
    if (!props.label.trim())
        throw new TypeError("SortableCollection needs a label");
    const { tokens, environment } = useHjmNativeTheme();
    const snapshot = useRef("");
    const dragging = useRef(false);
    const latest = useRef(props);
    latest.current = props;
    const [session, setSession] = useState(0);
    const signature = JSON.stringify(props.items);
    useEffect(() => {
        if (dragging.current) {
            dragging.current = false;
            latest.current.onCancel?.();
        }
    }, [signature, props.active]);
    useEffect(() => {
        const sub = AppState.addEventListener("change", state => {
            if (state !== "active") {
                if (dragging.current) {
                    dragging.current = false;
                    latest.current.onCancel?.();
                }
                setSession(value => value + 1);
            }
        });
        return () => { sub.remove(); if (dragging.current)
            latest.current.onCancel?.(); };
    }, []);
    function commit(id, to, source) {
        if (props.disabled || props.active === false)
            return;
        const intent = reorderIntent(props.items, id, to, source);
        if (intent) {
            props.onCommit(intent);
            AccessibilityInfo.announceForAccessibility(props.labels.position(props.items[intent.fromIndex], to + 1, props.items.length));
        }
        // The engine keeps temporary order even when the controlled host rejects a move.
        setSession(value => value + 1);
    }
    return _jsx(View, { accessibilityLabel: props.label, children: _jsx(Sortable.Grid, { columns: 1, data: [...props.items], keyExtractor: item => item.id, itemEntering: null, itemExiting: null, customHandle: true, sortEnabled: !props.disabled && props.active !== false && !environment.reducedMotion, hapticsEnabled: false, activationAnimationDuration: environment.reducedMotion ? 0 : 120, dropAnimationDuration: environment.reducedMotion ? 0 : 200, onDragStart: () => { snapshot.current = signature; dragging.current = true; }, onDragEnd: ({ key, toIndex }) => {
                if (!dragging.current || snapshot.current !== signature)
                    return;
                dragging.current = false;
                commit(key, toIndex, "drag");
            }, renderItem: ({ item, index }) => _jsxs(View, { style: { padding: tokens.spacing.xs, gap: tokens.spacing.xs }, children: [_jsx(Sortable.Handle, { mode: props.disabled || item.disabled ? "non-draggable" : "draggable", children: _jsxs(View, { accessible: true, accessibilityRole: "adjustable", accessibilityLabel: props.labels.handle(item), accessibilityValue: { text: props.labels.position(item, index + 1, props.items.length) }, accessibilityActions: [{ name: "decrement", label: props.labels.previous(item) }, { name: "increment", label: props.labels.next(item) }], onAccessibilityAction: ({ nativeEvent }) => {
                                if (nativeEvent.actionName === "increment" || nativeEvent.actionName === "decrement") {
                                    commit(item.id, index + (nativeEvent.actionName === "increment" ? 1 : -1), "accessibility-action");
                                }
                            }, 
                            // Yoga `direction` mirrors the rows under HJM RTL even when the OS is LTR;
                            // without it the grip and the move buttons stayed left-to-right (2026-09-30 audit).
                            style: { alignItems: "center", direction: environment.direction, flexDirection: "row", gap: tokens.spacing.xs, minHeight: 44 }, children: [_jsx(Text, { children: "\u283F" }), _jsx(Text, { children: item.label })] }) }), props.renderItem(item), _jsxs(View, { style: { direction: environment.direction, flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.xs }, children: [_jsx(Button, { tone: "ghost", disabled: props.disabled || item.disabled || index === 0, onPress: () => commit(item.id, index - 1, "accessibility-action"), children: props.labels.previous(item) }), _jsx(Button, { tone: "ghost", disabled: props.disabled || item.disabled || index === props.items.length - 1, onPress: () => commit(item.id, index + 1, "accessibility-action"), children: props.labels.next(item) })] })] }) }, `${signature}:${session}:${props.active !== false}`) });
}
//# sourceMappingURL=sortable.js.map