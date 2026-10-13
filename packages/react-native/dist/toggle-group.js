import { jsx as _jsx } from "react/jsx-runtime";
import { reconcileToggleGroupSelection, toggleGroupRecipe, toggleGroupSelection, validateToggleGroupDescriptor, } from "@hjmds/design-contracts/components/toggle-group";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function ToggleGroup({ descriptor, pressedIds: controlledPressed, defaultPressedIds, onPressedIdsChange, size = toggleGroupRecipe.defaults.size, layoutStyle, }) {
    validateToggleGroupDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    const [internal, setInternal] = useState(defaultPressedIds ?? new Set());
    const raw = controlledPressed ?? internal;
    const pressed = useMemo(() => reconcileToggleGroupSelection(descriptor, raw), [descriptor, raw]);
    useEffect(() => {
        // Persist pruning so a removed toggle does not revive when the item returns.
        if (controlledPressed === undefined && pressed !== internal) {
            setInternal(pressed);
            onPressedIdsChange?.(pressed);
        }
    }, [controlledPressed, internal, onPressedIdsChange, pressed]);
    const metrics = toggleGroupRecipe.sizes[size];
    const commit = (next) => {
        if (controlledPressed === undefined)
            setInternal(next);
        onPressedIdsChange?.(next);
    };
    return (_jsx(View, { accessibilityLabel: descriptor.accessibilityLabel, style: [{ flexDirection: "row", flexWrap: "wrap", gap: toggleGroupRecipe.gap }, layoutStyle], children: descriptor.items.map((item) => {
            const on = pressed.has(item.id);
            const tone = on ? toggleGroupRecipe.pressed : toggleGroupRecipe.idle;
            return (_jsx(Pressable, { accessibilityRole: "button", 
                // Native announces a toggle through `selected`, the counterpart of
                // aria-pressed; colour alone would say nothing.
                accessibilityState: { disabled: item.disabled === true, selected: on }, disabled: item.disabled === true, onPress: () => commit(toggleGroupSelection(descriptor, pressed, item.id)), style: {
                    alignItems: "center",
                    backgroundColor: resolveColorReference(tone.background, theme.palette),
                    borderColor: resolveColorReference(tone.border, theme.palette),
                    // Keep the neutral recipe fallback; product shapes use the same md
                    // role as Web rather than freezing a second selection component.
                    borderRadius: theme.designProfile?.tokens.radius.md ?? toggleGroupRecipe.radius,
                    borderWidth: 1,
                    justifyContent: "center",
                    minHeight: metrics.minHeight,
                    opacity: item.disabled === true ? 0.5 : 1,
                    paddingHorizontal: metrics.paddingHorizontal,
                }, children: _jsx(Text, { fontRole: "ui", style: { color: resolveColorReference(tone.color, theme.palette) }, variant: metrics.textVariant, children: item.label }) }, item.id));
        }) }));
}
//# sourceMappingURL=toggle-group.js.map