import { type ReactNode } from "react";
/**
 * Height of the screen bottom covered by an overlay BottomNavigation (0 when there is none, the bar is inline, or
 * it is hidden for the keyboard). It already contains the bar's safe-area padding. ScreenLayout reads it so a
 * floating bar no longer needs a hand-kept spacer per tab screen (Spint TAB_BAR_SPACE, 2026-10-18). Kept out of
 * navigation.tsx so screens.tsx can read it without importing the navigation graph.
 */
export declare const BottomNavigationInsetContext: import("react").Context<number>;
/** Set by BottomNavigationInsetProvider; an overlay BottomNavigation publishes its measured height through it. */
export declare const BottomNavigationInsetReporterContext: import("react").Context<((height: number) => void) | null>;
export type BottomNavigationInsetProviderProps = Readonly<{
    children: ReactNode;
}>;
/**
 * Wrap the region that holds both the screens and an overlay BottomNavigation (for example the tab navigator).
 * ScreenLayout applies the covered height to its last region and is its only owner: content inside a ScreenLayout
 * (a `scroll="content"` list included) must not add it again. Layouts that are not a ScreenLayout read it with
 * `useBottomNavigationInset()`.
 */
export declare function BottomNavigationInsetProvider({ children }: BottomNavigationInsetProviderProps): import("react").JSX.Element;
/**
 * Bottom height covered by the nearest overlay BottomNavigation; 0 outside a provider. For layouts that are not a
 * ScreenLayout: inside one the shell already pads by it, so adding it again doubles the space.
 */
export declare function useBottomNavigationInset(): number;
//# sourceMappingURL=bottom-navigation-inset.d.ts.map