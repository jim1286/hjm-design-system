import { authScreenRecipe, type AuthScreenDescriptor, type AuthScreenHeroDescriptor, type AuthScreenPolicyLinkDescriptor } from "@hjmds/design-contracts/components/auth-screen";
import { type ReactNode } from "react";
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
export type AuthScreenHeroProps = AuthScreenHeroDescriptor & Readonly<{
    /** Product mark asset. HJM never ships product marks. */
    mark?: ReactNode;
}>;
/**
 * The `hero` slot content: mark, eyebrow, tagline and one description line. Type
 * steps, tones and gaps come from `authScreenRecipe.hero`, matching Web.
 */
export declare function AuthScreenHero({ mark, title, eyebrow, description, headingLevel }: AuthScreenHeroProps): import("react").JSX.Element;
export type AuthScreenPolicyLink = AuthScreenPolicyLinkDescriptor & Readonly<{
    onPress: () => void;
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
 * visible gap between links is `linkGap` + separator + `linkGap`; the 44pt touch
 * target comes from hitSlop, not visible padding (2026-10-17 user report: reduce the link gap).
 */
export declare function AuthScreenFooter({ notice, links, children }: AuthScreenFooterProps): import("react").JSX.Element;
export { authScreenRecipe };
//# sourceMappingURL=auth-screen.d.ts.map