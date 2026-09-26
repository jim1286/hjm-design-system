import {
  designSystemEnvironmentDefaults,
  isLargeTextScale,
  resolveDensityDefault,
  resolveDesignSystemProviderValue,
  validateDesignSystemProviderValue,
  type DesignSystemDensity,
  type DesignSystemDirection,
  type DesignSystemProviderValue,
  type DesignSystemTextScale,
  type ResolveDesignSystemEnvironmentOptions,
} from "@hjmds/design-contracts/components/design-system-provider";
import type { ResolvedTheme, ThemePreference } from "@hjmds/design-contracts/colors";
import { tooltipBehaviorDefaults } from "@hjmds/design-contracts/components/tooltip";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { classNames } from "./internal.js";
import { createHjmThemeStyle } from "./theme.js";

const HjmThemeContext = createContext<DesignSystemProviderValue | null>(null);

/** Per-theme partial palette merged over the HJM defaults; see docs/brand-boundary.md. */
export type HjmBrandPalette = NonNullable<ResolveDesignSystemEnvironmentOptions["brandPalette"]>;

/**
 * The nearest ancestor's brand palette. A nested provider (for example one that
 * only changes density) keeps the product brand instead of falling back to the
 * HJM defaults, because the resolved palette alone cannot be split back into
 * defaults and overrides.
 */
const HjmBrandPaletteContext = createContext<HjmBrandPalette | undefined>(undefined);

export type TooltipCoordinator = Readonly<{
  activeId: string | null;
  activate(id: string): void;
  deactivate(id: string): void;
  shouldSkipDelay(): boolean;
}>;

const TooltipCoordinatorContext = createContext<TooltipCoordinator | null>(null);

