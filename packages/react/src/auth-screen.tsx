import {
  resolveAuthScreenDescriptor,
  type AuthScreenDescriptor,
} from "@hjmds/design-contracts/components/auth-screen";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "./internal.js";

export type AuthScreenLayoutProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  AuthScreenDescriptor &
  Readonly<{
    /** Product mark, title and description. The product owns every string here. */
    hero: ReactNode;
    /** The primary action block — provider buttons, or a product's own sign-in bundle. */
    main: ReactNode;
    /** Consent notice and policy links. Omit with `hasFooter: false`. */
    footer?: ReactNode;
    className?: string;
  }>;

/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. The measurements come from the resolved descriptor as custom
 * properties so the stylesheet keeps one source of truth with the contract.
 */
export const AuthScreenLayout = forwardRef<HTMLElement, AuthScreenLayoutProps>(
  function AuthScreenLayout(
    { hero, main, footer, density, hasFooter, className, ...props },
    forwardedRef,
  ) {
    const resolved = resolveAuthScreenDescriptor({
      ...(density === undefined ? {} : { density }),
      ...(hasFooter === undefined ? {} : { hasFooter }),
    });
    const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
    return (
      <main
        {...props}
        ref={forwardedRef}
        className={classNames("hjm-auth-screen", className)}
        data-density={resolved.density}
        style={{
          ["--hjm-auth-screen-max-width" as string]: `${resolved.maxWidth}px`,
          ["--hjm-auth-screen-hero-gap" as string]: `${resolved.heroGap}px`,
          ["--hjm-auth-screen-main-gap" as string]: `${resolved.mainGap}px`,
          ["--hjm-auth-screen-footer-gap" as string]: `${resolved.footerGap}px`,
          ["--hjm-auth-screen-padding-inline" as string]: `${resolved.paddingInline}px`,
          ["--hjm-auth-screen-padding-block" as string]: `${resolved.paddingBlock}px`,
          ...props.style,
        }}
      >
        <div className="hjm-auth-screen__block">
          <div className="hjm-auth-screen__hero">{hero}</div>
          <div className="hjm-auth-screen__main">{main}</div>
        </div>
        {showFooter ? <div className="hjm-auth-screen__footer">{footer}</div> : null}
      </main>
    );
  },
);
