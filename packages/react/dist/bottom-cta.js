import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { bottomCtaRecipe } from "@hjmds/design-contracts/recipes";
import { isLargeTextScale } from "@hjmds/design-contracts/components/design-system-provider";
import { forwardRef } from "react";
import { Button } from "./actions.js";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
function Action({ action, tone }) {
    if (!action.label.trim())
        throw new TypeError("BottomCTA action label must not be empty");
    return _jsx(Button, { onClick: action.onClick, tone: action.tone ?? tone, size: action.size ?? "medium", disabled: action.disabled, loading: action.loading ?? false, "aria-label": action.loading ? action.loadingLabel ?? action.accessibilityLabel ?? action.label : action.accessibilityLabel, children: action.label });
}
function isAction(value) {
    return typeof value === "object" && value !== null && "label" in value && "onClick" in value;
}
/** One primary action with optional supporting copy and a secondary action, matching Native's slots. */
export const BottomCTA = forwardRef(function BottomCTA({ primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom = 0, position = "flow", className, style, ...props }, ref) {
    const theme = useOptionalHjmTheme();
    if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0)
        throw new RangeError("BottomCTA safeAreaBottom must be non-negative");
    return _jsxs("div", { ...props, ref: ref, role: "group", "aria-label": accessibilityLabel, className: classNames("hjm-bottom-cta", className), "data-position": position, "data-large-text": isLargeTextScale(theme?.environment.textScale ?? 1), style: {
            "--hjm-bottom-cta-min-height": `${bottomCtaRecipe.minHeight}px`,
            "--hjm-bottom-cta-padding-inline": `${bottomCtaRecipe.paddingHorizontal}px`,
            "--hjm-bottom-cta-padding-top": `${bottomCtaRecipe.paddingTop}px`,
            "--hjm-bottom-cta-padding-bottom": `${bottomCtaRecipe.paddingBottom}px`,
            "--hjm-bottom-cta-gap": `${bottomCtaRecipe.gap}px`,
            "--hjm-bottom-cta-safe-area": `${safeAreaBottom}px`, ...style,
        }, children: [description ? _jsx("p", { className: "hjm-bottom-cta__description", children: description }) : null, _jsxs("div", { className: "hjm-bottom-cta__actions", children: [secondaryAction == null ? null : _jsx("div", { className: "hjm-bottom-cta__secondary", children: isAction(secondaryAction) ? _jsx(Action, { action: secondaryAction, tone: "secondary" }) : secondaryAction }), _jsx("div", { className: "hjm-bottom-cta__primary", children: _jsx(Action, { action: primaryAction, tone: "primary" }) })] })] });
});
//# sourceMappingURL=bottom-cta.js.map