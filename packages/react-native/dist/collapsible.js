import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { collapsibleRecipe, validateCollapsibleOpenState, } from "@hjmds/design-contracts/components/collapsible";
import { useState } from "react";
import { control } from "@hjmds/design-contracts/foundations";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Collapsible({ trigger, children, disabled = false, presentation = "disclosure", keepMounted = false, marker = "end", layoutStyle, ...openState }) {
    validateCollapsibleOpenState(openState);
    const controlled = openState.open !== undefined;
    const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
    const open = presentation === "inline" || (openState.open ?? internalOpen);
    return (_jsxs(View, { style: [{ gap: collapsibleRecipe.gap }, layoutStyle], children: [_jsxs(Pressable, { accessibilityRole: "button", accessibilityState: { expanded: open, disabled }, disabled: disabled, onPress: () => {
                    if (disabled || presentation === "inline")
                        return;
                    const next = !open;
                    if (!controlled)
                        setInternalOpen(next);
                    openState.onOpenChange?.(next);
                }, 
                // The trigger is the only control here, so it keeps the shared 44 target like Web
                // `.hjm-collapsible__trigger`; a one-line text trigger was ~20 tall (2026-10-06 follow-up).
                style: { display: presentation === "inline" ? "none" : "flex", minHeight: control.minTouchTarget, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: collapsibleRecipe.gap }, children: [typeof trigger === "string" ? _jsx(Text, { fontRole: "ui", children: trigger }) : trigger, marker === "end" ? _jsx(CollapsibleMarker, { open: open }) : null] }), open || keepMounted ? _jsx(View, { accessibilityElementsHidden: !open, importantForAccessibility: open ? "auto" : "no-hide-descendants", style: { display: open ? "flex" : "none" }, children: children }) : null] }));
}
/** Decoration only: the expanded state travels through the trigger's accessibilityState. */
export function CollapsibleMarker({ open }) {
    const { environment } = useHjmNativeTheme();
    // The closed mark points toward the reading end, so it mirrors in RTL like Web's scaleX(-1).
    return _jsx(Text, { accessibilityElementsHidden: true, importantForAccessibility: "no", children: open ? "▾" : environment.direction === "rtl" ? "◂" : "▸" });
}
//# sourceMappingURL=collapsible.js.map