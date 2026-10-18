import { authScreenRecipe, type AuthScreenDescriptor, type AuthScreenHeroDescriptor, type AuthScreenPolicyLinkDescriptor } from "@hjmds/design-contracts/components/auth-screen";
import { type ScreenInitialFocus } from "@hjmds/design-contracts/screen-patterns";
import { type ReactNode } from "react";
import { type ScreenExit } from "./internal/screen-exit.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type AuthScreenLayoutProps = AuthScreenDescriptor & Readonly<{
    /**
     * Route name in the shared screen header band (screenHeaderRecipe, centered like ScreenLayout). Login and signup
     * routes kept a TopBar above this layout only for the route name + back/close (2026-10-18: utilverse, burntok).
     * The band does not scroll; the host still owns the top safe area, as for ScreenLayout.
     */
    title?: string;
    /** Leaving the route: the same icon-only back/close as ScreenLayout `exit`, at the header's leading edge. */
    exit?: ScreenExit;
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
    /**
     * Bottom safe-area inset of the window edge this screen reaches (`useSafeAreaInsets().bottom`; 0 inside a host that
     * already insets the bottom). The layout's bottom padding becomes max(paddingBlock, inset) — the ScreenLayout rule,
     * never their sum — so policy links clear the home indicator / Android gesture bar without a product wrapper
     * (2026-10-17 1.28 adoption: diairy, utilverse and spint each wrapped this layout in their own bottom inset).
     * Pass it instead of a bottom SafeAreaView edge, never both.
     */
    safeAreaBottom?: number;
    /**
     * Entry focus, same rules as ScreenLayout `initialFocus`. Off by default because auth screens lead with provider
     * buttons; a signup nickname step opts in with `first-input` (2026-10-18 adoption: spint and utilverse signup).
     */
    initialFocus?: ScreenInitialFocus;
    testID?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. Content taller than the viewport scrolls instead of pushing the
 * footer off screen — that is why the outer element is a ScrollView whose content
 * container grows.
 * Review forms must accept submit taps while focused; iOS owns the keyboard scroll inset
 * so a product does not have to wrap this in another keyboard-avoiding view.
 * Safe areas follow ScreenLayout: the host owns the top edge and `safeAreaBottom` the bottom. iOS automatic content
 * inset adjustment is off because it added the home-indicator inset on iOS only, on top of paddingBlock, which made
 * every product add its own Android inset (spint) or wrap the layout (diairy, utilverse) — 2026-10-17.
 */
export declare function AuthScreenLayout({ title, exit, hero, main, footer, density, hasFooter, pendingLabel, mainCard, safeAreaBottom, layoutStyle, testID, initialFocus, }: AuthScreenLayoutProps): import("react").JSX.Element;
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