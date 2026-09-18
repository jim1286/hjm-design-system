import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { bottomInfoRecipe, validateBottomInfoDescriptor, } from "@hjmds/design-contracts/components/bottom-info";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function BottomInfo({ items, tone = bottomInfoRecipe.defaults.tone, renderItem, style }) {
    validateBottomInfoDescriptor({ items, tone });
    const theme = useHjmNativeTheme();
    const color = resolveColorReference(bottomInfoRecipe.tones[tone], theme.palette);
    // One line reads as a sentence; several read as a list. A bullet on a single
    // line is noise, which is why the threshold lives in the recipe.
    const asList = items.length >= bottomInfoRecipe.listMarkerFrom;
    return (_jsx(View, { style: [{ gap: bottomInfoRecipe.gap, paddingTop: bottomInfoRecipe.paddingTop }, style], children: items.map((item, index) => (_jsxs(View, { style: { flexDirection: "row", gap: 4 }, children: [asList ? _jsx(Text, { style: { color }, variant: bottomInfoRecipe.textVariant, children: "\u00B7" }) : null, _jsx(Text, { style: { color, flex: 1 }, variant: bottomInfoRecipe.textVariant, children: renderItem?.(item, index) ?? item })] }, item))) }));
}
//# sourceMappingURL=bottom-info.js.map