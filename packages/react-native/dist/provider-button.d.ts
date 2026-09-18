import { type AuthProviderButtonDescriptor } from "@hjmds/design-contracts/components/provider-button";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type AuthProviderButtonProps = Readonly<{
    descriptor: AuthProviderButtonDescriptor;
    /** The provider's own mark, supplied by the product — never bundled here. */
    logo: ReactNode;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
}>;
export declare function AuthProviderButton({ descriptor, logo, onPress, style }: AuthProviderButtonProps): import("react").JSX.Element;
//# sourceMappingURL=provider-button.d.ts.map