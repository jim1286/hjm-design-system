import { jsx as _jsx } from "react/jsx-runtime";
// Shared by feedback and screen shells without pulling unrelated feedback UI
// into the lightweight screens entry. The public import remains /feedback.
import { ActivityIndicator, View } from "react-native";
import { useHjmNativeTheme } from "../provider.js";
import { warnDeprecatedStyleProps } from "./deprecated-style.js";
export function Spinner({ label, size = "small", style, layoutStyle }) {
    warnDeprecatedStyleProps("Spinner", { style }, "layoutStyle for placement and size for appearance");
    const { colors } = useHjmNativeTheme();
    return (_jsx(View, { accessibilityLabel: label, accessibilityRole: "progressbar", accessibilityState: { busy: true }, accessible: true, style: [{ alignItems: "center", justifyContent: "center" }, style, layoutStyle], children: _jsx(ActivityIndicator, { color: colors.contentBrand, size: size }) }));
}
//# sourceMappingURL=spinner.js.map