import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { topDefaults, topRecipe, validateTopDescriptor, } from "@hjmds/design-contracts/components/top";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Top({ descriptor, trailing, layoutStyle }) {
    validateTopDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    const size = descriptor.size ?? topDefaults.size;
    const metrics = topRecipe.sizes[size];
    // Match the Web visual role without coupling it to the document heading level.
    const title = theme.designProfile
        ? size === "large" ? theme.designProfile.tokens.heading.level3 : theme.tokens.typography.titleLarge
        : metrics.title;
    // Large text stacks the trailing action instead of squeezing the title, the
    // same rule Section already applies to its own header row.
    const stack = theme.environment.textScale >= 1.6;
    return (_jsxs(View, { style: [
            { gap: topRecipe.gap, paddingBottom: metrics.paddingBottom, paddingTop: metrics.paddingTop },
            layoutStyle,
        ], children: [descriptor.eyebrow ? (_jsx(Text, { style: { color: resolveColorReference(topRecipe.eyebrow.color, theme.palette) }, variant: topRecipe.eyebrow.textVariant, children: descriptor.eyebrow })) : null, _jsxs(View, { style: {
                    alignItems: stack ? "stretch" : "center",
                    flexDirection: stack ? "column" : "row",
                    gap: topRecipe.trailing.gap,
                }, children: [_jsx(Text, { accessibilityRole: "header", style: {
                            color: resolveColorReference(topRecipe.title.color, theme.palette),
                            // Web `flex: 1 1 auto`; RN `flex: 1` has a 0 basis, which collapsed the title inside a centred
                            // hero and wrapped it early (2026-10-17 comparison).
                            ...(stack ? {} : { flexGrow: 1, flexShrink: 1 }),
                            fontSize: title.fontSize,
                            fontWeight: title.fontWeight,
                            lineHeight: title.lineHeight,
                        }, children: descriptor.title }), trailing ? _jsx(View, { children: trailing }) : null] }), descriptor.description ? (_jsx(Text, { style: { color: resolveColorReference(topRecipe.description.color, theme.palette) }, variant: topRecipe.description.textVariant, children: descriptor.description })) : null] }));
}
//# sourceMappingURL=top.js.map