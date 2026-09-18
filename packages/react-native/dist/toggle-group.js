import { jsx as _jsx } from "react/jsx-runtime";
import { reconcileToggleGroupSelection, toggleGroupRecipe, toggleGroupSelection, validateToggleGroupDescriptor, } from "@hjmds/design-contracts/components/toggle-group";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function ToggleGroup({ descriptor, pressedIds: controlledPressed, defaultPressedIds, onPressedIdsChange, size = toggleGroupRecipe.defaults.size, style, }) {
    validateToggleGroupDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    const [internal, setInternal] = useState(defaultPressedIds ?? new Set());
    const raw = controlledPressed ?? internal;
    const pressed = useMemo(() => reconcileToggleGroupSelection(descriptor, raw), [descriptor, raw]);
    const metrics = toggleGroupRecipe.sizes[size];
    const commit = (next) => {
        if (controlledPressed === undefined)
            setInternal(next);
        onPressedIdsChange?.(next);
    };
    return (_jsx(View, { accessibilityLabel: descriptor.accessibilityLabel, style: [{ flexDirection: "row", flexWrap: "wrap", gap: toggleGroupRecipe.gap }, style], children: descriptor.items.map((item) => {
            const on = pressed.has(item.id);
            const tone = on ? toggleGroupRecipe.pressed : toggleGroupRecipe.idle;
            return (_jsx(Pressable, { accessibilityRole: "button", 
                // Native announces a toggle through `selected`, the counterpart of
                // aria-pressed; colour alone would say nothing.
                accessibilityState: { disabled: item.disabled === true, selected: on }, disabled: item.disabled === true, onPress: () => commit(toggleGroupSelection(descriptor, pressed, item.id)), style: {
                    alignItems: "center",
                    backgroundColor: resolveColorReference(tone.background, theme.palette),
                    borderColor: resolveColorReference(tone.border, theme.palette),
                    borderRadius: toggleGroupRecipe.radius,
                    borderWidth: 1,
                    justifyContent: "center",
                    minHeight: metrics.minHeight,
                    opacity: item.disabled === true ? 0.5 : 1,
                    paddingHorizontal: metrics.paddingHorizontal,
                }, children: _jsx(Text, { style: { color: resolveColorReference(tone.color, theme.palette) }, variant: metrics.textVariant, children: item.label }) }, item.id));
        }) }));
}
//# sourceMappingURL=toggle-group.js.map