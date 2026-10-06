import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { changeDurationUnit, resolveDuration } from "@hjmds/design-contracts/duration-field";
import { NumberField } from "./number-field.js";
/** A NumberField composition; value and limits always use whole seconds. */
export function DurationField({ value, onValueChange, labels, min = 0, max, disabled = false, className, layoutStyle }) {
    const parts = resolveDuration(value, { min, max });
    return _jsxs("fieldset", { className: className, disabled: disabled, style: { border: 0, margin: 0, padding: 0, minWidth: 0, ...layoutStyle }, children: [_jsx("legend", { style: { marginBlockEnd: "var(--hjm-space-sm)" }, children: labels.label }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 10ch), 1fr))", gap: "var(--hjm-space-md)" }, children: ["hours", "minutes", "seconds"].map(unit => _jsx(NumberField, { label: labels[unit], min: 0, max: unit === "hours" ? Math.max(1, Math.floor(max / 3600)) : 59, value: parts[unit], disabled: disabled || (unit === "hours" && max < 3600), step: 1, incrementLabel: labels.increment(unit), decrementLabel: labels.decrement(unit), onValueChange: next => onValueChange(changeDurationUnit(value, unit, next, { min, max })) }, unit)) })] });
}
//# sourceMappingURL=duration-field.js.map