import { jsx as _jsx } from "react/jsx-runtime";
import { headingRecipe, resolveHeadingSemanticLevel, validateHeadingDescriptor, } from "@hjmds/design-contracts/components/heading";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Heading({ level, semanticLevel, children, layoutStyle, style }) {
    warnDeprecatedStyleProps("Heading", { style }, "layoutStyle for placement and level for typography");
    const descriptor = {
        level,
        ...(semanticLevel === undefined ? {} : { semanticLevel }),
    };
    validateHeadingDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    const metrics = theme.designProfile?.tokens.heading[level] ?? headingRecipe.levels[level];
    return (_jsx(Text, { fontRole: "display", accessibilityRole: "header", "aria-level": resolveHeadingSemanticLevel(descriptor), style: [
            {
                color: resolveColorReference(headingRecipe.color, theme.palette),
                fontSize: metrics.fontSize,
                fontWeight: metrics.fontWeight,
                lineHeight: metrics.lineHeight,
            },
            style,
        ], ...(layoutStyle === undefined ? {} : { layoutStyle }), children: children }));
}
//# sourceMappingURL=heading.js.map