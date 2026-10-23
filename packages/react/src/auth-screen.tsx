"use client";

import { PendingContentHost } from "./internal/pending-content.js";
import {
  authScreenRecipe,
  resolveAuthScreenDescriptor,
  validateAuthScreenHeroDescriptor,
  validateAuthScreenPolicyLinks,
  type AuthScreenDensity,
  type AuthScreenDescriptor,
  type AuthScreenHeroDescriptor,
  type AuthScreenPolicyLinkDescriptor,
} from "@hjmds/design-contracts/components/auth-screen";
import { typography, type TextVariant } from "@hjmds/design-contracts/foundations";
import { createContext, createElement, forwardRef, Fragment, useContext, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributeAnchorTarget, type HTMLAttributes, type ReactNode, useId } from "react";
import { initialFocusDefaults, screenHeaderRecipe, screenPatternRecipe, validateScreenExit, type ScreenInitialFocus } from "@hjmds/design-contracts/screen-patterns";
import { classNames, useDesignProfileDefaults } from "./internal.js";
import { InitialFocusScope } from "./internal/initial-focus.js";
import { ScreenExitButton, type ScreenExit } from "./internal/screen-exit.js";
import { Heading } from "./heading.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

// The hero follows the layout density without the product passing it twice.
const AuthScreenDensityContext = createContext<AuthScreenDensity | undefined>(undefined);
// With a header title the route name is the page heading (h1), so the hero tagline steps down to h2 by default.
const AuthScreenTitledContext = createContext(false);

export type AuthScreenLayoutProps = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> &
  AuthScreenDescriptor &
  Readonly<{
    /** Use section inside a product shell that already owns the main landmark. */
    as?: "main" | "section";
    /**
     * Route name in the shared screen header band (screenHeaderRecipe, centered like ScreenLayout). Login and signup
     * routes kept a TopBar above this layout only for the route name + back/close (2026-10-18: utilverse, burntok).
     */
    title?: string;
    /** Leaving the route: the same icon-only back/close as ScreenLayout `exit`, at the header's leading edge. */
    exit?: ScreenExit;
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
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * Entry focus, same rules as ScreenLayout `initialFocus`. Off by default because auth screens lead with provider
     * buttons; a signup nickname step opts in with `first-input` (2026-10-18 adoption, same as Native).
     */
    initialFocus?: ScreenInitialFocus;
  }>;

/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. The measurements come from the resolved descriptor as custom
 * properties so the stylesheet keeps one source of truth with the contract.
 */
