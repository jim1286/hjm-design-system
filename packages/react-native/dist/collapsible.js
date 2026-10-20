import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { collapsibleRecipe, validateCollapsibleOpenState, } from "@hjmds/design-contracts/components/collapsible";
import { useState } from "react";
import { control, glyph } from "@hjmds/design-contracts/foundations";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import { Spinner } from "./internal/spinner.js";
import { useHjmNativeTheme } from "./provider.js";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Collapsible({ trigger, triggerLabel, title, pendingLabel, children, disabled = false, presentation = "disclosure", keepMounted = false, marker = "end", layoutStyle, ...openState }) {
    validateCollapsibleOpenState(openState);
    const controlled = openState.open !== undefined;
    const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
    const open = presentation === "inline" || (openState.open ?? internalOpen);
    const contentOpen = open && pendingLabel === undefined;
    return (_jsxs(View, { accessibilityState: pendingLabel === undefined ? undefined : { busy: true }, style: [{ gap: collapsibleRecipe.gap }, layoutStyle], children: [_jsxs(View, { style: { display: presentation === "inline" ? "none" : "flex", flexDirection: "row", alignItems: "center", gap: collapsibleRecipe.gap, minHeight: control.minTouchTarget }, children: [title == null ? null : _jsx(View, { style: { flex: 1 }, children: title }), pendingLabel === undefined ? _jsxs(Pressable, { accessibilityRole: "button", accessibilityLabel: triggerLabel, accessibilityState: { expanded: open, disabled }, disabled: disabled, onPress: () => {
                            if (disabled || presentation === "inline")
                                return;
                            const next = !open;
                            if (!controlled)
                                setInternalOpen(next);
                            openState.onOpenChange?.(next);
                        }, 
                        // The trigger is the only control here, so it keeps the shared 44 target like Web
                        // `.hjm-collapsible__trigger`; a one-line text trigger was ~20 tall (2026-10-06 follow-up).
                        style: { display: presentation === "inline" ? "none" : "flex", flex: title == null ? 1 : undefined, minHeight: control.minTouchTarget, minWidth: control.minTouchTarget, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: collapsibleRecipe.gap }, children: [typeof trigger === "string" ? _jsx(Text, { fontRole: "ui", children: trigger }) : trigger, marker === "end" ? _jsx(CollapsibleMarker, { open: open }) : null] }) : _jsx(View, { style: { minWidth: control.minTouchTarget, minHeight: control.minTouchTarget, flex: title == null ? 1 : undefined, alignItems: "center", justifyContent: "center" }, children: _jsx(Spinner, { label: pendingLabel, size: "small" }) })] }), contentOpen || keepMounted ? _jsx(View, { accessibilityElementsHidden: !contentOpen, importantForAccessibility: contentOpen ? "auto" : "no-hide-descendants", style: { display: contentOpen ? "flex" : "none" }, children: children }) : null] }));
}
/** Decoration only: the expanded state travels through the trigger's accessibilityState. */
export function CollapsibleMarker({ open }) {
    const { colors } = useHjmNativeTheme();
    // Web's chevron at glyph.sm replaced a text "▸" that rendered about 8pt (2026-10-17 review). DrawnChevron's
    // `end` points toward the reading end, so the closed mark mirrors in RTL.
    return _jsx(DrawnChevron, { direction: open ? "down" : "end", size: glyph.sm, color: colors.textMuted });
}
//# sourceMappingURL=collapsible.js.map