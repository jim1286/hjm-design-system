import { createContext } from "react";
export const ScreenFooterContext = createContext(null);
/**
 * Bottom padding of a screen's last region: the screen gutter, or the safe-area inset when larger — never their sum,
 * which left 16 + 34pt under footer buttons on home-indicator devices. While the keyboard covers the screen bottom,
 * the keyboard overlap already clears the home indicator, so only the gutter remains (Web: max(padding, env())).
 */
export function resolveScreenBottomPadding(padding, safeAreaBottom, keyboardOpen) {
    return keyboardOpen ? padding : Math.max(padding, safeAreaBottom);
}
//# sourceMappingURL=screen-footer.js.map