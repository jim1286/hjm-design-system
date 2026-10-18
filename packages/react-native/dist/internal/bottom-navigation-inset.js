import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useMemo, useState } from "react";
/**
 * Height of the screen bottom covered by an overlay BottomNavigation (0 when there is none, the bar is inline, or
 * it is hidden for the keyboard). It already contains the bar's safe-area padding. ScreenLayout reads it so a
 * floating bar no longer needs a hand-kept spacer per tab screen (Spint TAB_BAR_SPACE, 2026-10-18). Kept out of
 * navigation.tsx so screens.tsx can read it without importing the navigation graph.
 */
export const BottomNavigationInsetContext = createContext(0);
/** Set by BottomNavigationInsetProvider; an overlay BottomNavigation publishes its measured height through it. */
export const BottomNavigationInsetReporterContext = createContext(null);
/**
 * Wrap the region that holds both the screens and an overlay BottomNavigation (for example the tab navigator).
 * Screens inside read the covered height with `useBottomNavigationInset()`; ScreenLayout applies it itself.
 */
export function BottomNavigationInsetProvider({ children }) {
    const [inset, setInset] = useState(0);
    const report = useMemo(() => (height) => {
        const next = Number.isFinite(height) && height > 0 ? height : 0;
        setInset(current => current === next ? current : next);
    }, []);
    return (_jsx(BottomNavigationInsetReporterContext.Provider, { value: report, children: _jsx(BottomNavigationInsetContext.Provider, { value: inset, children: children }) }));
}
/** Bottom height covered by the nearest overlay BottomNavigation; 0 outside a provider. */
export function useBottomNavigationInset() {
    return useContext(BottomNavigationInsetContext);
}
//# sourceMappingURL=bottom-navigation-inset.js.map