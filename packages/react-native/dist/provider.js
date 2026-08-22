import { jsx as _jsx } from "react/jsx-runtime";
import { resolveDesignSystemProviderValue, } from "@hjm/design-contracts/components/design-system-provider";
import { spacing, radius, typography } from "@hjm/design-contracts/foundations";
import { createContext, useContext, useEffect, useMemo, useState, } from "react";
import { AccessibilityInfo, I18nManager, useColorScheme, useWindowDimensions, } from "react-native";
const HjmNativeThemeContext = createContext(null);
function useSystemReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
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
    }, []);
    return reducedMotion;
}
function toEnvironmentInput(props) {
    return {
        ...(props.theme === undefined ? {} : { theme: props.theme }),
        ...(props.direction === undefined ? {} : { direction: props.direction }),
        ...(props.textScale === undefined ? {} : { textScale: props.textScale }),
        ...(props.reducedMotion === undefined ? {} : { reducedMotion: props.reducedMotion }),
    };
}
export function HjmNativeProvider({ children, theme, direction, textScale, reducedMotion, }) {
    const parent = useContext(HjmNativeThemeContext);
    const colorScheme = useColorScheme();
    const systemReducedMotion = useSystemReducedMotion();
    const { fontScale: systemTextScale } = useWindowDimensions();
    const environment = useMemo(() => toEnvironmentInput({
        ...(theme === undefined ? {} : { theme }),
        ...(direction === undefined ? {} : { direction }),
        ...(textScale === undefined ? {} : { textScale }),
        ...(reducedMotion === undefined ? {} : { reducedMotion }),
    }), [direction, reducedMotion, textScale, theme]);
    const value = useMemo(() => {
        const resolved = resolveDesignSystemProviderValue(environment, {
            systemTheme: colorScheme === "dark" ? "dark" : "light",
            systemDirection: I18nManager.isRTL ? "rtl" : "ltr",
            systemTextScale,
            systemReducedMotion,
            ...(parent === null ? {} : { parent: parent.environment }),
        });
        return {
            ...resolved,
            colors: resolved.palette.theme,
            tokens: { spacing, radius, typography },
        };
    }, [colorScheme, environment, parent, systemReducedMotion, systemTextScale]);
    return _jsx(HjmNativeThemeContext.Provider, { value: value, children: children });
}
export function useHjmNativeTheme() {
    const value = useContext(HjmNativeThemeContext);
    if (value === null) {
        throw new Error("useHjmNativeTheme must be used inside HjmNativeProvider");
    }
    return value;
}
//# sourceMappingURL=provider.js.map