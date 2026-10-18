import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { badgeRecipe, listRowRecipe, } from "@hjmds/design-contracts/recipes";
import { resolveTagDescriptor, } from "@hjmds/design-contracts/components/tag";
import { cardRecipe, } from "@hjmds/design-contracts/components/card";
import { surfaceGeometry, } from "@hjmds/design-contracts/recipes/base";
import { createElement, forwardRef, } from "react";
import { classNames } from "./internal.js";
import { useHjmDensityDefault } from "./provider.js";
import { Surface, Text } from "./layout.js";
export const Badge = forwardRef(function Badge({ tone = badgeRecipe.defaults.tone, size = badgeRecipe.defaults.size, variant = badgeRecipe.defaults.variant, leading, trailing, className, children, layoutStyle, style, ...props }, ref) {
    return (_jsxs("span", { ...props, style: { ...style, ...layoutStyle }, ref: ref, className: classNames("hjm-badge", className), "data-tone": tone, "data-size": size, "data-variant": variant, children: [leading === undefined ? null : (_jsx("span", { "aria-hidden": "true", className: "hjm-badge__icon", children: leading })), _jsx("span", { className: "hjm-badge__label", children: children }), trailing === undefined ? null : (_jsx("span", { "aria-hidden": "true", className: "hjm-badge__icon", children: trailing }))] }));
});
export const Tag = forwardRef(function Tag({ children, tone, className, layoutStyle, style, ...props }, ref) {
    const descriptor = resolveTagDescriptor({
        label: children,
        ...(tone === undefined ? {} : { tone }),
    });
    return (_jsx("span", { ...props, style: { ...style, ...layoutStyle }, ref: ref, className: classNames("hjm-tag", className), "data-tone": descriptor.tone, children: _jsx("span", { className: "hjm-tag__label", children: descriptor.label }) }));
});
export const Card = forwardRef(function Card({ title, description, leading, media, actions, headingLevel = cardRecipe.defaults.headingLevel, selected = cardRecipe.defaults.selected, onActivate, disabled = false, tone = cardRecipe.defaults.tone, bordered = cardRecipe.defaults.bordered, padding = cardRecipe.defaults.padding, radius, className, children, ...props }, ref) {
    if (onActivate && !props["aria-label"]?.trim()) {
        throw new TypeError("Interactive Card requires aria-label");
    }
    const hasHeader = leading !== undefined || title !== undefined || description !== undefined;
    // Whole-card open plus separate commands (2026-10-18 unairplane journey card: open + delete). A root button cannot
    // contain the action buttons, so the root stays an article and an overlay button carries the card's name and state.
    const overlay = onActivate !== undefined && Boolean(actions);
    const { "aria-label": activationLabel, ...rootProps } = props;
    const activate = () => { if (!disabled)
        onActivate?.(); };
    return (_jsxs(Surface, { ...(overlay ? rootProps : props), ref: ref, as: onActivate && !overlay ? "button" : "article", ...(onActivate && !overlay ? {
            type: "button", disabled, "aria-pressed": selected,
            "data-interactive": true, onClick: activate,
        } : {}), ...(overlay ? { "data-activation": "overlay" } : {}), tone: selected ? cardRecipe.selectedTone : tone, bordered: bordered, ...(radius === undefined ? {} : { radius }), className: classNames("hjm-card", className), "data-state": onActivate && disabled ? "disabled" : selected ? "selected" : "idle", style: { "--hjm-card-disabled-opacity": cardRecipe.interaction.disabledOpacity,
            "--hjm-card-pressed-opacity": cardRecipe.interaction.pressedOpacity, ...props.style }, children: [media ? _jsx("div", { className: "hjm-card__media", "data-slot": "media", children: media }) : null, _jsxs("div", { className: "hjm-card__body", "data-slot": "body", style: { padding: surfaceGeometry.paddings[padding] }, children: [hasHeader ? (_jsxs("div", { className: "hjm-card__header", "data-slot": "header", children: [leading === undefined ? null : (_jsx("span", { className: "hjm-card__leading", "data-slot": "leading", children: leading })), _jsxs("div", { className: "hjm-card__copy", children: [title === undefined
                                        ? null
                                        : createElement(`h${headingLevel}`, { className: "hjm-card__title", "data-slot": "title" }, title), description === undefined ? null : (_jsx(Text, { as: "p", tone: "muted", className: "hjm-card__description", "data-slot": "description", children: description }))] })] })) : null, children === undefined ? null : (_jsx("div", { className: "hjm-card__content", "data-slot": "content", children: children }))] }), overlay ? (_jsx("button", { type: "button", className: "hjm-card__activator", "data-slot": "activator", "aria-label": activationLabel, "aria-pressed": selected, disabled: disabled, onClick: activate })) : null, actions ? _jsx("div", { className: "hjm-card__actions", "data-slot": "actions", children: actions }) : null] }));
});
export const ListRow = forwardRef(function ListRow({ title, description, leading, trailing, trailingAction, renderLink, density: densityProp, tone = listRowRecipe.defaults.tone, leadingShape = "square", selected = listRowRecipe.defaults.selected, disabled = false, loading = false, loadingLabel, href, onClick, className, layoutStyle, style, ...props }, ref) {
    // The hook runs unconditionally — `??` would short-circuit it and break the
    // rules of hooks on the very first row that passes `density`.
    const densityDefault = useHjmDensityDefault({
        comfortable: listRowRecipe.defaults.density,
        compact: "compact",
    });
    const density = densityProp ?? densityDefault;
    if (loading) {
        // A loading row is never interactive: there is nothing to activate yet.
        return (_jsxs("div", { ...props, ref: ref, role: loadingLabel ? "status" : undefined, "aria-busy": loadingLabel ? true : undefined, "aria-hidden": loadingLabel ? undefined : true, "aria-label": loadingLabel, className: classNames("hjm-list-row", "hjm-list-row--loading", className), "data-density": density, "data-leading": leading ? "" : undefined, "data-lines": description ? "two" : "one", "data-state": "loading", style: { ...style, ...layoutStyle }, children: [leading ? _jsx("span", { className: "hjm-list-row__leading", "data-shape": leadingShape, "data-placeholder": "" }) : null, _jsxs("span", { className: "hjm-list-row__content", children: [_jsx("span", { className: "hjm-list-row__title", "data-placeholder": "", style: { width: `${listRowRecipe.loading.titleWidthPercent}%` } }), description ? _jsx("span", { className: "hjm-list-row__description", "data-placeholder": "", style: { width: `${listRowRecipe.loading.descriptionWidthPercent}%` } }) : null] }), trailing ? _jsx("span", { className: "hjm-list-row__trailing", "data-placeholder": "", style: { width: listRowRecipe.loading.trailingWidth } }) : null] }));
    }
    const element = href ? "a" : onClick ? "button" : "div";
    const interactiveProps = href
        ? {
            href: disabled ? undefined : href,
            "aria-current": selected ? "page" : undefined,
            "aria-disabled": disabled || undefined,
            tabIndex: disabled ? -1 : undefined,
        }
        : onClick
            ? {
                type: "button",
                onClick: disabled ? undefined : onClick,
                disabled,
                "aria-pressed": selected,
            }
            : {};
    const row = createElement(element, {
        ...props,
        ...interactiveProps,
        ref,
        className: classNames("hjm-list-row", className),
        "data-density": density,
        // Exposes the text column to the enclosing List: its indented separator starts after the leading frame
        // (listRecipe.separators.indented.leadingInsetStart) only when this row has one.
        "data-leading": leading ? "" : undefined,
        "data-tone": tone,
        // One- and two-line rows have different minimum heights in the recipe;
        // the web renderer used a single hardcoded value until now.
        "data-lines": description ? "two" : "one",
        "data-state": disabled ? "disabled" : selected ? "selected" : "idle",
        // Placement wins over the legacy `style`, matching Surface's ordering.
        // With trailingAction the frame is the placed root, as Native's outer View.
        style: trailingAction ? style : { ...style, ...layoutStyle },
    }, leading
        ? _jsx("span", { className: "hjm-list-row__leading", "data-shape": leadingShape, children: leading })
        : null, _jsxs("span", { className: "hjm-list-row__content", children: [_jsx("span", { className: "hjm-list-row__title", children: title }), description ? (_jsx("span", { className: "hjm-list-row__description", children: description })) : null] }), trailing ? _jsx("span", { className: "hjm-list-row__trailing", children: trailing }) : null);
    const linked = href && renderLink ? renderLink(row.props) : row;
    // The frame owns the row surface and its bleed so the command and the separate action share one fill, as Native;
    // the action stays outside the link/button (styles.css `.hjm-list-row-frame`).
    return trailingAction ? (_jsxs("div", { className: "hjm-list-row-frame", "data-density": density, "data-leading": leading ? "" : undefined, "data-state": disabled ? "disabled" : selected ? "selected" : "idle", style: layoutStyle, children: [linked, _jsx("div", { className: "hjm-list-row__action", children: trailingAction })] })) : linked;
});
//# sourceMappingURL=display.js.map