import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveAuthScreenDescriptor, } from "@hjmds/design-contracts/components/auth-screen";
import { forwardRef } from "react";
import { classNames } from "./internal.js";
/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. The measurements come from the resolved descriptor as custom
 * properties so the stylesheet keeps one source of truth with the contract.
 */
export const AuthScreenLayout = forwardRef(function AuthScreenLayout({ hero, main, footer, density, hasFooter, className, ...props }, forwardedRef) {
    const resolved = resolveAuthScreenDescriptor({
        ...(density === undefined ? {} : { density }),
        ...(hasFooter === undefined ? {} : { hasFooter }),
    });
    const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
    return (_jsxs("main", { ...props, ref: forwardedRef, className: classNames("hjm-auth-screen", className), "data-density": resolved.density, style: {
            ["--hjm-auth-screen-max-width"]: `${resolved.maxWidth}px`,
            ["--hjm-auth-screen-hero-gap"]: `${resolved.heroGap}px`,
            ["--hjm-auth-screen-main-gap"]: `${resolved.mainGap}px`,
            ["--hjm-auth-screen-footer-gap"]: `${resolved.footerGap}px`,
            ["--hjm-auth-screen-padding-inline"]: `${resolved.paddingInline}px`,
            ["--hjm-auth-screen-padding-block"]: `${resolved.paddingBlock}px`,
            ...props.style,
        }, children: [_jsxs("div", { className: "hjm-auth-screen__block", children: [_jsx("div", { className: "hjm-auth-screen__hero", children: hero }), _jsx("div", { className: "hjm-auth-screen__main", children: main })] }), showFooter ? _jsx("div", { className: "hjm-auth-screen__footer", children: footer }) : null] }));
});
//# sourceMappingURL=auth-screen.js.map