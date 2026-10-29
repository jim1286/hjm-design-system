"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IdentityAction } from "./internal/identity-action.js";
import { badgeRecipe, listRowRecipe, resolveBadgeCategoryColor, validateListRowTrailingAccessory, } from "@hjmds/design-contracts/recipes";
import { THEMES } from "@hjmds/design-contracts/colors";
import { glyph } from "@hjmds/design-contracts/foundations";
import { resolveTagDescriptor, } from "@hjmds/design-contracts/components/tag";
import { cardRecipe, } from "@hjmds/design-contracts/components/card";
import { surfaceGeometry, } from "@hjmds/design-contracts/recipes/base";
import { createElement, forwardRef, } from "react";
import { classNames } from "./internal.js";
import { useHjmDensityDefault, useOptionalHjmTheme } from "./provider.js";
import { Surface, Text } from "./layout.js";
import { Icon } from "./supplemental-display.js";
export const Badge = forwardRef(function Badge({ tone: toneProp, categoryColor, size = badgeRecipe.defaults.size, variant = badgeRecipe.defaults.variant, leading, trailing, className, children, layoutStyle, style, ...props }, ref) {
    if (categoryColor !== undefined && toneProp !== undefined)
        throw new TypeError("Badge takes either tone or categoryColor, not both");
    const tone = toneProp ?? badgeRecipe.defaults.tone;
    // Outside a provider the stylesheet paints the light palette, so the category resolves against it too.
    const theme = useOptionalHjmTheme();
    const category = categoryColor === undefined ? null : resolveBadgeCategoryColor(categoryColor, {
        theme: theme?.environment.theme ?? "light",
        variant,
        palette: theme?.palette.theme ?? THEMES.light,
    });
    const iconContext = { color: "currentColor", size: badgeRecipe.sizes[size].iconSize, strokeWidth: badgeRecipe.iconStrokeWidth };
    return (_jsxs("span", { ...props, style: {
            ...style,
            ...(category ? {
                "--hjm-badge-category-content": category.content,
                "--hjm-badge-category-background": category.background ?? "transparent",
                "--hjm-badge-category-border": category.border ?? "transparent",
            } : {}),
            ...layoutStyle,
        }, ref: ref, className: classNames("hjm-badge", className), "data-tone": category ? "category" : tone, "data-size": size, "data-variant": variant, children: [leading === undefined ? null : (_jsx("span", { "aria-hidden": "true", className: "hjm-badge__icon", children: typeof leading === "function" ? leading(iconContext) : leading })), _jsx("span", { className: "hjm-badge__label", children: children }), trailing === undefined ? null : (_jsx("span", { "aria-hidden": "true", className: "hjm-badge__icon", children: typeof trailing === "function" ? trailing(iconContext) : trailing }))] }));
});
export const Tag = forwardRef(function Tag({ children, tone, variant, className, layoutStyle, style, ...props }, ref) {
    const descriptor = resolveTagDescriptor({
        label: children,
        ...(tone === undefined ? {} : { tone }),
        ...(variant === undefined ? {} : { variant }),
    });
    return (_jsx("span", { ...props, style: { ...style, ...layoutStyle }, ref: ref, className: classNames("hjm-tag", className), "data-tone": descriptor.tone, "data-variant": descriptor.variant, children: _jsx("span", { className: "hjm-tag__label", children: descriptor.label }) }));
});
export const Card = forwardRef(function Card({ title, description, leading, leadingAction, media, backgroundMedia, backgroundInteraction, mediaBadges, badges, badgesAlign = cardRecipe.defaults.badgesAlign, badgesPlacement = cardRecipe.defaults.badgesPlacement, mediaAction, actions, headerActions, headingLevel = cardRecipe.defaults.headingLevel, 
// An omitted selection is an ordinary action, not an unpressed toggle.
selected, onActivate, href, renderLink, disabled = false, tone = cardRecipe.defaults.tone, bordered = cardRecipe.defaults.bordered, padding = cardRecipe.defaults.padding, radius, className, children, ...props }, ref) {
    if (href !== undefined && (!href.trim() || onActivate))
        throw new TypeError("Card href requires a destination and cannot combine with onActivate");
    if (renderLink && href === undefined)
        throw new TypeError("Card renderLink requires href");
    if ((onActivate || href !== undefined) && !props["aria-label"]?.trim()) {
        throw new TypeError("Interactive Card requires aria-label");
    }
    if (mediaAction && (onActivate || href !== undefined || !media || !mediaAction.label.trim()))
        throw new TypeError("Card mediaAction requires passive media, a label, and no whole-card activation");
    if (backgroundMedia && (media || mediaAction || onActivate || href !== undefined))
        throw new TypeError("Card backgroundMedia is decorative and cannot combine with media, mediaAction, onActivate or href");
    if ((backgroundInteraction !== undefined || mediaBadges !== undefined) && !backgroundMedia)
        throw new TypeError("Card backgroundInteraction/mediaBadges require backgroundMedia");
    const hasHeader = leading !== undefined || title !== undefined || description !== undefined || headerActions !== undefined;
    // Whole-card open plus separate commands (2026-10-18 unairplane journey card: open + delete). A root button cannot
    // contain the action buttons, so the root stays an article and an overlay button carries the card's name and state.
    const overlay = href !== undefined || (onActivate !== undefined && Boolean(actions || headerActions || leadingAction));
    const { "aria-label": activationLabel, ...rootProps } = props;
    const activate = () => { if (!disabled)
        onActivate?.(); };
    const linkProps = {
        href: disabled ? undefined : href, role: "link", className: "hjm-card__activator",
        "aria-label": activationLabel, "aria-disabled": disabled || undefined, tabIndex: disabled ? -1 : undefined,
    };
    // Link activation belongs to the shared card; a product-owned stretched link was its own second layout (Diairy).
    const destination = href === undefined ? null : !disabled && renderLink ? renderLink(linkProps) : _jsx("a", { ...linkProps });
    return (_jsxs(Surface, { ...(overlay ? rootProps : props), ref: ref, as: onActivate && !overlay ? "button" : "article", ...(onActivate && !overlay ? {
            type: "button", disabled, "aria-pressed": selected,
            "data-interactive": true, onClick: activate,
        } : {}), ...(overlay ? { "data-activation": "overlay" } : {}), tone: selected ? cardRecipe.selectedTone : tone, bordered: bordered, ...(radius === undefined ? {} : { radius }), className: classNames("hjm-card", className), "data-background-media": backgroundMedia ? true : undefined, "data-state": (onActivate || href !== undefined || mediaAction) && disabled ? "disabled" : selected ? "selected" : "idle", style: { "--hjm-card-background-scrim": cardRecipe.backgroundMedia.scrim, "--hjm-card-background-foreground": cardRecipe.backgroundMedia.foreground, "--hjm-card-disabled-opacity": cardRecipe.interaction.disabledOpacity,
            "--hjm-card-pressed-opacity": cardRecipe.interaction.pressedOpacity, ...props.style }, children: [badges !== undefined && badgesPlacement === "corner" ? _jsx("div", { className: "hjm-card__corner-badges", "data-slot": "corner-badges", style: { top: cardRecipe.cornerBadge.inset, right: cardRecipe.cornerBadge.inset, transform: `rotate(${cardRecipe.cornerBadge.rotation}deg)` }, children: badges }) : null, backgroundMedia ? _jsxs("div", { className: "hjm-card__background", "aria-hidden": "true", children: [backgroundMedia, _jsx("span", { className: "hjm-card__scrim" })] }) : null, backgroundInteraction === undefined ? null : _jsx("div", { className: "hjm-card__background-interaction", "data-slot": "background-interaction", children: backgroundInteraction }), mediaBadges === undefined ? null : _jsx("div", { className: "hjm-card__media-badges", "data-slot": "media-badges", children: mediaBadges }), media ? _jsx("div", { className: "hjm-card__media", "data-slot": "media", children: mediaAction ? _jsxs("button", { type: "button", className: "hjm-card__media-action", "aria-label": mediaAction.label, disabled: disabled, onClick: () => { if (!disabled)
                        mediaAction.onActivate(); }, children: [media, mediaAction.icon ? _jsx("span", { className: "hjm-card__media-icon", "aria-hidden": "true", style: { insetInlineEnd: cardRecipe.mediaAction.inset, insetBlockEnd: cardRecipe.mediaAction.inset, width: cardRecipe.mediaAction.diameter, height: cardRecipe.mediaAction.diameter }, children: mediaAction.icon({ color: "currentColor", size: cardRecipe.mediaAction.iconSize }) }) : null] }) : media }) : null, _jsxs("div", { className: "hjm-card__body", "data-slot": "body", style: { padding: surfaceGeometry.paddings[padding] }, children: [badges === undefined || badgesPlacement !== "body" ? null : _jsx("div", { className: "hjm-card__badges", "data-slot": "badges", "data-align": badgesAlign, children: badges }), hasHeader ? (_jsxs("div", { className: "hjm-card__header", "data-slot": "header", children: [leading === undefined ? null : (_jsx("span", { className: "hjm-card__leading", "data-slot": "leading", "data-interactive": leadingAction ? "" : undefined, children: leadingAction ? _jsx(IdentityAction, { action: leadingAction, children: leading }) : leading })), _jsxs("div", { className: "hjm-card__copy", children: [title === undefined
                                        ? null
                                        : createElement(`h${headingLevel}`, { className: "hjm-card__title", "data-slot": "title" }, title), description === undefined ? null : (_jsx(Text, { as: "p", tone: "muted", className: "hjm-card__description", "data-slot": "description", children: description }))] }), headerActions === undefined ? null : _jsx("div", { className: "hjm-card__header-actions", "data-slot": "header-actions", children: headerActions })] })) : null, children === undefined ? null : (_jsx("div", { className: "hjm-card__content", "data-slot": "content", children: children }))] }), destination, overlay && href === undefined ? (_jsx("button", { type: "button", className: "hjm-card__activator", "data-slot": "activator", "aria-label": activationLabel, "aria-pressed": selected, disabled: disabled, onClick: activate })) : null, actions ? _jsx("div", { className: "hjm-card__actions", "data-slot": "actions", children: actions }) : null] }));
});
export function QuoteCard({ children, attribution, renderMark, ...props }) {
    return _jsx(Card, { ...props, leading: _jsx("span", { className: "hjm-quote-card__mark", "aria-hidden": "true", children: renderMark?.({ color: "currentColor", size: cardRecipe.quotation.markSize }) ?? "“" }), children: _jsxs("blockquote", { className: "hjm-quote-card__body", children: [children, attribution === undefined ? null : _jsx("footer", { children: _jsx(Text, { variant: "caption", tone: "muted", children: attribution }) })] }) });
}
export const ListRow = forwardRef(function ListRow({ title, description, leading, leadingAction, trailing, trailingAccessory = listRowRecipe.defaults.trailingAccessory, trailingAction, renderLink, density: densityProp, tone = listRowRecipe.defaults.tone, leadingShape = "square", leadingSize = leadingShape === "circle" ? "large" : "default", selected, disabled = false, loading = false, loadingLabel, href, onClick, className, layoutStyle, style, ...props }, ref) {
    // The hook runs unconditionally — `??` would short-circuit it and break the
    // rules of hooks on the very first row that passes `density`.
    const separateActions = Boolean(trailingAction || leadingAction);
    const densityDefault = useHjmDensityDefault({
        comfortable: listRowRecipe.defaults.density,
        compact: "compact",
    });
    const density = densityProp ?? densityDefault;
    validateListRowTrailingAccessory(trailingAccessory);
    const accessory = trailingAccessory === "none" ? null : listRowRecipe.accessories[trailingAccessory];
    if (loading) {
        // A loading row is never interactive: there is nothing to activate yet.
        return (_jsxs("div", { ...props, ref: ref, role: loadingLabel ? "status" : undefined, "aria-busy": loadingLabel ? true : undefined, "aria-hidden": loadingLabel ? undefined : true, "aria-label": loadingLabel, className: classNames("hjm-list-row", "hjm-list-row--loading", className), "data-density": density, "data-leading": leading ? "" : undefined, "data-lines": description ? "two" : "one", "data-state": "loading", style: { ...style, ...layoutStyle }, children: [leading ? _jsx("span", { className: "hjm-list-row__leading", "data-shape": leadingShape, "data-size": leadingSize, "data-placeholder": "" }) : null, _jsxs("span", { className: "hjm-list-row__content", children: [_jsx("span", { className: "hjm-list-row__title", "data-placeholder": "", style: { width: `${listRowRecipe.loading.titleWidthPercent}%` } }), description ? _jsx("span", { className: "hjm-list-row__description", "data-placeholder": "", style: { width: `${listRowRecipe.loading.descriptionWidthPercent}%` } }) : null] }), trailing ? _jsx("span", { className: "hjm-list-row__trailing", "data-placeholder": "", style: { width: listRowRecipe.loading.trailingWidth } }) : null, accessory ? _jsx("span", { className: "hjm-list-row__accessory", "data-accessory": trailingAccessory, style: { inlineSize: glyph[accessory.glyph], blockSize: glyph[accessory.glyph] } }) : null] }));
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
        style: separateActions ? style : { ...style, ...layoutStyle },
    }, leading && !leadingAction
        ? _jsx("span", { className: "hjm-list-row__leading", "data-shape": leadingShape, "data-size": leadingSize, children: leading })
        : null, _jsxs("span", { className: "hjm-list-row__content", children: [_jsx("span", { className: "hjm-list-row__title", children: title }), description ? (_jsx("span", { className: "hjm-list-row__description", children: description })) : null] }), trailing ? _jsx("span", { className: "hjm-list-row__trailing", children: trailing }) : null, accessory
        ? _jsx("span", { className: "hjm-list-row__accessory", "data-accessory": trailingAccessory, "aria-hidden": "true", children: _jsx(Icon, { name: accessory.icon, size: accessory.glyph, weight: accessory.weight }) })
        : null);
    const linked = href && renderLink ? renderLink(row.props) : row;
    // The frame owns the row surface and its bleed so the command and the separate action share one fill, as Native;
    // the action stays outside the link/button (styles.css `.hjm-list-row-frame`).
    return separateActions ? (_jsxs("div", { className: "hjm-list-row-frame", "data-leading-action": leadingAction ? "" : undefined, "data-trailing-action": trailingAction ? "" : undefined, "data-density": density, "data-leading": leading ? "" : undefined, "data-state": disabled ? "disabled" : selected ? "selected" : "idle", style: layoutStyle, children: [leadingAction && leading ? _jsx("div", { className: "hjm-list-row__profile", children: _jsx(IdentityAction, { action: leadingAction, children: leading }) }) : null, linked, trailingAction ? _jsx("div", { className: "hjm-list-row__action", children: trailingAction }) : null] })) : linked;
});
//# sourceMappingURL=display.js.map