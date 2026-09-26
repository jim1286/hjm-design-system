import { jsx as _jsx } from "react/jsx-runtime";
import { resolveDesignSystemProviderValue, validateDesignSystemProviderValue, } from "@hjmds/design-contracts/components/design-system-provider";
import { spacing, radius, typography } from "@hjmds/design-contracts/foundations";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, } from "react";
import { AccessibilityInfo, I18nManager, Platform, useColorScheme, useWindowDimensions, } from "react-native";
const HjmNativeThemeContext = createContext(null);
/**
 * The nearest ancestor's brand palette, so a nested provider keeps the product
 * brand; the resolved palette cannot be split back into defaults and overrides.
 */
const HjmNativeBrandPaletteContext = createContext(undefined);
const subscribeHydration = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;
function useSystemReducedMotion(observe) {
    // AccessibilityInfo resolves asynchronously. Treat the unknown first frame
    // as reduced motion so a surface never starts an animation before the OS
    // preference is known; an explicit Provider value still wins immediately.
    const [reducedMotion, setReducedMotion] = useState(true);
    useEffect(() => {
        if (!observe)
            return undefined;
        let active = true;
        void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
            if (active)
                setReducedMotion(enabled);
        });
        const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
        return () => {
            active = false;
            subscription.remove();
        };
    }, [observe]);
    return reducedMotion;
}
function toEnvironmentInput(props) {
    return {
        ...(props.theme === undefined ? {} : { theme: props.theme }),
        ...(props.direction === undefined ? {} : { direction: props.direction }),
        ...(props.textScale === undefined ? {} : { textScale: props.textScale }),
        ...(props.reducedMotion === undefined ? {} : { reducedMotion: props.reducedMotion }),
        ...(props.minimumVisualTarget === undefined
            ? {}
            : { minimumVisualTarget: props.minimumVisualTarget }),
    };
}
export function HjmNativeProvider({ children, theme, direction, textScale, reducedMotion, minimumVisualTarget, brandPalette: suppliedBrandPalette, value: suppliedValue, }) {
    const parent = useContext(HjmNativeThemeContext);
    const inheritedBrandPalette = useContext(HjmNativeBrandPaletteContext);
    const brandPalette = suppliedValue === undefined ? suppliedBrandPalette ?? inheritedBrandPalette : undefined;
    const colorScheme = useColorScheme();
    // Match Expo web's light server snapshot to avoid stale styles after hydration;
    // native stays immediate. See README: static-web theme precedence.
    const isClient = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
    const systemTheme = colorScheme === "dark" && (Platform.OS !== "web" || isClient)
        ? "dark"
        : "light";
    const systemReducedMotion = useSystemReducedMotion(suppliedValue === undefined && reducedMotion === undefined && parent === null);
    const { fontScale: systemTextScale } = useWindowDimensions();
    const environment = useMemo(() => toEnvironmentInput({
        ...(theme === undefined ? {} : { theme }),
        ...(direction === undefined ? {} : { direction }),
        ...(textScale === undefined ? {} : { textScale }),
        ...(reducedMotion === undefined ? {} : { reducedMotion }),
        ...(minimumVisualTarget === undefined ? {} : { minimumVisualTarget }),
    }), [direction, minimumVisualTarget, reducedMotion, textScale, theme]);
    const contextValue = useMemo(() => {
        const resolved = suppliedValue ?? resolveDesignSystemProviderValue(environment, {
            systemTheme,
            systemDirection: I18nManager.isRTL ? "rtl" : "ltr",
            systemTextScale,
            systemReducedMotion,
            ...(brandPalette === undefined ? {} : { brandPalette }),
            ...(parent === null ? {} : { parent: parent.environment }),
        });
        validateDesignSystemProviderValue(resolved);
        const textScalingMode = suppliedValue !== undefined || textScale !== undefined
            ? "controlled"
            : parent?.textScaling.mode ?? "native";
        return {
            ...resolved,
            colors: resolved.palette.theme,
            textScaling: {
                mode: textScalingMode,
                scale: resolved.environment.textScale,
            },
            tokens: { spacing, radius, typography },
        };
    }, [brandPalette, environment, parent, suppliedValue, systemReducedMotion, systemTextScale, systemTheme]);
    return (_jsx(HjmNativeThemeContext.Provider, { value: contextValue, children: _jsx(HjmNativeBrandPaletteContext.Provider, { value: brandPalette, children: children }) }));
}
export function useHjmNativeTheme() {
    const value = useContext(HjmNativeThemeContext);
    if (value === null) {
        throw new Error("useHjmNativeTheme must be used inside HjmNativeProvider");
    }
    return value;
}
//# sourceMappingURL=provider.js.map