function subscribeMedia(query: string, callback: () => void): () => void {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function useMediaQuery(query: string, observe = true): boolean {
  return useSyncExternalStore(
    (callback) => observe ? subscribeMedia(query, callback) : () => undefined,
    () => observe && window.matchMedia(query).matches,
    () => false,
  );
}

type HjmProviderEnvironmentProps = Readonly<{
  value?: never;
  theme?: ThemePreference;
  direction?: DesignSystemDirection;
  textScale?: DesignSystemTextScale;
  reducedMotion?: boolean;
  minimumVisualTarget?: boolean;
  /** Default row/menu/table density below this provider; each component's prop wins. */
  density?: DesignSystemDensity;
  /** Deterministic SSR/test override; otherwise prefers-color-scheme is observed. */
  systemTheme?: ResolvedTheme;
  /**
   * The supported brand route (docs/brand-boundary.md). Before 1.5.0 the only way
   * to brand was a hand-built `value`, which also stopped the provider from
   * following the OS theme and reduced-motion settings.
   */
  brandPalette?: HjmBrandPalette;
}>;

type HjmProviderValueProps = Readonly<{
  /** Complete, validated environment and semantic product palette. */
  value: DesignSystemProviderValue;
  theme?: never;
  direction?: never;
  textScale?: never;
  reducedMotion?: never;
  minimumVisualTarget?: never;
  density?: never;
  systemTheme?: never;
  brandPalette?: never;
}>;

/**
 * How the provider's own host element participates in layout and painting.
 *
 * `surface` (default) paints the HJM background, text color and UI typography,
 * which is what a page whose root *is* the provider needs. A product whose
 * document root already paints its surface previously had to neutralise the
 * host with an inline `display: contents` style, re-entering product code into
 * the renderer boundary; `contents` is that intent as a supported axis — the
 * element still carries the CSS variables, `dir` and data attributes.
 */
export type HjmProviderHost = "surface" | "contents";

export type HjmProviderProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dir"
> &
  Readonly<{
    children: ReactNode;
    host?: HjmProviderHost;
  }> & (HjmProviderEnvironmentProps | HjmProviderValueProps);

export const HjmProvider = forwardRef<HTMLDivElement, HjmProviderProps>(
  function HjmProvider(
    {
      children,
      theme,
      direction,
      textScale,
      reducedMotion,
      minimumVisualTarget,
      density,
      systemTheme,
      brandPalette: suppliedBrandPalette,
      host = "surface",
      value: suppliedValue,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const parent = useContext(HjmThemeContext);
    const inheritedBrandPalette = useContext(HjmBrandPaletteContext);
    const brandPalette = suppliedBrandPalette ?? inheritedBrandPalette;
    const observesSystem = suppliedValue === undefined;
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", observesSystem);
    const prefersReducedMotion = useMediaQuery(
      "(prefers-reduced-motion: reduce)",
      observesSystem,
    );
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
      ...(brandPalette === undefined ? {} : { brandPalette }),
      ...(parent === null ? {} : { parent: parent.environment }),
      ...(reducedMotion === undefined && parent === null
        ? { systemReducedMotion: prefersReducedMotion }
        : {}),
    });
    validateDesignSystemProviderValue(value);
    const environment = value.environment;
    const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
    const activeTooltipIdRef = useRef<string | null>(null);
    const lastTooltipTransitionAtRef = useRef(Number.NEGATIVE_INFINITY);
    activeTooltipIdRef.current = activeTooltipId;
    const activateTooltip = useCallback((id: string) => {
      setActiveTooltipId((current) => {
        if (current === id) return current;
        if (current !== null) lastTooltipTransitionAtRef.current = Date.now();
        activeTooltipIdRef.current = id;
        return id;
      });
    }, []);
    const deactivateTooltip = useCallback((id: string) => {
      setActiveTooltipId((current) => {
        if (current !== id) return current;
        lastTooltipTransitionAtRef.current = Date.now();
        activeTooltipIdRef.current = null;
        return null;
      });
    }, []);
    const shouldSkipTooltipDelay = useCallback(
      () =>
        activeTooltipIdRef.current !== null ||
        Date.now() - lastTooltipTransitionAtRef.current <
          tooltipBehaviorDefaults.skipDelayMs,
      [],
    );
    const tooltipCoordinator: TooltipCoordinator = {
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

    return (
      <HjmThemeContext.Provider value={value}>
        <HjmBrandPaletteContext.Provider value={suppliedValue === undefined ? brandPalette : undefined}>
          <TooltipCoordinatorContext.Provider value={tooltipCoordinator}>
            <div
              {...rest}
              ref={ref}
              className={classNames("hjm-root", className)}
              data-hjm-provider=""
              data-host={host}
              data-motion={environment.reducedMotion ? "reduced" : "full"}
              data-theme={environment.theme}
              data-text-scale={environment.textScale}
              data-large-text={largeText}
              dir={environment.direction}
              style={{ ...createHjmThemeStyle(value), ...style }}
            >
              {children}
            </div>
          </TooltipCoordinatorContext.Provider>
        </HjmBrandPaletteContext.Provider>
      </HjmThemeContext.Provider>
    );
  },
);

export function useHjmTheme(): DesignSystemProviderValue {
  const value = useContext(HjmThemeContext);
  if (value === null) {
    throw new Error("useHjmTheme must be used inside HjmProvider");
  }
  return value;
}

/** Renderer components use the browser default direction when no provider is present. */
export function useOptionalHjmTheme(): DesignSystemProviderValue | null {
  return useContext(HjmThemeContext);
}

/**
 * Resolves the provider's density onto one component's own density vocabulary.
 * Outside a provider the component's recipe default stands — a global axis must
 * not make an unwrapped renderer behave differently from a wrapped one at rest.
 */
export function useHjmDensityDefault<Comfortable extends string, Compact extends string>(
  vocabulary: Readonly<{ comfortable: Comfortable; compact: Compact }>,
): Comfortable | Compact {
  const theme = useContext(HjmThemeContext);
  return resolveDensityDefault(
    theme?.environment.density ?? designSystemEnvironmentDefaults.density,
    vocabulary,
  );
}

/** Internal provider-scoped coordination used by Tooltip renderers. */
export function useTooltipCoordinator(): TooltipCoordinator | null {
  return useContext(TooltipCoordinatorContext);
}
