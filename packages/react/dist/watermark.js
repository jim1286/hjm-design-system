import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { resolveWatermark } from "@hjmds/design-contracts/components/watermark";
/** React escapes all text; an inline SVG pattern avoids canvas, external requests and markup interpolation. */
export function Watermark({ text, children, tileWidth, tileHeight, rotate, opacity }) {
    const config = resolveWatermark(text, tileWidth, tileHeight, rotate, opacity);
    const id = `hjm-watermark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    return _jsxs("div", { className: "hjm-watermark", "data-hjm-watermark": true, children: [_jsx("div", { className: "hjm-watermark__content", children: children }), _jsxs("svg", { className: "hjm-watermark__overlay", "aria-hidden": "true", focusable: "false", width: "100%", height: "100%", children: [_jsx("defs", { children: _jsx("pattern", { id: id, width: config.width, height: config.height, patternUnits: "userSpaceOnUse", children: _jsx("g", { transform: `rotate(${config.rotate} ${config.width / 2} ${config.height / 2})`, opacity: config.opacity, fill: "currentColor", children: config.lines.map((line, index) => _jsx("text", { x: config.width / 2, y: config.height / 2, dy: `${(index - (config.lines.length - 1) / 2) * 1.2}em`, textAnchor: "middle", dominantBaseline: "middle", children: line }, index)) }) }) }), _jsx("rect", { width: "100%", height: "100%", fill: `url(#${id})` })] })] });
}
//# sourceMappingURL=watermark.js.map