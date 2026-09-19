import { type AuthScreenDescriptor } from "@hjmds/design-contracts/components/auth-screen";
import { type HTMLAttributes, type ReactNode } from "react";
export type AuthScreenLayoutProps = Omit<HTMLAttributes<HTMLElement>, "children"> & AuthScreenDescriptor & Readonly<{
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
export declare const AuthScreenLayout: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    density?: import("@hjmds/design-contracts/components/auth-screen").AuthScreenDensity;
    hasFooter?: boolean;
}> & Readonly<{
    /** Product mark, title and description. The product owns every string here. */
    hero: ReactNode;
    /** The primary action block — provider buttons, or a product's own sign-in bundle. */
    main: ReactNode;
    /** Consent notice and policy links. Omit with `hasFooter: false`. */
    footer?: ReactNode;
    className?: string;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=auth-screen.d.ts.map