export const AuthScreenLayout = forwardRef<HTMLElement, AuthScreenLayoutProps>(
  function AuthScreenLayout(
    { title, exit, hero, main, footer, density, hasFooter, pendingLabel, mainCard = false, className, as: Element = "main", layoutStyle, initialFocus = initialFocusDefaults.auth, ...props },
    forwardedRef,
  ) {
    if (title !== undefined && !title.trim()) throw new TypeError("AuthScreenLayout title must not be empty");
    if (exit) validateScreenExit(exit, false);
    const hasHeader = title !== undefined || exit !== undefined;
    const resolved = resolveAuthScreenDescriptor({
      ...(density === undefined ? {} : { density }),
      ...(hasFooter === undefined ? {} : { hasFooter }),
    });
    const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
    const pending = pendingLabel !== undefined;
    const actionsRef = useRef<HTMLDivElement>(null);
    const focusedAction = useRef<HTMLElement | null>(null);
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
    if (pending && !pendingLabel.trim()) throw new TypeError("AuthScreen pendingLabel must not be empty");
    return (
      <Element
        {...props}
        ref={forwardedRef}
        className={classNames("hjm-auth-screen", className)}
        data-density={resolved.density}
        data-header={hasHeader || undefined}
        style={{
          ["--hjm-auth-screen-max-width" as string]: `${resolved.maxWidth}px`,
          ["--hjm-auth-screen-hero-gap" as string]: `${resolved.heroGap}px`,
          ["--hjm-auth-screen-main-gap" as string]: `${resolved.mainGap}px`,
          ["--hjm-auth-screen-footer-gap" as string]: `${resolved.footerGap}px`,
          ["--hjm-auth-screen-padding-inline" as string]: `${resolved.paddingInline}px`,
          ["--hjm-auth-screen-padding-block" as string]: `${resolved.paddingBlock}px`,
          ...(hasHeader ? {
            ["--hjm-auth-screen-header-padding-inline" as string]: `${screenPatternRecipe.padding}px`,
            ["--hjm-auth-screen-header-padding-block" as string]: `${screenHeaderRecipe.paddingVertical}px`,
            ["--hjm-auth-screen-header-min-height" as string]: `${screenHeaderRecipe.minHeight}px`,
          } : {}),
          ...props.style,
          ...layoutStyle,
        }}
      >
        {/* The ScreenLayout centered band (same exit, gutter and title step), full-bleed above the padded block. */}
        {hasHeader ? <header className="hjm-auth-screen__header">
          <div>{exit ? <ScreenExitButton {...exit} /> : null}</div>
          <div className="hjm-auth-screen__header-title">{title === undefined ? null : <Heading level={screenHeaderRecipe.centeredTitleLevel} semanticLevel={1}>{title}</Heading>}</div>
          <div />
        </header> : null}
        <InitialFocusScope mode={initialFocus}>
        <div className="hjm-auth-screen__block">
          <AuthScreenDensityContext.Provider value={resolved.density}><AuthScreenTitledContext.Provider value={title !== undefined}><div className="hjm-auth-screen__hero">{hero}</div></AuthScreenTitledContext.Provider></AuthScreenDensityContext.Provider>
          <div className="hjm-auth-screen__main" data-card={mainCard || undefined} aria-busy={pending || undefined}>
            <PendingContentHost pending={pending} label={pendingLabel ?? ""} indicatorClassName="hjm-auth-screen__pending"
              contentProps={{ ref: actionsRef, className: "hjm-auth-screen__actions",
                onFocusCapture: event => { focusedAction.current = event.target; },
                onBlurCapture: event => { if (!pending && !event.currentTarget.contains(event.relatedTarget)) focusedAction.current = null; } }}>
              {main}
            </PendingContentHost>
          </div>
        </div>
        {showFooter ? <div className="hjm-auth-screen__footer">{footer}</div> : null}
        </InitialFocusScope>
      </Element>
    );
  },
);

/** Token weight per variant, following the nearest design profile like `Text` does. */
function useTypeWeight(): (variant: TextVariant) => number | string {
  const profile = useDesignProfileDefaults();
  const tokens = profile?.tokens.typography ?? typography;
  return variant => tokens[variant].fontWeight;
}

export type AuthScreenHeroProps = AuthScreenHeroDescriptor &
  Readonly<{
    /** Product mark asset. HJM never ships product marks. */
    mark?: ReactNode;
  }>;

/**
 * The `hero` slot content: mark, eyebrow, tagline and one description line. The
 * product supplies the strings and mark; the type steps, tones and gaps come from
 * `authScreenRecipe.hero` so a login slogan never borrows the page-heading size.
 */
export function AuthScreenHero({ mark, title, eyebrow, description, headingLevel: suppliedHeadingLevel }: AuthScreenHeroProps) {
  const titled = useContext(AuthScreenTitledContext);
  const headingLevel = suppliedHeadingLevel ?? (titled ? 2 : 1);
  validateAuthScreenHeroDescriptor({ title, ...(eyebrow === undefined ? {} : { eyebrow }), ...(description === undefined ? {} : { description }), headingLevel });
  const density = useContext(AuthScreenDensityContext);
  const variant = resolveAuthScreenDescriptor(density === undefined ? {} : { density }).titleVariant;
  const weight = useTypeWeight();
  const recipe = authScreenRecipe.hero;
  // Fragment: the mark and the copy are direct children of the hero so the
  // recipe hero gap separates them on both platforms.
  return (
    <Fragment>
      {mark ? <div className="hjm-auth-screen__mark">{mark}</div> : null}
      <div className="hjm-auth-screen__copy">
        {eyebrow ? <p className="hjm-text hjm-auth-screen__eyebrow" data-variant={recipe.eyebrow.textVariant} data-font-role="ui" data-tone={recipe.eyebrow.tone}
          style={{ marginBlockEnd: recipe.eyebrow.gapBelow, fontWeight: weight(recipe.eyebrow.textVariant) }}>{eyebrow}</p> : null}
        {/* A real heading element: the tagline is the route's first heading. */}
        {createElement(`h${headingLevel}`, {
          className: "hjm-text hjm-auth-screen__title",
          "data-variant": variant,
          "data-font-role": "display",
          "data-tone": recipe.title.tone,
          // The title step's own weight (500), not Text's regular default outside a profile.
          style: { fontWeight: weight(variant) },
        }, title)}
        {description ? <p className="hjm-text hjm-auth-screen__description" data-variant={recipe.description.textVariant} data-font-role="ui" data-tone={recipe.description.tone}
          style={{ marginBlockStart: recipe.description.gapAbove, fontWeight: weight(recipe.description.textVariant) }}>{description}</p> : null}
      </div>
    </Fragment>
  );
}

