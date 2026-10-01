import { authScreenRecipe, type AuthScreenDescriptor } from "@hjmds/design-contracts/components/auth-screen";
import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type AuthScreenLayoutProps = AuthScreenDescriptor & Readonly<{
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
    testID?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. Content taller than the viewport scrolls instead of pushing the
 * footer off screen — that is why the outer element is a ScrollView whose content
 * container grows.
 * Review forms must accept submit taps while focused; iOS owns the scroll inset
 * so a product does not have to wrap this in another keyboard-avoiding view.
 */
export declare function AuthScreenLayout({ hero, main, footer, density, hasFooter, pendingLabel, mainCard, layoutStyle, testID, }: AuthScreenLayoutProps): import("react").JSX.Element;
export { authScreenRecipe };
//# sourceMappingURL=auth-screen.d.ts.map