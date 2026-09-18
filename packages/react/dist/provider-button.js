import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { authProviderButtonRecipe, resolveAuthProviderSurface, validateAuthProviderButtonDescriptor, } from "@hjmds/design-contracts/components/provider-button";
import { forwardRef, } from "react";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
export const AuthProviderButton = forwardRef(function AuthProviderButton({ descriptor, logo, className, ...props }, forwardedRef) {
    validateAuthProviderButtonDescriptor(descriptor);
    const theme = useOptionalHjmTheme();
    // The theme only picks between the provider's own variants; it never mixes
    // HJM palette values into a brand fill.
    const surface = resolveAuthProviderSurface(descriptor.provider, theme?.environment.theme === "dark" ? "dark" : "light");
    const busy = descriptor.busy === true;
    return (_jsxs("button", { ...props, ref: forwardedRef, type: props.type ?? "button", "data-provider": descriptor.provider, "data-busy": busy || undefined, "aria-busy": busy || undefined, disabled: descriptor.disabled === true || busy, className: classNames("hjm-auth-provider-button", className), style: {
            "--hjm-provider-background": surface.background,
            "--hjm-provider-content": surface.content,
            "--hjm-provider-border": surface.border ?? "transparent",
            "--hjm-provider-border-width": `${surface.border === null ? 0 : authProviderButtonRecipe.borderWidth}px`,
            "--hjm-provider-min-height": `${authProviderButtonRecipe.minHeight}px`,
            "--hjm-provider-radius": `${authProviderButtonRecipe.radius}px`,
            "--hjm-provider-gap": `${authProviderButtonRecipe.gap}px`,
            "--hjm-provider-padding": `${authProviderButtonRecipe.paddingHorizontal}px`,
            "--hjm-provider-logo-size": `${authProviderButtonRecipe.logoSize}px`,
            "--hjm-provider-focus-offset": `${authProviderButtonRecipe.focusOutlineOffset}px`,
        }, children: [_jsx("span", { "aria-hidden": "true", className: "hjm-auth-provider-button__logo", children: logo }), _jsx("span", { className: "hjm-auth-provider-button__label", children: descriptor.label }), busy ? _jsx("span", { "aria-hidden": "true", className: "hjm-auth-provider-button__spinner" }) : null] }));
});
//# sourceMappingURL=provider-button.js.map