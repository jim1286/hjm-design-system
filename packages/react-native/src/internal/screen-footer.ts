import { createContext } from "react";

/**
 * Set inside a padded ScreenLayout or Sheet footer. The parent already owns the bar chrome and safe area, so
 * BottomCTA placed there renders only its copy and actions; drawing its own bar too doubled the border, inset the
 * buttons twice and (Native) added a shadowed surface inside the footer (2026-10-17 screen review, common-screen-shell).
 * `bottomPadding` is the footer's resolved bottom padding, so a BottomCTA `safeAreaBottom` only adds what the footer
 * does not already cover (max, not sum — 2026-10-17 user report: too much space below buttons). `null` outside a bare-capable footer.
 */
export type ScreenFooterPlacement = Readonly<{ bottomPadding: number }>;
export const ScreenFooterContext = createContext<ScreenFooterPlacement | null>(null);

/**
 * Bottom padding of a screen's last region: the screen gutter, or the safe-area inset when larger — never their sum,
 * which left 16 + 34pt under footer buttons on home-indicator devices. While the keyboard covers the screen bottom,
 * the keyboard overlap already clears the home indicator, so only the gutter remains (Web: max(padding, env())).
 */
export function resolveScreenBottomPadding(padding: number, safeAreaBottom: number, keyboardOpen: boolean): number {
  return keyboardOpen ? padding : Math.max(padding, safeAreaBottom);
}
