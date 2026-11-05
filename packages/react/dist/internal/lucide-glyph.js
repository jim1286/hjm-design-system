import { jsx as _jsx } from "react/jsx-runtime";
import { Check, Minus } from "lucide";
import { renderLucideNodes } from "../semantic-lucide.js";
/** A decorative Lucide mark in the current text color; the owning control carries the accessible name. */
export function LucideGlyph({ node, size = "1em", strokeWidth = 2, mirrored = false, filled = false, className }) {
    return _jsx("svg", { className: className ? `hjm-glyph ${className}` : "hjm-glyph", "data-mirror": mirrored || undefined, viewBox: "0 0 24 24", width: size, height: size, fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", children: renderLucideNodes(node) });
}
/** Checkbox contents: Lucide check, or minus for the mixed state; nothing when unchecked. */
export function CheckGlyph({ state }) {
    // A check is not direction-bearing (contracts `check` is fixed in RTL), so it never mirrors.
    return state === "mixed" ? _jsx(LucideGlyph, { node: Minus }) : state ? _jsx(LucideGlyph, { node: Check }) : null;
}
//# sourceMappingURL=lucide-glyph.js.map