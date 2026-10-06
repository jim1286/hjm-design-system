import { type AuthProviderButtonDescriptor } from "@hjmds/design-contracts/components/provider-button";
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type AuthProviderButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled" | "style"> & Readonly<{
    descriptor: AuthProviderButtonDescriptor;
    /**
     * The provider's own mark, supplied by the product: brand assets have
     * per-provider redistribution terms, so the design system never bundles them.
     */
    logo: ReactNode;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const AuthProviderButton: import("react").ForwardRefExoticComponent<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style" | "disabled"> & Readonly<{
    descriptor: AuthProviderButtonDescriptor;
    /**
     * The provider's own mark, supplied by the product: brand assets have
     * per-provider redistribution terms, so the design system never bundles them.
     */
    logo: ReactNode;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=provider-button.d.ts.map