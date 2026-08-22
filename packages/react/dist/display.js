import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { badgeRecipe, listRowRecipe, } from "@hjm/design-contracts/recipes";
import { resolveTagDescriptor, } from "@hjm/design-contracts/components/tag";
import { cardRecipe, } from "@hjm/design-contracts/components/card";
import { surfaceGeometry, } from "@hjm/design-contracts/recipes/base";
import { createElement, forwardRef, } from "react";
import { classNames } from "./internal.js";
import { Surface, Text } from "./layout.js";
export const Badge = forwardRef(function Badge({ tone = badgeRecipe.defaults.tone, size = badgeRecipe.defaults.size, variant = badgeRecipe.defaults.variant, leading, className, children, ...props }, ref) {
    return (_jsxs("span", { ...props, ref: ref, className: classNames("hjm-badge", className), "data-tone": tone, "data-size": size, "data-variant": variant, children: [leading === undefined ? null : (_jsx("span", { "aria-hidden": "true", className: "hjm-badge__icon", children: leading })), _jsx("span", { className: "hjm-badge__label", children: children })] }));
});
export const Tag = forwardRef(function Tag({ children, tone, className, ...props }, ref) {
    const descriptor = resolveTagDescriptor({
        label: children,
        ...(tone === undefined ? {} : { tone }),
    });
    return (_jsx("span", { ...props, ref: ref, className: classNames("hjm-tag", className), "data-tone": descriptor.tone, children: _jsx("span", { className: "hjm-tag__label", children: descriptor.label }) }));
});
export const Card = forwardRef(function Card({ title, description, media, actions, headingLevel = cardRecipe.defaults.headingLevel, selected = cardRecipe.defaults.selected, tone = cardRecipe.defaults.tone, bordered = cardRecipe.defaults.bordered, padding = cardRecipe.defaults.padding, radius, className, children, ...props }, ref) {
    return (_jsxs(Surface, { ...props, ref: ref, as: "article", tone: selected ? cardRecipe.selectedTone : tone, bordered: bordered, ...(radius === undefined ? {} : { radius }), className: classNames("hjm-card", className), "data-state": selected ? "selected" : "idle", children: [media ? _jsx("div", { className: "hjm-card__media", "data-slot": "media", children: media }) : null, _jsxs("div", { className: "hjm-card__body", "data-slot": "body", style: { padding: surfaceGeometry.paddings[padding] }, children: [title === undefined
                        ? null
                        : createElement(`h${headingLevel}`, { className: "hjm-card__title", "data-slot": "title" }, title), description ? (_jsx(Text, { as: "p", tone: "muted", className: "hjm-card__description", "data-slot": "description", children: description })) : null, _jsx("div", { className: "hjm-card__content", "data-slot": "content", children: children })] }), actions ? _jsx("div", { className: "hjm-card__actions", "data-slot": "actions", children: actions }) : null] }));
});
export const ListRow = forwardRef(function ListRow({ title, description, leading, trailing, density = listRowRecipe.defaults.density, selected = listRowRecipe.defaults.selected, disabled = false, href, onClick, className, ...props }, ref) {
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
    return createElement(element, {
        ...props,
        ...interactiveProps,
        ref,
        className: classNames("hjm-list-row", className),
        "data-density": density,
        "data-state": disabled ? "disabled" : selected ? "selected" : "idle",
    }, leading ? _jsx("span", { className: "hjm-list-row__leading", children: leading }) : null, _jsxs("span", { className: "hjm-list-row__content", children: [_jsx("span", { className: "hjm-list-row__title", children: title }), description ? (_jsx("span", { className: "hjm-list-row__description", children: description })) : null] }), trailing ? _jsx("span", { className: "hjm-list-row__trailing", children: trailing }) : null);
});
//# sourceMappingURL=display.js.map