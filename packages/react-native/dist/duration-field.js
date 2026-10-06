import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { changeDurationUnit, resolveDuration } from "@hjmds/design-contracts/duration-field";
import { NumberField } from "./number-field.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function DurationField({ value, onValueChange, labels, min = 0, max, disabled = false, layoutStyle }) {
    const parts = resolveDuration(value, { min, max });
    const { environment } = useHjmNativeTheme();
    // Scale the field's wrapping basis with its text: two narrow columns clipped minute values at 200%.
    const fieldBasis = spacing.xxxl * 3 * environment.textScale;
    return _jsxs(View, { style: [layoutStyle, { gap: spacing.sm }], children: [_jsx(Text, { variant: "label", children: labels.label }), _jsx(View, { style: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md }, children: ["hours", "minutes", "seconds"].map(unit => _jsx(View, { style: { flexGrow: 1, flexBasis: fieldBasis }, children: _jsx(NumberField, { label: `${labels.label}, ${labels[unit]}`, min: 0, max: unit === "hours" ? Math.max(1, Math.floor(max / 3600)) : 59, value: parts[unit], disabled: disabled || (unit === "hours" && max < 3600), step: 1, incrementLabel: labels.increment(unit), decrementLabel: labels.decrement(unit), onValueChange: next => onValueChange(changeDurationUnit(value, unit, next, { min, max })) }) }, unit)) })] });
}
//# sourceMappingURL=duration-field.js.map