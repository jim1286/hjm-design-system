import { type AuthProviderButtonDescriptor } from "@hjmds/design-contracts/components/provider-button";
import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type AuthProviderButtonProps = Readonly<{
    descriptor: AuthProviderButtonDescriptor;
    /** The provider's own mark, supplied by the product — never bundled here. */
    logo: ReactNode;
    onPress: () => void;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function AuthProviderButton({ descriptor, logo, onPress, layoutStyle }: AuthProviderButtonProps): import("react").JSX.Element;
//# sourceMappingURL=provider-button.d.ts.map