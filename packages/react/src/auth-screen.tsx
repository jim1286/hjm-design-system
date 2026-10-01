import {
  resolveAuthScreenDescriptor,
  type AuthScreenDescriptor,
} from "@hjmds/design-contracts/components/auth-screen";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "./internal.js";

export type AuthScreenLayoutProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  AuthScreenDescriptor &
  Readonly<{
    /** Use section inside a product shell that already owns the main landmark. */
    as?: "main" | "section";
    /** Product mark, title and description. The product owns every string here. */
    hero: ReactNode;
    /** The primary action block — provider buttons, or a product's own sign-in bundle. */
    main: ReactNode;
    /** Product-localized progress label; presence replaces actions with one centred loader. */
    pendingLabel?: string;
    /** Let the layout own the action card; omit when the product already supplies a surface. */
    mainCard?: boolean;
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
    { hero, main, footer, density, hasFooter, pendingLabel, mainCard = false, className, as: Element = "main", ...props },
    forwardedRef,
  ) {
    const resolved = resolveAuthScreenDescriptor({
      ...(density === undefined ? {} : { density }),
      ...(hasFooter === undefined ? {} : { hasFooter }),
    });
    const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
    const pending = pendingLabel !== undefined;
    if (pending && !pendingLabel.trim()) throw new TypeError("AuthScreen pendingLabel must not be empty");
    return (
      <Element
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
          <div className="hjm-auth-screen__main" data-card={mainCard || undefined} aria-busy={pending || undefined}>
            {/* Keep the action block in flow so the card never collapses; inert also removes keyboard access. */}
            <div className="hjm-auth-screen__actions" inert={pending} aria-hidden={pending || undefined}
              style={pending ? { visibility: "hidden" } : undefined}>{main}</div>
            {pending ? <div className="hjm-auth-screen__pending" role="status" aria-label={pendingLabel}>
              <span className="hjm-auth-provider-button__spinner" aria-hidden="true" />
            </div> : null}
          </div>
        </div>
        {showFooter ? <div className="hjm-auth-screen__footer">{footer}</div> : null}
      </Element>
    );
  },
);