export type AuthScreenPolicyLink = AuthScreenPolicyLinkDescriptor &
  Readonly<{
    /** Document URL; renders an anchor. */
    href?: string;
    /**
     * Anchor target with `href`, e.g. `_blank` for policy documents that open beside the app (diairy web lost its
     * new-tab links on adoption, 2026-10-17). `rel` defaults to "noreferrer noopener" for `_blank`, as on Link.
     */
    target?: HTMLAttributeAnchorTarget;
    rel?: string;
    /** In-app handler; renders a button when there is no `href`. */
    onClick?: () => void;
  }>;

export type AuthScreenFooterProps = Readonly<{
  /** Optional consent notice (LS-04). */
  notice?: ReactNode;
  /** Terms and privacy links; at least one is required (LS-04). */
  links: readonly AuthScreenPolicyLink[];
  /** Extra product content under the links. */
  children?: ReactNode;
}>;

/**
 * The `footer` slot content: consent notice plus dot-separated policy links. The
 * visible gap between two links is `linkGap` + separator + `linkGap`; the 44px
 * touch target is an invisible hit area, not visible padding.
 */
export function AuthScreenFooter({ notice, links, children }: AuthScreenFooterProps) {
  validateAuthScreenPolicyLinks(links);
  const recipe = authScreenRecipe.footer;
  const weight = useTypeWeight();
  const linkStyle = { fontWeight: weight(recipe.link.textVariant) };
  const hintId = useId();
  return (
    <div className="hjm-auth-screen__footer-content" style={{ gap: recipe.noticeGap }}>
      {notice ? <p className="hjm-text" data-variant={recipe.notice.textVariant} data-font-role="ui" data-tone={recipe.notice.tone} style={{ fontWeight: weight(recipe.notice.textVariant) }}>{notice}</p> : null}
      <div className="hjm-auth-screen__links" style={{
        ["--hjm-auth-screen-link-gap" as string]: `${recipe.linkGap}px`,
        ["--hjm-auth-screen-link-target" as string]: `${authScreenRecipe.footerMinTouchTarget}px`,
      } as CSSProperties}>
        {links.map((link, index) => (
          <Fragment key={`${index}:${link.label}`}>
            {index > 0 ? <span className="hjm-text hjm-auth-screen__separator" data-variant={recipe.link.textVariant} data-tone={recipe.notice.tone} aria-hidden="true">{recipe.separator}</span> : null}
            {link.href !== undefined
              ? <a className="hjm-text hjm-auth-screen__link" data-variant={recipe.link.textVariant} data-font-role="ui" data-tone={recipe.link.tone} style={linkStyle} href={link.href}
                  target={link.target} rel={link.rel ?? (link.target === "_blank" ? "noreferrer noopener" : undefined)}
                  aria-describedby={link.accessibilityHint === undefined ? undefined : `${hintId}-${index}`} onClick={link.onClick}>{link.label}</a>
              : <button type="button" className="hjm-text hjm-auth-screen__link" data-variant={recipe.link.textVariant} data-font-role="ui" data-tone={recipe.link.tone} style={linkStyle}
                  aria-describedby={link.accessibilityHint === undefined ? undefined : `${hintId}-${index}`} onClick={link.onClick}>{link.label}</button>}
            {/* Native announces the hint after the label; Web reads the same text as the link's description. */}
            {link.accessibilityHint === undefined ? null : <span id={`${hintId}-${index}`} className="hjm-visually-hidden">{link.accessibilityHint}</span>}
          </Fragment>
        ))}
      </div>
      {children}
    </div>
  );
}
