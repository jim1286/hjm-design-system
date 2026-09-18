import { jsx as _jsx } from "react/jsx-runtime";
import { designSystemEnvironmentDefaults, isLargeTextScale, resolveDensityDefault, resolveDesignSystemProviderValue, validateDesignSystemProviderValue, } from "@hjmds/design-contracts/components/design-system-provider";
import { tooltipBehaviorDefaults } from "@hjmds/design-contracts/components/tooltip";
import { createContext, forwardRef, useCallback, useContext, useRef, useState, useSyncExternalStore, } from "react";
import { classNames } from "./internal.js";
import { createHjmThemeStyle } from "./theme.js";
const HjmThemeContext = createContext(null);
const TooltipCoordinatorContext = createContext(null);
function subscribeMedia(query, callback) {
    const media = window.matchMedia(query);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
}
function useMediaQuery(query, observe = true) {
    return useSyncExternalStore((callback) => observe ? subscribeMedia(query, callback) : () => undefined, () => observe && window.matchMedia(query).matches, () => false);
}
export const HjmProvider = forwardRef(function HjmProvider({ children, theme, direction, textScale, reducedMotion, minimumVisualTarget, density, systemTheme, host = "surface", value: suppliedValue, className, style, ...rest }, ref) {
    const parent = useContext(HjmThemeContext);
    const observesSystem = suppliedValue === undefined;
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", observesSystem);
    const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", observesSystem);
    const resolvedSystemTheme = systemTheme ?? (prefersDark ? "dark" : "light");
    const input = {
        ...(theme === undefined ? {} : { theme }),
        ...(direction === undefined ? {} : { direction }),
        ...(textScale === undefined ? {} : { textScale }),
        ...(reducedMotion === undefined ? {} : { reducedMotion }),
        ...(minimumVisualTarget === undefined ? {} : { minimumVisualTarget }),
        ...(density === undefined ? {} : { density }),
    };
    const value = suppliedValue ?? resolveDesignSystemProviderValue(input, {
        systemTheme: resolvedSystemTheme,
        ...(parent === null ? {} : { parent: parent.environment }),
        ...(reducedMotion === undefined && parent === null
            ? { systemReducedMotion: prefersReducedMotion }
            : {}),
    });
    validateDesignSystemProviderValue(value);
    const environment = value.environment;
    const [activeTooltipId, setActiveTooltipId] = useState(null);
    const activeTooltipIdRef = useRef(null);
    const lastTooltipTransitionAtRef = useRef(Number.NEGATIVE_INFINITY);
    activeTooltipIdRef.current = activeTooltipId;
    const activateTooltip = useCallback((id) => {
        setActiveTooltipId((current) => {
            if (current === id)
                return current;
            if (current !== null)
                lastTooltipTransitionAtRef.current = Date.now();
            activeTooltipIdRef.current = id;
            return id;
        });
    }, []);
    const deactivateTooltip = useCallback((id) => {
        setActiveTooltipId((current) => {
            if (current !== id)
                return current;
            lastTooltipTransitionAtRef.current = Date.now();
            activeTooltipIdRef.current = null;
            return null;
        });
    }, []);
    const shouldSkipTooltipDelay = useCallback(() => activeTooltipIdRef.current !== null ||
        Date.now() - lastTooltipTransitionAtRef.current <
            tooltipBehaviorDefaults.skipDelayMs, []);
    const tooltipCoordinator = {
        activeId: activeTooltipId,
        activate: activateTooltip,
        deactivate: deactivateTooltip,
        shouldSkipDelay: shouldSkipTooltipDelay,
    };
    // `data-text-scale` is a number, so a stylesheet cannot ask whether it crossed
    // `largeTextThreshold`. The provider resolves that comparison once and publishes
    // the answer; letting each renderer read the environment instead would pull this
    // module into granular entries like ./selection and blow their gzip budgets.
    // See issue #20.
    const largeText = isLargeTextScale(environment.textScale) ? "true" : undefined;
    return (_jsx(HjmThemeContext.Provider, { value: value, children: _jsx(TooltipCoordinatorContext.Provider, { value: tooltipCoordinator, children: _jsx("div", { ...rest, ref: ref, className: classNames("hjm-root", className), "data-hjm-provider": "", "data-host": host, "data-motion": environment.reducedMotion ? "reduced" : "full", "data-theme": environment.theme, "data-text-scale": environment.textScale, "data-large-text": largeText, dir: environment.direction, style: { ...createHjmThemeStyle(value), ...style }, children: children }) }) }));
});
export function useHjmTheme() {
    const value = useContext(HjmThemeContext);
    if (value === null) {
        throw new Error("useHjmTheme must be used inside HjmProvider");
    }
    return value;
}
/** Renderer components use the browser default direction when no provider is present. */
export function useOptionalHjmTheme() {
    return useContext(HjmThemeContext);
}
/**
 * Resolves the provider's density onto one component's own density vocabulary.
 * Outside a provider the component's recipe default stands — a global axis must
 * not make an unwrapped renderer behave differently from a wrapped one at rest.
 */
export function useHjmDensityDefault(vocabulary) {
    const theme = useContext(HjmThemeContext);
    return resolveDensityDefault(theme?.environment.density ?? designSystemEnvironmentDefaults.density, vocabulary);
}
/** Internal provider-scoped coordination used by Tooltip renderers. */
export function useTooltipCoordinator() {
    return useContext(TooltipCoordinatorContext);
}
//# sourceMappingURL=provider.js.map