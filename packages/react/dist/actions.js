import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { buttonRecipe, resolveButtonDepth, } from "@hjmds/design-contracts/recipes/base";
import { iconButtonRecipe, linkRecipe, } from "@hjmds/design-contracts/recipes";
import { Children, useContext, forwardRef, } from "react";
import { DesignProfileContext, classNames } from "./internal.js";
// Both semantic hosts use the same recipe and product profile; navigation must not
// recreate button paint in a product or turn an anchor into a nested button.
function useButtonPaint(tone, size, suppliedShape, suppliedAppearance) {
    const profile = useContext(DesignProfileContext);
    const shape = suppliedShape ?? profile?.controls?.button?.shape ?? buttonRecipe.defaults.shape;
    const appearance = suppliedAppearance ?? profile?.controls?.button?.appearance ?? buttonRecipe.defaults.appearance;
    const depth = resolveButtonDepth(appearance, tone, size);
    const side = tone === "secondary" ? "var(--hjm-color-border-control)" : tone === "danger" ? "var(--hjm-color-danger-fill)" : "var(--hjm-color-primary)";
    return { shape, appearance, depth, style: {
            "--hjm-button-label-lines": buttonRecipe.label.maxLines,
            "--hjm-button-depth": `${depth}px`, "--hjm-button-side": side,
            "--hjm-button-side-shade": `${buttonRecipe.raised.sideShade * 100}%`,
            "--hjm-button-face-padding": `${buttonRecipe.sizes[size].paddingHorizontal}px`,
            "--hjm-button-settle": `${buttonRecipe.raised.settleDuration}ms`,
        } };
}
export const Button = forwardRef(function Button({ tone = buttonRecipe.defaults.tone, size = buttonRecipe.defaults.size, hitSlop, shape: suppliedShape, appearance: suppliedAppearance, fullWidth = false, align = buttonRecipe.defaults.align, selected, loading = false, completion, leading, trailing, edge, disabled, onClick, type = "button", className, children, layoutStyle, style, ...props }, ref) {
    const { shape, appearance, depth, style: paintStyle } = useButtonPaint(tone, size, suppliedShape, suppliedAppearance);
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
    const content = _jsxs(_Fragment, { children: [leading, completion ? _jsxs("span", { style: { display: "inline-grid", minWidth: 0 }, children: [_jsx("span", { "aria-hidden": "true", className: "hjm-button__label", style: { gridArea: "1 / 1", visibility: "hidden" }, children: idleLabel }), _jsx("span", { "aria-hidden": "true", className: "hjm-button__label", style: { gridArea: "1 / 1", visibility: "hidden" }, children: completion.label }), _jsx("span", { className: "hjm-button__label", style: { gridArea: "1 / 1", alignSelf: "center" }, children: currentLabel })] }) : _jsx("span", { className: "hjm-button__label", children: children }), trailing, loading ? _jsx("span", { className: "hjm-button__loading-indicator", "aria-hidden": "true", children: _jsx("span", { className: "hjm-button__spinner" }) }) : null] });
    return (_jsx("button", { ...props, 
        // The cap lives in the recipe, not in the stylesheet: one number, one place.
        style: { ...paintStyle, ...(hitSlop === undefined ? {} : { "--hjm-button-hit-slop": `${hitSlop}px` }), ...style, ...layoutStyle }, ref: ref, type: type, className: classNames("hjm-button", className), "data-tone": tone, "data-size": size, "data-shape": shape, "data-appearance": appearance, "data-raised": depth > 0 || undefined, "data-full-width": fullWidth || undefined, "data-align": align, "data-edge": edge, ...(selected === undefined ? {} : { "data-selected": selected, "aria-pressed": selected }), "data-state": loading ? "loading" : unavailable ? "disabled" : "idle", "aria-busy": loading || undefined, "aria-disabled": unavailable || undefined, disabled: disabled && !loading, onClick: handleClick, children: depth > 0 ? _jsx("span", { className: "hjm-button__face", children: content }) : content }));
});
export const ButtonLink = forwardRef(function ButtonLink({ href, disabled = false, tone = buttonRecipe.defaults.tone, size = buttonRecipe.defaults.size, shape: suppliedShape, appearance: suppliedAppearance, fullWidth = false, align = buttonRecipe.defaults.align, leading, trailing, edge, layoutStyle, children, className, style, onClick, onAuxClick, tabIndex, renderAnchor, ...props }, ref) {
    const { shape, appearance, depth, style: paintStyle } = useButtonPaint(tone, size, suppliedShape, suppliedAppearance);
    const unavailable = disabled || props["aria-disabled"] === true || props["aria-disabled"] === "true";
    const activate = (callback) => (event) => {
        if (unavailable) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        callback?.(event);
    };
    const content = _jsxs(_Fragment, { children: [leading, _jsx("span", { className: "hjm-button__label", children: children }), trailing] });
    const anchorProps = {
        ...props,
        ref,
        // Adapters must also receive no href while unavailable, including their framework's navigation path.
        href: unavailable ? undefined : href,
        role: unavailable ? "link" : props.role,
        "aria-disabled": unavailable || undefined,
        tabIndex: unavailable ? -1 : tabIndex,
        onClick: activate(onClick),
        onAuxClick: activate(onAuxClick),
        className: classNames("hjm-button", className),
        style: { ...paintStyle, ...style, ...layoutStyle },
        "data-tone": tone,
        "data-size": size,
        "data-shape": shape,
        "data-appearance": appearance,
        "data-raised": depth > 0 || undefined,
        "data-full-width": fullWidth || undefined,
        "data-align": align,
        "data-edge": edge,
        "data-state": unavailable ? "disabled" : "idle",
        children: depth > 0 ? _jsx("span", { className: "hjm-button__face", children: content }) : content,
    };
    return renderAnchor ? renderAnchor(anchorProps) : _jsx("a", { ...anchorProps });
});
export const IconButton = forwardRef(function IconButton({ label, tone = iconButtonRecipe.defaults.tone, size = iconButtonRecipe.defaults.size, hitSlop, shape = iconButtonRecipe.defaults.shape, selected, loading = false, edge, disabled, onClick, type = "button", className, children, layoutStyle, style, ...props }, ref) {
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
    return (_jsx("button", { ...props, style: { ...(hitSlop === undefined ? {} : { "--hjm-button-hit-slop": `${hitSlop}px` }), ...style, ...layoutStyle }, ref: ref, type: type, className: classNames("hjm-icon-button", className), "data-tone": tone, "data-size": size, "data-shape": shape, "data-edge": edge, ...(selected === undefined ? {} : { "data-selected": selected, "aria-pressed": selected }), "data-state": loading ? "loading" : unavailable ? "disabled" : "idle", "aria-label": label, "aria-busy": loading || undefined, "aria-disabled": unavailable || undefined, disabled: disabled, onClick: handleClick, children: loading ? _jsx("span", { className: "hjm-button__spinner", "aria-hidden": "true" }) : children }));
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