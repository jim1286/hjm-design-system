import { jsx as _jsx } from "react/jsx-runtime";
// Shared by feedback and screen shells without pulling unrelated feedback UI
// into the lightweight screens entry. The public import remains /feedback.
import { ActivityIndicator, View } from "react-native";
import { useHjmNativeTheme } from "../provider.js";
export function Spinner({ label, size = "small", layoutStyle }) {
    const { colors } = useHjmNativeTheme();
    return (_jsx(View, { accessibilityLabel: label, accessibilityRole: "progressbar", accessibilityState: { busy: true }, accessible: true, style: [{ alignItems: "center", justifyContent: "center" }, layoutStyle], children: _jsx(ActivityIndicator, { color: colors.contentBrand, size: size }) }));
}
//# sourceMappingURL=spinner.js.map