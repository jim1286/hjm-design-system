import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { topDefaults, topRecipe, validateTopDescriptor, } from "@hjmds/design-contracts/components/top";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Top({ descriptor, trailing, style }) {
    validateTopDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    const size = descriptor.size ?? topDefaults.size;
    const metrics = topRecipe.sizes[size];
    // Large text stacks the trailing action instead of squeezing the title, the
    // same rule Section already applies to its own header row.
    const stack = theme.environment.textScale >= 1.6;
    return (_jsxs(View, { style: [
            { gap: topRecipe.gap, paddingBottom: metrics.paddingBottom, paddingTop: metrics.paddingTop },
            style,
        ], children: [descriptor.eyebrow ? (_jsx(Text, { style: { color: resolveColorReference(topRecipe.eyebrow.color, theme.palette) }, variant: topRecipe.eyebrow.textVariant, children: descriptor.eyebrow })) : null, _jsxs(View, { style: {
                    alignItems: stack ? "stretch" : "center",
                    flexDirection: stack ? "column" : "row",
                    gap: topRecipe.trailing.gap,
                }, children: [_jsx(Text, { accessibilityRole: "header", style: {
                            color: resolveColorReference(topRecipe.title.color, theme.palette),
                            flex: stack ? undefined : 1,
                            fontSize: metrics.title.fontSize,
                            fontWeight: metrics.title.fontWeight,
                            lineHeight: metrics.title.lineHeight,
                        }, children: descriptor.title }), trailing ? _jsx(View, { children: trailing }) : null] }), descriptor.description ? (_jsx(Text, { style: { color: resolveColorReference(topRecipe.description.color, theme.palette) }, variant: topRecipe.description.textVariant, children: descriptor.description })) : null] }));
}
//# sourceMappingURL=top.js.map