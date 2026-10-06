import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Shared by feedback and screen shells without pulling unrelated feedback UI
// into the lightweight screens entry. The public import remains /feedback.
import { forwardRef } from "react";
import { spinnerRecipe } from "@hjmds/design-contracts/recipes";
import { classNames } from "../internal.js";
export const Spinner = forwardRef(function Spinner({ label, size = spinnerRecipe.defaults.size, tone = spinnerRecipe.defaults.tone, className, layoutStyle, ...props }, ref) {
    return (_jsxs("span", { ...props, style: { ...props.style, ...layoutStyle }, ref: ref, className: classNames("hjm-spinner", className), "data-size": size, "data-tone": tone, role: "status", "aria-live": "polite", children: [_jsx("span", { className: "hjm-spinner__glyph", "aria-hidden": "true" }), _jsx("span", { className: "hjm-visually-hidden", children: label })] }));
});
//# sourceMappingURL=spinner.js.map