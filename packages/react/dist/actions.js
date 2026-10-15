import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { buttonRecipe, } from "@hjmds/design-contracts/recipes/base";
import { iconButtonRecipe, linkRecipe, } from "@hjmds/design-contracts/recipes";
import { Children, forwardRef, } from "react";
import { classNames } from "./internal.js";
export const Button = forwardRef(function Button({ tone = buttonRecipe.defaults.tone, size = buttonRecipe.defaults.size, shape = buttonRecipe.defaults.shape, align = buttonRecipe.defaults.align, selected, loading = false, completion, leading, trailing, disabled, onClick, type = "button", className, children, layoutStyle, style, ...props }, ref) {
    const textParts = completion ? Children.toArray(children) : [];
    if (completion && (!completion.label.trim() || typeof completion.confirmed !== "boolean" || textParts.length === 0 || !textParts.every(part => typeof part === "string" || typeof part === "number"))) {
        throw new TypeError("Button completion requires a nonempty label, a boolean confirmed value and text-only children");
    }
    const idleLabel = completion ? textParts.join("") : children;
    const currentLabel = completion?.confirmed && !loading ? completion.label : idleLabel;
    // Preserve a focusable disabled action (e.g. a Carousel boundary).
    const ariaDisabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
    const unavailable = disabled === true || loading || ariaDisabled;
    const handleClick = (event) => {
        if (unavailable) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        onClick?.(event);
    };
    return (_jsxs("button", { ...props, 
        // The cap lives in the recipe, not in the stylesheet: one number, one place.
        style: { "--hjm-button-label-lines": buttonRecipe.label.maxLines, ...style, ...layoutStyle }, ref: ref, type: type, className: classNames("hjm-button", className), "data-tone": tone, "data-size": size, "data-shape": shape, "data-align": align, ...(selected === undefined ? {} : { "data-selected": selected, "aria-pressed": selected }), "data-state": loading ? "loading" : unavailable ? "disabled" : "idle", "aria-busy": loading || undefined, "aria-disabled": unavailable || undefined, disabled: disabled, onClick: handleClick, children: [leading, completion ? _jsxs("span", { style: { display: "inline-grid", minWidth: 0 }, children: [_jsx("span", { "aria-hidden": "true", className: "hjm-button__label", style: { gridArea: "1 / 1", visibility: "hidden" }, children: idleLabel }), _jsx("span", { "aria-hidden": "true", className: "hjm-button__label", style: { gridArea: "1 / 1", visibility: "hidden" }, children: completion.label }), _jsx("span", { className: "hjm-button__label", style: { gridArea: "1 / 1", alignSelf: "center" }, children: currentLabel })] }) : _jsx("span", { className: "hjm-button__label", children: children }), trailing, loading ? _jsx("span", { className: "hjm-button__loading-indicator", "aria-hidden": "true", children: _jsx("span", { className: "hjm-button__spinner" }) }) : null] }));
});
export const IconButton = forwardRef(function IconButton({ label, tone = iconButtonRecipe.defaults.tone, size = iconButtonRecipe.defaults.size, shape = iconButtonRecipe.defaults.shape, selected, loading = false, disabled, onClick, type = "button", className, children, layoutStyle, style, ...props }, ref) {
    // Preserve a focusable disabled action (e.g. a Carousel boundary).
    const ariaDisabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
    const unavailable = disabled === true || loading || ariaDisabled;
    const handleClick = (event) => {
        if (unavailable) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        onClick?.(event);
    };
    return (_jsx("button", { ...props, style: { ...style, ...layoutStyle }, ref: ref, type: type, className: classNames("hjm-icon-button", className), "data-tone": tone, "data-size": size, "data-shape": shape, ...(selected === undefined ? {} : { "data-selected": selected, "aria-pressed": selected }), "data-state": loading ? "loading" : unavailable ? "disabled" : "idle", "aria-label": label, "aria-busy": loading || undefined, "aria-disabled": unavailable || undefined, disabled: disabled, onClick: handleClick, children: loading ? _jsx("span", { className: "hjm-button__spinner", "aria-hidden": "true" }) : children }));
});
export const Link = forwardRef(function Link({ tone = linkRecipe.defaults.tone, variant = linkRecipe.defaults.variant, disabled = false, leading, trailing, renderAnchor, target, rel, tabIndex, onClick, className, children, layoutStyle, ...props }, ref) {
    const handleClick = (event) => {
        if (disabled) {
            event.preventDefault();
            return;
        }
        onClick?.(event);
    };
    const anchorProps = {
        ...props,
        // `renderAnchor` adapters receive the merged placement, so a framework Link
        // gets the same position as the plain <a>.
        ...(props.style === undefined && layoutStyle === undefined ? {} : { style: { ...props.style, ...layoutStyle } }),
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