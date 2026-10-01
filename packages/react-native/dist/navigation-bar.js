import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from "react-native";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "./provider.js";
/** Adaptive site header; destination and action children keep their own semantics. */
export function NavigationBar({ label, brand, children, actions }) {
    const { colors, environment } = useHjmNativeTheme();
    if (!label.trim())
        throw new TypeError("NavigationBar requires an accessible label");
    // Core RN has no portable backdrop blur. Use a solid semantic surface instead
    // of adding a mandatory native blur dependency or faking unreadable transparency.
    return _jsxs(View, { accessible: false, accessibilityLabel: label, style: { direction: environment.direction, gap: spacing.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.surface }, children: [_jsxs(View, { style: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.md }, children: [brand, _jsx(View, { style: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.xs, flexGrow: 1, flexShrink: 1 }, children: children })] }), actions && _jsx(View, { style: { gap: spacing.xs }, children: actions })] });
}
//# sourceMappingURL=navigation-bar.js.map