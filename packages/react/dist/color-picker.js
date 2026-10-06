import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useState } from "react";
import { colorPickerRecipe, normalizePickerColor, pickerOpacity, withPickerOpacity } from "@hjmds/design-contracts/components/color-picker";
/** Controlled value; invalid text stays local until corrected or escaped. Native color UI supplies RGB only. */
export function ColorPicker({ label, labels, value, onValueChange, alpha = false, disabled = false, presets = [], layoutStyle }) {
    const color = normalizePickerColor(value, alpha);
    // HEX is an ordered code, so isolate its LTR text even when the surrounding labels use RTL.
    const palette = [...new Set(presets.map(preset => normalizePickerColor(preset, alpha)))];
    if (![label, ...Object.values(labels)].every(text => text.trim()))
        throw new TypeError("ColorPicker labels must not be empty");
    const id = useId();
    const [draft, setDraft] = useState(color);
    const [invalid, setInvalid] = useState(false);
    useEffect(() => { setDraft(color); setInvalid(false); }, [color]);
    function emit(next) { setDraft(next); setInvalid(false); if (next !== color)
        onValueChange(next); }
    function commit() {
        let next;
        try {
            // A typed 3/6-digit HEX names only the hue. Keep the current opacity instead of resetting it to 100%,
            // matching the native color input; an 8-digit HEX still sets alpha explicitly (2026-09-30 review).
            const digits = draft.trim().replace(/^#/, "").length;
            next = alpha && (digits === 3 || digits === 6) ? normalizePickerColor(draft, false) + color.slice(7) : normalizePickerColor(draft, alpha);
        }
        catch {
            setInvalid(true);
            return;
        }
        emit(next);
    }
    return _jsxs("fieldset", { className: "hjm-color-picker", style: { ...layoutStyle, "--hjm-color-picker-target": `${colorPickerRecipe.minTargetSize}px` }, "data-hjm-color-picker": true, disabled: disabled, children: [_jsx("legend", { children: label }), _jsxs("div", { className: "hjm-color-picker__row", children: [_jsxs("label", { className: "hjm-color-picker__native", children: [_jsx("span", { children: labels.color }), _jsx("input", { type: "color", value: color.slice(0, 7), onChange: event => emit(event.target.value + (alpha ? color.slice(7) : "")) })] }), _jsxs("label", { className: "hjm-color-picker__hex", children: [_jsx("span", { children: labels.hex }), _jsx("input", { type: "text", dir: "ltr", value: draft, spellCheck: false, autoComplete: "off", "aria-invalid": invalid || undefined, "aria-describedby": invalid ? `${id}-error` : undefined, onChange: event => { setDraft(event.target.value); setInvalid(false); }, onBlur: commit, onKeyDown: event => { if (event.key === "Enter") {
                                    event.preventDefault();
                                    commit();
                                } if (event.key === "Escape") {
                                    event.preventDefault();
                                    setDraft(color);
                                    setInvalid(false);
                                } } })] })] }), invalid && _jsx("p", { id: `${id}-error`, role: "alert", className: "hjm-color-picker__error", children: labels.invalid }), alpha && _jsxs("label", { className: "hjm-color-picker__opacity", children: [_jsxs("span", { children: [labels.opacity, " ", _jsxs("output", { children: [pickerOpacity(color), "%"] })] }), _jsx("input", { type: "range", min: 0, max: 100, step: 1, value: pickerOpacity(color), "aria-label": labels.opacity, "aria-valuetext": `${pickerOpacity(color)}%`, onChange: event => emit(withPickerOpacity(color, Number(event.target.value))) })] }), _jsx("div", { className: "hjm-color-picker__preview", "aria-hidden": "true", style: { backgroundColor: color } }), palette.length > 0 && _jsx("div", { className: "hjm-color-picker__presets", children: palette.map(preset => _jsxs("button", { type: "button", "aria-pressed": preset === color, onClick: () => emit(preset), children: [_jsx("span", { "aria-hidden": "true", className: "hjm-color-picker__swatch", style: { backgroundColor: preset } }), _jsx("bdi", { dir: "ltr", children: preset })] }, preset)) })] });
}
//# sourceMappingURL=color-picker.js.map