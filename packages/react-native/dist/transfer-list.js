import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { transferListRecipe, moveTransferListSelection, reconcileTransferListSelection, resolveTransferListPanels, resolveTransferListSelectAllState, toggleTransferListSelectAll, toggleTransferListSelection, validateTransferListDescriptor, } from "@hjmds/design-contracts/components/transfer-list";
import { reconcileCheckboxSelection } from "@hjmds/design-contracts/behaviors";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { mixedCheckboxState, useControllableState } from "./internal/state.js";
import { useHjmNativeTheme } from "./provider.js";
const emptySelection = () => ({
    source: new Set(),
    target: new Set(),
});
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function TransferList({ items, labels, targetKeys: controlledTargetKeys, defaultTargetKeys, onTargetKeysChange, onMove, layoutStyle, }) {
    const { colors, designProfile } = useHjmNativeTheme();
    // Panels share the Web md role; preserve the pre-profile frame when no profile is selected.
    const corner = designProfile?.tokens.radius[transferListRecipe.panel.radius] ?? 12;
    const [storedTargetKeys, setTargetKeys] = useControllableState({
        ...(controlledTargetKeys === undefined ? {} : { value: controlledTargetKeys }),
        defaultValue: defaultTargetKeys ?? new Set(),
        ...(onTargetKeysChange === undefined ? {} : { onChange: onTargetKeysChange }),
    });
    const validatedInitialTargets = useRef(false);
    if (!validatedInitialTargets.current) {
        validateTransferListDescriptor({ items, targetKeys: storedTargetKeys });
        validatedInitialTargets.current = true;
    }
    const targetKeys = useMemo(() => controlledTargetKeys === undefined
        ? reconcileCheckboxSelection(items, storedTargetKeys) : storedTargetKeys, [controlledTargetKeys, items, storedTargetKeys]);
    useEffect(() => {
        if (controlledTargetKeys === undefined && targetKeys !== storedTargetKeys)
            setTargetKeys(targetKeys);
    }, [controlledTargetKeys, setTargetKeys, storedTargetKeys, targetKeys]);
    const [rawSelection, setSelection] = useState((emptySelection));
    const descriptor = useMemo(() => ({ items, targetKeys }), [items, targetKeys]);
    // A row that left the list entirely must not keep a pending check mark.
    const selection = useMemo(() => reconcileTransferListSelection(descriptor, rawSelection), [descriptor, rawSelection]);
    useEffect(() => {
        if (selection !== rawSelection)
            setSelection(selection);
    }, [rawSelection, selection]);
    const panels = resolveTransferListPanels(descriptor);
    const canMove = (panel) => panels[panel].some(item => !item.disabled && selection[panel].has(item.id));
    const move = (direction) => {
        const result = moveTransferListSelection(descriptor, selection, direction);
        if (result.movedIds.length === 0)
            return;
        setTargetKeys(result.targetKeys);
        // Controlled owners may refuse or defer the move; keep checks until the rows actually leave.
        if (controlledTargetKeys === undefined)
            setSelection(result.selection);
        if (result.movedIds.length > 0)
            onMove?.(result.movedIds, direction);
    };
    const renderPanel = (panel) => {
        const rows = panels[panel];
        const selectAll = resolveTransferListSelectAllState(descriptor, selection, panel);
        return (_jsxs(View, { style: { flex: 1, gap: spacing.xs }, children: [_jsx(Pressable, { accessibilityRole: "checkbox", 
                    // `mixed` is the contract's answer, not a third visual state invented
                    // here: some rows checked is neither on nor off.
                    // mixedCheckboxState keeps Android from holding a stale ", mixed" suffix.
                    accessibilityState: mixedCheckboxState(selectAll, { disabled: !rows.some(item => !item.disabled) }), accessibilityLabel: `${panel === "source" ? labels.source : labels.target}, ${labels.selectAll}`, disabled: !rows.some(item => !item.disabled), onPress: () => setSelection(toggleTransferListSelectAll(descriptor, selection, panel)), style: { minHeight: control.minTouchTarget, justifyContent: "center" }, children: _jsx(Text, { variant: "label", children: labels.selectAll }) }), _jsx(ScrollView, { accessibilityRole: "list", accessibilityLabel: panel === "source" ? labels.source : labels.target, style: { borderWidth: 1, borderColor: colors.border, borderRadius: corner }, contentContainerStyle: rows.length === 0 ? { flexGrow: 1, justifyContent: "center", alignItems: "center" } : undefined, children: rows.length === 0 ? (_jsx(Text, { tone: "muted", variant: "caption", align: "center", style: { padding: spacing.sm }, children: labels.empty })) : (rows.map((item) => {
                        const checked = selection[panel].has(item.id);
                        return (_jsx(Pressable, { accessibilityRole: "checkbox", accessibilityLabel: item.label, accessibilityState: { checked, disabled: item.disabled === true }, disabled: item.disabled === true, onPress: () => setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id)), style: { minHeight: control.minTouchTarget, justifyContent: "center", paddingHorizontal: spacing.sm }, children: _jsxs(Text, { fontRole: "ui", children: [checked ? "✓ " : "", item.label] }) }, item.id));
                    })) })] }));
    };
    return (_jsxs(View, { style: [{ gap: spacing.sm }, layoutStyle], children: [_jsx(Text, { variant: "label", children: labels.source }), renderPanel("source"), _jsxs(View, { style: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" }, children: [_jsx(Button, { tone: "secondary", disabled: !canMove("source"), onPress: () => move("toTarget"), children: labels.toTarget }), _jsx(Button, { tone: "secondary", disabled: !canMove("target"), onPress: () => move("toSource"), children: labels.toSource })] }), _jsx(Text, { variant: "label", children: labels.target }), renderPanel("target")] }));
}
//# sourceMappingURL=transfer-list.js.map