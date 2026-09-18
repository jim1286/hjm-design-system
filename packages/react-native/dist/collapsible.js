import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { collapsibleRecipe, validateCollapsibleOpenState, } from "@hjmds/design-contracts/components/collapsible";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
export function Collapsible({ trigger, children, disabled = false, style, ...openState }) {
    validateCollapsibleOpenState(openState);
    const controlled = openState.open !== undefined;
    const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
    const open = openState.open ?? internalOpen;
    return (_jsxs(View, { style: [{ gap: collapsibleRecipe.gap }, style], children: [_jsxs(Pressable, { accessibilityRole: "button", accessibilityState: { expanded: open, disabled }, disabled: disabled, onPress: () => {
                    const next = !open;
                    if (!controlled)
                        setInternalOpen(next);
                    openState.onOpenChange?.(next);
                }, style: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: collapsibleRecipe.gap }, children: [typeof trigger === "string" ? _jsx(Text, { children: trigger }) : trigger, _jsx(Text, { accessibilityElementsHidden: true, importantForAccessibility: "no", children: open ? "▾" : "▸" })] }), open ? _jsx(View, { children: children }) : null] }));
}
//# sourceMappingURL=collapsible.js.map