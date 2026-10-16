import { jsx as _jsx } from "react/jsx-runtime";
import { View } from "react-native";
import { screenExitRecipe } from "@hjmds/design-contracts/screen-patterns";
import { IconButton } from "../actions.js";
import { useHjmNativeTheme } from "../provider.js";
/** Drawn chevron/cross so back and close look identical on every platform and font. */
export function ScreenExitButton({ kind, label, onPress, disabled = false }) {
    const { colors, environment } = useHjmNativeTheme();
    const { chevronSize, closeSize, stroke } = screenExitRecipe;
    const rtl = environment.direction === "rtl";
    const glyph = kind === "back"
        ? _jsx(View, { style: { width: chevronSize, height: chevronSize, borderLeftWidth: stroke, borderBottomWidth: stroke, borderColor: colors.text, transform: [{ translateX: chevronSize / 4 * (rtl ? -1 : 1) }, { rotate: rtl ? "-135deg" : "45deg" }] } })
        : _jsx(View, { style: { width: closeSize, height: closeSize, alignItems: "center", justifyContent: "center" }, children: ["45deg", "-45deg"].map(rotate => _jsx(View, { style: { position: "absolute", width: closeSize * Math.SQRT2, height: stroke, borderRadius: stroke / 2, backgroundColor: colors.text, transform: [{ rotate }] } }, rotate)) });
    return _jsx(IconButton, { label: label, tone: "ghost", disabled: disabled, onPress: onPress, children: _jsx(View, { accessible: false, importantForAccessibility: "no-hide-descendants", children: glyph }) });
}
//# sourceMappingURL=screen-exit.js.map