import { authScreenRecipe, type AuthScreenDescriptor } from "@hjmds/design-contracts/components/auth-screen";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type AuthScreenLayoutProps = AuthScreenDescriptor & Readonly<{
    /** Product mark, title and description. The product owns every string here. */
    hero: ReactNode;
    /** The primary action block — provider buttons, or a product's own sign-in bundle. */
    main: ReactNode;
    /** Consent notice and policy links. Omit with `hasFooter: false`. */
    footer?: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. Content taller than the viewport scrolls instead of pushing the
 * footer off screen — that is why the outer element is a ScrollView whose content
 * container grows.
 */
export declare function AuthScreenLayout({ hero, main, footer, density, hasFooter, style, }: AuthScreenLayoutProps): import("react").JSX.Element;
export { authScreenRecipe };
//# sourceMappingURL=auth-screen.d.ts.map