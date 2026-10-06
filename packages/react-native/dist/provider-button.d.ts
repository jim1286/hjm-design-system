import { type AuthProviderButtonDescriptor } from "@hjmds/design-contracts/components/provider-button";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type AuthProviderButtonProps = Readonly<{
    descriptor: AuthProviderButtonDescriptor;
    /** The provider's own mark, supplied by the product — never bundled here. */
    logo: ReactNode;
    onPress: () => void;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * the provider surface (`authProviderButtonRecipe`) owns appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
export declare function AuthProviderButton({ descriptor, logo, onPress, layoutStyle, style }: AuthProviderButtonProps): import("react").JSX.Element;
//# sourceMappingURL=provider-button.d.ts.map