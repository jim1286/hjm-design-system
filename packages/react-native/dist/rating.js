import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, View } from "react-native";
import { resolveRating } from "@hjmds/design-contracts/reference-controls";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import { Text } from "./primitives.js";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
function Star({ fraction }) {
    const { colors } = useHjmNativeTheme();
    return _jsxs(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "relative" }, children: [_jsx(Text, { style: { fontSize: 28, lineHeight: 36, color: colors.contentBrand }, children: "\u2606" }), _jsx(View, { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: `${fraction * 100}%`, overflow: "hidden" }, children: _jsx(Text, { style: { fontSize: 28, lineHeight: 36, color: colors.contentBrand }, children: "\u2605" }) })] });
}
export function Rating(props) {
    const { label, value, readOnly = false, disabled = false, getValueLabel, clearLabel } = props;
    const { max, fractions } = resolveRating(props);
    const { environment, colors } = useHjmNativeTheme();
    const valueLabel = getValueLabel(value);
    if (!valueLabel.trim() || (clearLabel !== undefined && !clearLabel.trim()))
        throw new TypeError("Rating text must not be empty");
    const row = { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, direction: environment.direction };
    if (readOnly)
        return _jsxs(View, { accessible: true, accessibilityRole: "image", accessibilityLabel: `${label}: ${valueLabel}`, style: row, children: [fractions.map((fraction, index) => _jsx(Star, { fraction: fraction }, index)), _jsx(Text, { accessible: false, children: valueLabel })] });
    return _jsxs(View, { style: { gap: spacing.xs }, children: [_jsx(Text, { variant: "label", children: label }), _jsx(View, { accessibilityRole: "radiogroup", accessibilityLabel: label, style: row, children: Array.from({ length: max }, (_, index) => {
                    const score = index + 1;
                    const optionLabel = getValueLabel(score);
                    if (!optionLabel.trim())
                        throw new TypeError("Rating option text must not be empty");
                    return _jsx(Pressable, { accessibilityRole: "radio", accessibilityLabel: optionLabel, accessibilityState: { checked: value === score, disabled }, disabled: disabled, onPress: () => { if (!disabled)
                            props.onValueChange?.(score); }, style: ({ pressed }) => ({ minWidth: control.minTouchTarget, minHeight: control.minTouchTarget, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: value === score ? colors.contentBrand : colors.border, opacity: disabled ? 0.5 : pressed ? 0.7 : 1 }), children: _jsx(Star, { fraction: fractions[index] }) }, score);
                }) }), _jsx(Text, { accessibilityLiveRegion: "polite", children: valueLabel }), clearLabel ? _jsx(Button, { tone: "ghost", disabled: disabled || value === null, onPress: () => props.onValueChange?.(null), children: clearLabel }) : null] });
}
//# sourceMappingURL=rating.js.map