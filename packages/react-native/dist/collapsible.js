import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { collapsibleRecipe, validateCollapsibleOpenState, } from "@hjmds/design-contracts/components/collapsible";
import { useState } from "react";
import { control } from "@hjmds/design-contracts/foundations";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Collapsible({ trigger, children, disabled = false, presentation = "disclosure", keepMounted = false, layoutStyle, style, ...openState }) {
    warnDeprecatedStyleProps("Collapsible", { style }, "layoutStyle for placement; collapsibleRecipe owns appearance");
    validateCollapsibleOpenState(openState);
    const controlled = openState.open !== undefined;
    const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
    const open = presentation === "inline" || (openState.open ?? internalOpen);
    return (_jsxs(View, { style: [{ gap: collapsibleRecipe.gap }, style, layoutStyle], children: [_jsxs(Pressable, { accessibilityRole: "button", accessibilityState: { expanded: open, disabled }, disabled: disabled, onPress: () => {
                    const next = !open;
                    if (!controlled)
                        setInternalOpen(next);
                    openState.onOpenChange?.(next);
                }, 
                // The trigger is the only control here, so it keeps the shared 44 target like Web
                // `.hjm-collapsible__trigger`; a one-line text trigger was ~20 tall (2026-10-06 follow-up).
                style: { display: presentation === "inline" ? "none" : "flex", minHeight: control.minTouchTarget, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: collapsibleRecipe.gap }, children: [typeof trigger === "string" ? _jsx(Text, { fontRole: "ui", children: trigger }) : trigger, _jsx(Text, { accessibilityElementsHidden: true, importantForAccessibility: "no", children: open ? "▾" : "▸" })] }), open || keepMounted ? _jsx(View, { accessibilityElementsHidden: !open, importantForAccessibility: open ? "auto" : "no-hide-descendants", style: { display: open ? "flex" : "none" }, children: children }) : null] }));
}
//# sourceMappingURL=collapsible.js.map