import {
  authProviderButtonRecipe,
  resolveAuthProviderSurface,
  validateAuthProviderButtonDescriptor,
  type AuthProviderButtonDescriptor,
} from "@hjmds/design-contracts/components/provider-button";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

export type AuthProviderButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled" | "style"
> &
  Readonly<{
    descriptor: AuthProviderButtonDescriptor;
    /**
     * The provider's own mark, supplied by the product: brand assets have
     * per-provider redistribution terms, so the design system never bundles them.
     */
    logo: ReactNode;
    className?: string;
  }>;

export const AuthProviderButton = forwardRef<HTMLButtonElement, AuthProviderButtonProps>(
  function AuthProviderButton({ descriptor, logo, className, ...props }, forwardedRef) {
    validateAuthProviderButtonDescriptor(descriptor);
    const theme = useOptionalHjmTheme();
    // The theme only picks between the provider's own variants; it never mixes
    // HJM palette values into a brand fill.
    const surface = resolveAuthProviderSurface(
      descriptor.provider,
      theme?.environment.theme === "dark" ? "dark" : "light",
    );
    const busy = descriptor.busy === true;
    return (
      <button
        {...props}
        ref={forwardedRef}
        type={props.type ?? "button"}
        data-provider={descriptor.provider}
        data-busy={busy || undefined}
        aria-busy={busy || undefined}
        disabled={descriptor.disabled === true || busy}
        className={classNames("hjm-auth-provider-button", className)}
        style={{
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
        } as CSSProperties}
      >
        <span aria-hidden="true" className="hjm-auth-provider-button__logo">{logo}</span>
        {/* Busy keeps the label and the width; only the spinner is added. */}
        <span className="hjm-auth-provider-button__label">{descriptor.label}</span>
        {busy ? <span aria-hidden="true" className="hjm-auth-provider-button__spinner" /> : null}
      </button>
    );
  },
);
