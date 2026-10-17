import { jsx as _jsx } from "react/jsx-runtime";
import { screenExitRecipe } from "@hjmds/design-contracts/screen-patterns";
import { IconButton } from "../actions.js";
/** Drawn chevron/cross (currentColor) so back and close match native; back mirrors in RTL via CSS. */
export function ScreenExitButton({ kind, label, onClick, disabled = false }) {
    const { chevronSize, closeSize, stroke } = screenExitRecipe;
    const size = kind === "back" ? chevronSize * 2 : closeSize;
    // Always on the header/row leading edge: the glyph slot sits on the gutter, the 44 target overhangs (iconButtonRecipe.edge).
    return _jsx(IconButton, { label: label, tone: "ghost", edge: "start", disabled: disabled, onClick: onClick, children: _jsx("svg", { className: "hjm-screen__exit-glyph", "data-kind": kind, "aria-hidden": "true", focusable: "false", width: size, height: size, viewBox: `0 0 ${size} ${size}`, fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", children: kind === "back" ? _jsx("path", { d: `M${size * 0.65} ${size * 0.15} L${size * 0.3} ${size / 2} L${size * 0.65} ${size * 0.85}` }) : _jsx("path", { d: `M1 1 L${size - 1} ${size - 1} M${size - 1} 1 L1 ${size - 1}` }) }) });
}
//# sourceMappingURL=screen-exit.js.map