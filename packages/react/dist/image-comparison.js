import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveImageComparison } from "@hjmds/design-contracts/reference-controls";
import { Slider } from "./slider.js";
import { Image } from "./supplemental-display.js";
/** Reuse Slider for drag/keyboard/commit semantics. The image divider is a
 * visual projection, not a second competing gesture or focus target. */
export function ImageComparison(props) {
    const { before, after, label, value, onValueChange, getValueText, disabled = false } = props;
    const { aspectRatio, fraction } = resolveImageComparison(props);
    return _jsxs("div", { className: "hjm-image-comparison", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: "var(--hjm-space-sm)", flexWrap: "wrap" }, children: [_jsx("span", { children: before.label }), _jsx("span", { children: after.label })] }), _jsxs("div", { style: { position: "relative", aspectRatio, overflow: "hidden", direction: "ltr", background: "var(--hjm-color-surface-alt)" }, children: [_jsx(Image, { src: after.src, width: after.width, height: after.height, decorative: false, accessibilityLabel: after.label, style: { display: "block", width: "100%", height: "100%" } }), _jsx("div", { style: { position: "absolute", inset: 0, clipPath: `inset(0 ${100 - value}% 0 0)` }, children: _jsx(Image, { src: before.src, width: before.width, height: before.height, decorative: false, accessibilityLabel: before.label, style: { display: "block", width: "100%", height: "100%" } }) }), _jsx("div", { "aria-hidden": "true", style: { position: "absolute", top: 0, bottom: 0, left: `${fraction * 100}%`, borderInlineStart: "2px solid var(--hjm-color-border)", pointerEvents: "none" } })] }), _jsx(Slider, { label: label, min: 0, max: 100, step: 1, value: value, onValueChange: onValueChange, getValueText: getValueText, disabled: disabled })] });
}
//# sourceMappingURL=image-comparison.js.map