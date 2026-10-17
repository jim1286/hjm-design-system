import { type AuthScreenDensity, type AuthScreenDescriptor, type AuthScreenHeroDescriptor, type AuthScreenPolicyLinkDescriptor } from "@hjmds/design-contracts/components/auth-screen";
import { type HTMLAttributeAnchorTarget, type HTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type AuthScreenLayoutProps = Omit<HTMLAttributes<HTMLElement>, "children"> & AuthScreenDescriptor & Readonly<{
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
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. The measurements come from the resolved descriptor as custom
 * properties so the stylesheet keeps one source of truth with the contract.
 */
export declare const AuthScreenLayout: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    density?: AuthScreenDensity;
    hasFooter?: boolean;
}> & Readonly<{
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
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLElement>>;
export type AuthScreenHeroProps = AuthScreenHeroDescriptor & Readonly<{
    /** Product mark asset. HJM never ships product marks. */
    mark?: ReactNode;
}>;
/**
 * The `hero` slot content: mark, eyebrow, tagline and one description line. The
 * product supplies the strings and mark; the type steps, tones and gaps come from
 * `authScreenRecipe.hero` so a login slogan never borrows the page-heading size.
 */
export declare function AuthScreenHero({ mark, title, eyebrow, description, headingLevel }: AuthScreenHeroProps): import("react").JSX.Element;
export type AuthScreenPolicyLink = AuthScreenPolicyLinkDescriptor & Readonly<{
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
export declare function AuthScreenFooter({ notice, links, children }: AuthScreenFooterProps): import("react").JSX.Element;
//# sourceMappingURL=auth-screen.d.ts.map