import { type AuthScreenDescriptor } from "@hjmds/design-contracts/components/auth-screen";
import { type HTMLAttributes, type ReactNode } from "react";
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
    density?: import("@hjmds/design-contracts/components/auth-screen").AuthScreenDensity;
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
//# sourceMappingURL=auth-screen.d.ts.map