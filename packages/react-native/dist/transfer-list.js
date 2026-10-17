import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { transferListRecipe, moveTransferListSelection, reconcileTransferListSelection, resolveTransferListPanels, resolveTransferListSelectAllState, toggleTransferListSelectAll, toggleTransferListSelection, validateTransferListDescriptor, } from "@hjmds/design-contracts/components/transfer-list";
import { reconcileCheckboxSelection } from "@hjmds/design-contracts/behaviors";
import { control, glyph, spacing } from "@hjmds/design-contracts/foundations";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { mixedCheckboxState, useControllableState } from "./internal/state.js";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
import { SelectionMark } from "./internal/selection-mark.js";
import { useHjmNativeTheme } from "./provider.js";
const emptySelection = () => ({
    source: new Set(),
    target: new Set(),
});
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function TransferList({ items, labels, targetKeys: controlledTargetKeys, defaultTargetKeys, onTargetKeysChange, onMove, layoutStyle, }) {
    const { colors, designProfile, palette, environment } = useHjmNativeTheme();
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
    const panelBorder = resolveColorReference(transferListRecipe.panel.border, palette);
    const renderPanel = (panel) => {
        const rows = panels[panel];
        const selectAll = resolveTransferListSelectAllState(descriptor, selection, panel);
        const title = panel === "source" ? labels.source : labels.target;
        // Same structure as Web: one bordered panel holding a [title | select-all] header and checkbox rows.
        return (_jsxs(View, { style: { backgroundColor: resolveColorReference(transferListRecipe.panel.background, palette), borderColor: panelBorder, borderRadius: corner, borderWidth: transferListRecipe.panel.borderWidth, overflow: "hidden" }, children: [_jsxs(View, { style: { alignItems: "center", borderBottomColor: panelBorder, borderBottomWidth: transferListRecipe.panel.borderWidth, direction: environment.direction, flexDirection: "row", gap: spacing.xs, minHeight: transferListRecipe.panelHeader.minHeight, paddingHorizontal: transferListRecipe.panelHeader.paddingHorizontal }, children: [_jsx(Text, { fontRole: "ui", emphasis: "strong", style: { flex: 1 }, variant: transferListRecipe.panelHeader.title.textVariant, children: title }), _jsx(Pressable, { accessibilityRole: "checkbox", 
                            // `mixed` is the contract's answer, not a third visual state invented
                            // here: some rows checked is neither on nor off.
                            // mixedCheckboxState keeps Android from holding a stale ", mixed" suffix.
                            accessibilityState: mixedCheckboxState(selectAll, { disabled: !rows.some(item => !item.disabled) }), accessibilityLabel: `${title}, ${labels.selectAll}`, disabled: !rows.some(item => !item.disabled), onPress: () => setSelection(toggleTransferListSelectAll(descriptor, selection, panel)), style: { alignItems: "center", justifyContent: "center", minHeight: control.minTouchTarget, minWidth: control.minTouchTarget }, children: _jsx(SelectionMark, { checked: selectAll }) })] }), _jsx(ScrollView, { accessibilityRole: "list", accessibilityLabel: title, contentContainerStyle: { padding: spacing.xxs, ...(rows.length === 0 ? { flexGrow: 1, justifyContent: "center", alignItems: "center" } : {}) }, children: rows.length === 0 ? (_jsx(Text, { tone: "muted", variant: transferListRecipe.emptyState.textVariant, align: "center", style: { padding: spacing.sm }, children: labels.empty })) : (rows.map((item) => {
                        const checked = selection[panel].has(item.id);
                        return (_jsxs(Pressable, { accessibilityRole: "checkbox", accessibilityLabel: item.label, accessibilityState: { checked, disabled: item.disabled === true }, disabled: item.disabled === true, onPress: () => setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id)), style: { alignItems: "center", direction: environment.direction, flexDirection: "row", gap: transferListRecipe.item.gap, minHeight: control.minTouchTarget, opacity: item.disabled ? 0.5 : 1, paddingHorizontal: transferListRecipe.item.paddingHorizontal }, children: [_jsx(SelectionMark, { checked: checked }), _jsx(Text, { fontRole: "ui", style: { flex: 1 }, children: item.label })] }, item.id));
                    })) })] }));
    };
    return (_jsxs(View, { style: [{ gap: spacing.md }, layoutStyle], children: [renderPanel("source"), _jsxs(View, { style: { alignItems: "stretch", gap: transferListRecipe.moveControls.gap }, children: [_jsx(Button, { tone: "secondary", disabled: !canMove("source"), onPress: () => move("toTarget"), leading: _jsx(DrawnChevron, { direction: "down", size: glyph.sm, color: colors.text }), children: labels.toTarget }), _jsx(Button, { tone: "secondary", disabled: !canMove("target"), onPress: () => move("toSource"), leading: _jsx(DrawnChevron, { direction: "up", size: glyph.sm, color: colors.text }), children: labels.toSource })] }), renderPanel("target")] }));
}
//# sourceMappingURL=transfer-list.js.map