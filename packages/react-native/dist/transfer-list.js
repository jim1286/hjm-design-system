import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { moveTransferListSelection, reconcileTransferListSelection, resolveTransferListPanels, resolveTransferListSelectAllState, toggleTransferListSelectAll, toggleTransferListSelection, } from "@hjmds/design-contracts/components/transfer-list";
import { spacing } from "@hjmds/design-contracts/foundations";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { useControllableState } from "./internal/state.js";
import { useHjmNativeTheme } from "./provider.js";
const emptySelection = () => ({
    source: new Set(),
    target: new Set(),
});
export function TransferList({ items, labels, targetKeys: controlledTargetKeys, defaultTargetKeys, onTargetKeysChange, onMove, style, }) {
    const { colors } = useHjmNativeTheme();
    const [targetKeys, setTargetKeys] = useControllableState({
        ...(controlledTargetKeys === undefined ? {} : { value: controlledTargetKeys }),
        defaultValue: defaultTargetKeys ?? new Set(),
        ...(onTargetKeysChange === undefined ? {} : { onChange: onTargetKeysChange }),
    });
    const [rawSelection, setSelection] = useState((emptySelection));
    const descriptor = useMemo(() => ({ items, targetKeys }), [items, targetKeys]);
    // A row that left the list entirely must not keep a pending check mark.
    const selection = useMemo(() => reconcileTransferListSelection(descriptor, rawSelection), [descriptor, rawSelection]);
    const panels = resolveTransferListPanels(descriptor);
    const move = (direction) => {
        const result = moveTransferListSelection(descriptor, selection, direction);
        setTargetKeys(result.targetKeys);
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
                    accessibilityState: { checked: selectAll }, accessibilityLabel: `${panel === "source" ? labels.source : labels.target}, ${labels.selectAll}`, disabled: rows.length === 0, onPress: () => setSelection(toggleTransferListSelectAll(descriptor, selection, panel)), style: { minHeight: 44, justifyContent: "center" }, children: _jsx(Text, { variant: "label", children: labels.selectAll }) }), _jsx(ScrollView, { style: { borderWidth: 1, borderColor: colors.border, borderRadius: 12 }, children: rows.length === 0 ? (_jsx(Text, { tone: "muted", variant: "caption", style: { padding: spacing.sm }, children: labels.empty })) : (rows.map((item) => {
                        const checked = selection[panel].has(item.id);
                        return (_jsx(Pressable, { accessibilityRole: "checkbox", accessibilityState: { checked, disabled: item.disabled === true }, disabled: item.disabled === true, onPress: () => setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id)), style: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.sm }, children: _jsxs(Text, { children: [checked ? "✓ " : "", item.label] }) }, item.id));
                    })) })] }));
    };
    return (_jsxs(View, { style: [{ gap: spacing.sm }, style], children: [_jsx(Text, { variant: "label", children: labels.source }), renderPanel("source"), _jsxs(View, { style: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" }, children: [_jsx(Button, { tone: "secondary", disabled: selection.source.size === 0, onPress: () => move("toTarget"), children: labels.toTarget }), _jsx(Button, { tone: "secondary", disabled: selection.target.size === 0, onPress: () => move("toSource"), children: labels.toSource })] }), _jsx(Text, { variant: "label", children: labels.target }), renderPanel("target")] }));
}
//# sourceMappingURL=transfer-list.js.map