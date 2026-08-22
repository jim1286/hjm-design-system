import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { buttonRecipe, } from "@hjm/design-contracts/recipes/base";
import { iconButtonRecipe, linkRecipe, } from "@hjm/design-contracts/recipes";
import { forwardRef, } from "react";
import { classNames } from "./internal.js";
export const Button = forwardRef(function Button({ tone = buttonRecipe.defaults.tone, size = buttonRecipe.defaults.size, loading = false, leading, trailing, disabled, onClick, type = "button", className, children, ...props }, ref) {
    const unavailable = disabled === true || loading;
    const handleClick = (event) => {
        if (loading) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        onClick?.(event);
    };
    return (_jsxs("button", { ...props, ref: ref, type: type, className: classNames("hjm-button", className), "data-tone": tone, "data-size": size, "data-state": loading ? "loading" : unavailable ? "disabled" : "idle", "aria-busy": loading || undefined, "aria-disabled": loading || undefined, disabled: disabled, onClick: handleClick, children: [loading ? _jsx("span", { className: "hjm-button__spinner", "aria-hidden": "true" }) : leading, _jsx("span", { className: "hjm-button__label", children: children }), trailing] }));
});
export const IconButton = forwardRef(function IconButton({ label, tone = iconButtonRecipe.defaults.tone, size = iconButtonRecipe.defaults.size, shape = iconButtonRecipe.defaults.shape, loading = false, disabled, onClick, type = "button", className, children, ...props }, ref) {
    const unavailable = disabled === true || loading;
    const handleClick = (event) => {
        if (loading) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        onClick?.(event);
    };
    return (_jsx("button", { ...props, ref: ref, type: type, className: classNames("hjm-icon-button", className), "data-tone": tone, "data-size": size, "data-shape": shape, "data-state": loading ? "loading" : unavailable ? "disabled" : "idle", "aria-label": label, "aria-busy": loading || undefined, "aria-disabled": loading || undefined, disabled: disabled, onClick: handleClick, children: loading ? _jsx("span", { className: "hjm-button__spinner", "aria-hidden": "true" }) : children }));
});
export const Link = forwardRef(function Link({ tone = linkRecipe.defaults.tone, variant = linkRecipe.defaults.variant, disabled = false, leading, trailing, renderAnchor, target, rel, tabIndex, onClick, className, children, ...props }, ref) {
    const handleClick = (event) => {
        if (disabled) {
            event.preventDefault();
            return;
        }
        onClick?.(event);
    };
    const anchorProps = {
        ...props,
        ref,
        className: classNames("hjm-link", className),
        "data-tone": tone,
        "data-variant": variant,
        "data-state": disabled ? "disabled" : "idle",
        "aria-disabled": disabled || undefined,
        tabIndex: disabled ? -1 : tabIndex,
        target,
        rel: rel ?? (target === "_blank" ? "noreferrer noopener" : undefined),
        onClick: handleClick,
        children: (_jsxs(_Fragment, { children: [leading, _jsx("span", { children: children }), trailing] })),
    };
    return renderAnchor ? renderAnchor(anchorProps) : _jsx("a", { ...anchorProps });
});
//# sourceMappingURL=actions.js.map