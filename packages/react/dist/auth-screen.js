import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { authScreenRecipe, resolveAuthScreenDescriptor, validateAuthScreenHeroDescriptor, validateAuthScreenPolicyLinks, } from "@hjmds/design-contracts/components/auth-screen";
import { typography } from "@hjmds/design-contracts/foundations";
import { createContext, createElement, forwardRef, Fragment, useContext, useLayoutEffect, useRef } from "react";
import { classNames, useDesignProfileDefaults } from "./internal.js";
// The hero follows the layout density without the product passing it twice.
const AuthScreenDensityContext = createContext(undefined);
/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. The measurements come from the resolved descriptor as custom
 * properties so the stylesheet keeps one source of truth with the contract.
 */
export const AuthScreenLayout = forwardRef(function AuthScreenLayout({ hero, main, footer, density, hasFooter, pendingLabel, mainCard = false, className, as: Element = "main", layoutStyle, ...props }, forwardedRef) {
    const resolved = resolveAuthScreenDescriptor({
        ...(density === undefined ? {} : { density }),
        ...(hasFooter === undefined ? {} : { hasFooter }),
    });
    const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
    const pending = pendingLabel !== undefined;
    const actionsRef = useRef(null);
    const focusedAction = useRef(null);
    const wasPending = useRef(pending);
    useLayoutEffect(() => {
        // Inert loading content sends keyboard focus to body. Resume at the same
        // action after failure/cancellation, unless the user moved somewhere else.
        const target = focusedAction.current;
        if (wasPending.current && !pending && document.activeElement === document.body && target?.isConnected && actionsRef.current?.contains(target)) {
            target.focus({ preventScroll: true });
        }
        wasPending.current = pending;
    }, [pending]);
    if (pending && !pendingLabel.trim())
        throw new TypeError("AuthScreen pendingLabel must not be empty");
    return (_jsxs(Element, { ...props, ref: forwardedRef, className: classNames("hjm-auth-screen", className), "data-density": resolved.density, style: {
            ["--hjm-auth-screen-max-width"]: `${resolved.maxWidth}px`,
            ["--hjm-auth-screen-hero-gap"]: `${resolved.heroGap}px`,
            ["--hjm-auth-screen-main-gap"]: `${resolved.mainGap}px`,
            ["--hjm-auth-screen-footer-gap"]: `${resolved.footerGap}px`,
            ["--hjm-auth-screen-padding-inline"]: `${resolved.paddingInline}px`,
            ["--hjm-auth-screen-padding-block"]: `${resolved.paddingBlock}px`,
            ...props.style,
            ...layoutStyle,
        }, children: [_jsxs("div", { className: "hjm-auth-screen__block", children: [_jsx(AuthScreenDensityContext.Provider, { value: resolved.density, children: _jsx("div", { className: "hjm-auth-screen__hero", children: hero }) }), _jsxs("div", { className: "hjm-auth-screen__main", "data-card": mainCard || undefined, "aria-busy": pending || undefined, children: [_jsx("div", { ref: actionsRef, className: "hjm-auth-screen__actions", inert: pending, "aria-hidden": pending || undefined, onFocusCapture: event => { focusedAction.current = event.target; }, onBlurCapture: event => { if (!pending && !event.currentTarget.contains(event.relatedTarget))
                                    focusedAction.current = null; }, style: pending ? { visibility: "hidden" } : undefined, children: main }), pending ? _jsx("div", { className: "hjm-auth-screen__pending", role: "status", "aria-label": pendingLabel, children: _jsx("span", { className: "hjm-auth-provider-button__spinner", "aria-hidden": "true" }) }) : null] })] }), showFooter ? _jsx("div", { className: "hjm-auth-screen__footer", children: footer }) : null] }));
});
/** Token weight per variant, following the nearest design profile like `Text` does. */
function useTypeWeight() {
    const profile = useDesignProfileDefaults();
    const tokens = profile?.tokens.typography ?? typography;
    return variant => tokens[variant].fontWeight;
}
/**
 * The `hero` slot content: mark, eyebrow, tagline and one description line. The
 * product supplies the strings and mark; the type steps, tones and gaps come from
 * `authScreenRecipe.hero` so a login slogan never borrows the page-heading size.
 */
