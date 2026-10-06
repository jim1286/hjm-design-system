import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { resolveRating } from "@hjmds/design-contracts/reference-controls";
import { Button } from "./actions.js";
function Star({ fraction }) {
    return _jsxs("span", { "aria-hidden": "true", style: { pointerEvents: "none", position: "relative", display: "inline-block", fontSize: "1.75em", lineHeight: 1, color: "var(--hjm-color-content-brand, currentColor)" }, children: [_jsx("span", { children: "\u2606" }), _jsx("span", { style: { position: "absolute", inset: 0, width: `${fraction * 100}%`, overflow: "hidden" }, children: "\u2605" })] });
}
/** Controlled score input, with a distinct non-interactive average representation. */
export function Rating(props) {
    const { label, value, readOnly = false, disabled = false, getValueLabel, clearLabel, name } = props;
    const { max, fractions } = resolveRating(props);
    const id = useId();
    const valueLabel = getValueLabel(value);
    if (!valueLabel.trim() || (clearLabel !== undefined && !clearLabel.trim()))
        throw new TypeError("Rating text must not be empty");
    const row = { display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-xs)" };
    if (readOnly)
        return _jsxs("div", { role: "img", "aria-label": `${label}: ${valueLabel}`, style: row, children: [fractions.map((fraction, index) => _jsx(Star, { fraction: fraction }, index)), _jsx("span", { "aria-hidden": "true", children: valueLabel })] });
    return _jsxs("fieldset", { className: "hjm-rating-control", disabled: disabled, style: { border: 0, margin: 0, padding: 0, minWidth: 0 }, children: [_jsx("legend", { children: label }), _jsx("div", { style: row, children: Array.from({ length: max }, (_, index) => {
                    const score = index + 1;
                    const optionLabel = getValueLabel(score);
                    if (!optionLabel.trim())
                        throw new TypeError("Rating option text must not be empty");
                    return _jsxs("label", { className: "hjm-rating__option", children: [_jsx("input", { type: "radio", name: name ?? id, value: score, checked: value === score, "aria-label": optionLabel, onChange: () => { if (!disabled)
                                    props.onValueChange?.(score); } }), _jsx(Star, { fraction: fractions[index] })] }, score);
                }) }), _jsx("div", { role: "status", children: valueLabel }), clearLabel ? _jsx(Button, { tone: "ghost", disabled: disabled || value === null, onClick: () => props.onValueChange?.(null), children: clearLabel }) : null] });
}
//# sourceMappingURL=rating.js.map