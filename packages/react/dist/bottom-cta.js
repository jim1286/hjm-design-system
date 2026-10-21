import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { bottomCtaRecipe, actionGroupRecipe } from "@hjmds/design-contracts/recipes";
import { isLargeTextScale } from "@hjmds/design-contracts/components/design-system-provider";
import { forwardRef, useContext } from "react";
import { Button } from "./actions.js";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
import { ScreenFooterContext } from "./internal/screen-footer.js";
function Action({ action, tone }) {
    if (!action.label.trim())
        throw new TypeError("BottomCTA action label must not be empty");
    const type = action.type ?? "button";
    if (type === "button" && !action.onClick)
        throw new TypeError("BottomCTA button action requires onClick");
    return _jsx(Button, { ref: action.buttonRef, type: type, form: action.form, onClick: action.onClick, tone: action.tone ?? tone, size: action.size ?? "medium", disabled: action.disabled, loading: action.loading ?? false, leading: action.leading, trailing: action.trailing, "aria-label": action.loading ? action.loadingLabel ?? action.accessibilityLabel ?? action.label : action.accessibilityLabel, children: action.label });
}
function isAction(value) {
    return typeof value === "object" && value !== null && "label" in value && typeof value.label === "string";
}
/** One primary action with optional supporting copy and a secondary action, matching Native's slots. */
export const BottomCTA = forwardRef(function BottomCTA({ primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom = 0, position = "flow", className, style, layoutStyle, ...props }, ref) {
    const theme = useOptionalHjmTheme();
    const inScreenFooter = useContext(ScreenFooterContext);
    if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0)
        throw new RangeError("BottomCTA safeAreaBottom must be non-negative");
    return _jsxs("div", { ...props, ref: ref, role: "group", "aria-label": accessibilityLabel, className: classNames("hjm-bottom-cta", className), "data-position": position, "data-placement": inScreenFooter ? "screen-footer" : undefined, "data-large-text": isLargeTextScale(theme?.environment.textScale ?? 1), style: {
            "--hjm-bottom-cta-min-height": `${bottomCtaRecipe.minHeight}px`,
            "--hjm-bottom-cta-padding-inline": `${bottomCtaRecipe.paddingHorizontal}px`,
            "--hjm-bottom-cta-padding-top": `${bottomCtaRecipe.paddingTop}px`,
            "--hjm-bottom-cta-padding-bottom": `${bottomCtaRecipe.paddingBottom}px`,
            "--hjm-bottom-cta-gap": `${bottomCtaRecipe.gap}px`,
            "--hjm-bottom-cta-actions-gap": `${actionGroupRecipe.inlineGap}px`,
            "--hjm-bottom-cta-content-max-width": `${bottomCtaRecipe.contentMaxWidth}px`,
            "--hjm-bottom-cta-safe-area": `${safeAreaBottom}px`, ...style, ...layoutStyle,
            "--hjm-bottom-cta-parent-padding": inScreenFooter?.bottomPadding ?? "0px",
        }, children: [description ? _jsx("p", { className: "hjm-bottom-cta__description", children: description }) : null, _jsxs("div", { className: "hjm-bottom-cta__actions", children: [secondaryAction == null ? null : _jsx("div", { className: "hjm-bottom-cta__secondary", children: isAction(secondaryAction) ? _jsx(Action, { action: secondaryAction, tone: "secondary" }) : secondaryAction }), _jsx("div", { className: "hjm-bottom-cta__primary", children: _jsx(Action, { action: primaryAction, tone: "primary" }) })] })] });
});
//# sourceMappingURL=bottom-cta.js.map