export function AuthScreenHero({ mark, title, eyebrow, description, headingLevel = 1 }) {
    validateAuthScreenHeroDescriptor({ title, ...(eyebrow === undefined ? {} : { eyebrow }), ...(description === undefined ? {} : { description }), headingLevel });
    const density = useContext(AuthScreenDensityContext);
    const variant = resolveAuthScreenDescriptor(density === undefined ? {} : { density }).titleVariant;
    const weight = useTypeWeight();
    const recipe = authScreenRecipe.hero;
    // Fragment: the mark and the copy are direct children of the hero so the
    // recipe hero gap separates them on both platforms.
    return (_jsxs(Fragment, { children: [mark ? _jsx("div", { className: "hjm-auth-screen__mark", children: mark }) : null, _jsxs("div", { className: "hjm-auth-screen__copy", children: [eyebrow ? _jsx("p", { className: "hjm-text hjm-auth-screen__eyebrow", "data-variant": recipe.eyebrow.textVariant, "data-font-role": "ui", "data-tone": recipe.eyebrow.tone, style: { marginBlockEnd: recipe.eyebrow.gapBelow, fontWeight: weight(recipe.eyebrow.textVariant) }, children: eyebrow }) : null, createElement(`h${headingLevel}`, {
                        className: "hjm-text hjm-auth-screen__title",
                        "data-variant": variant,
                        "data-font-role": "display",
                        "data-tone": recipe.title.tone,
                        // The title step's own weight (500), not Text's regular default outside a profile.
                        style: { fontWeight: weight(variant) },
                    }, title), description ? _jsx("p", { className: "hjm-text hjm-auth-screen__description", "data-variant": recipe.description.textVariant, "data-font-role": "ui", "data-tone": recipe.description.tone, style: { marginBlockStart: recipe.description.gapAbove, fontWeight: weight(recipe.description.textVariant) }, children: description }) : null] })] }));
}
/**
 * The `footer` slot content: consent notice plus dot-separated policy links. The
 * visible gap between two links is `linkGap` + separator + `linkGap`; the 44px
 * touch target is an invisible hit area, not visible padding.
 */
export function AuthScreenFooter({ notice, links, children }) {
    validateAuthScreenPolicyLinks(links);
    const recipe = authScreenRecipe.footer;
    const weight = useTypeWeight();
    const linkStyle = { fontWeight: weight(recipe.link.textVariant) };
    return (_jsxs("div", { className: "hjm-auth-screen__footer-content", style: { gap: recipe.noticeGap }, children: [notice ? _jsx("p", { className: "hjm-text", "data-variant": recipe.notice.textVariant, "data-font-role": "ui", "data-tone": recipe.notice.tone, style: { fontWeight: weight(recipe.notice.textVariant) }, children: notice }) : null, _jsx("div", { className: "hjm-auth-screen__links", style: {
                    ["--hjm-auth-screen-link-gap"]: `${recipe.linkGap}px`,
                    ["--hjm-auth-screen-link-target"]: `${authScreenRecipe.footerMinTouchTarget}px`,
                }, children: links.map((link, index) => (_jsxs(Fragment, { children: [index > 0 ? _jsx("span", { className: "hjm-text hjm-auth-screen__separator", "data-variant": recipe.link.textVariant, "data-tone": recipe.notice.tone, "aria-hidden": "true", children: recipe.separator }) : null, link.href !== undefined
                            ? _jsx("a", { className: "hjm-text hjm-auth-screen__link", "data-variant": recipe.link.textVariant, "data-font-role": "ui", "data-tone": recipe.link.tone, style: linkStyle, href: link.href, onClick: link.onClick, children: link.label })
                            : _jsx("button", { type: "button", className: "hjm-text hjm-auth-screen__link", "data-variant": recipe.link.textVariant, "data-font-role": "ui", "data-tone": recipe.link.tone, style: linkStyle, onClick: link.onClick, children: link.label })] }, `${index}:${link.label}`))) }), children] }));
}
//# sourceMappingURL=auth-screen.js.map