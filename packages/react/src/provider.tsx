import {
  resolveDesignSystemProviderValue,
  type DesignSystemDirection,
  type DesignSystemProviderValue,
  type DesignSystemTextScale,
} from "@hjm/design-contracts/components/design-system-provider";
import type { ResolvedTheme, ThemePreference } from "@hjm/design-contracts/colors";
import { tooltipBehaviorDefaults } from "@hjm/design-contracts/components/tooltip";
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

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribeMedia(query, callback),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export type HjmProviderProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dir"
> &
  Readonly<{
    children: ReactNode;
    theme?: ThemePreference;
    direction?: DesignSystemDirection;
    textScale?: DesignSystemTextScale;
    reducedMotion?: boolean;
    /** Deterministic SSR/test override; otherwise prefers-color-scheme is observed. */
    systemTheme?: ResolvedTheme;
  }>;

export const HjmProvider = forwardRef<HTMLDivElement, HjmProviderProps>(
  function HjmProvider(
    {
      children,
      theme,
      direction,
      textScale,
      reducedMotion,
      systemTheme,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const parent = useContext(HjmThemeContext);
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
    const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    const resolvedSystemTheme = systemTheme ?? (prefersDark ? "dark" : "light");
    const input = {
      ...(theme === undefined ? {} : { theme }),
      ...(direction === undefined ? {} : { direction }),
      ...(textScale === undefined ? {} : { textScale }),
      ...(reducedMotion === undefined ? {} : { reducedMotion }),
    };
    const value = resolveDesignSystemProviderValue(input, {
      systemTheme: resolvedSystemTheme,
      ...(parent === null ? {} : { parent: parent.environment }),
      ...(reducedMotion === undefined && parent === null
        ? { systemReducedMotion: prefersReducedMotion }
        : {}),
    });
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

    return (
      <HjmThemeContext.Provider value={value}>
        <TooltipCoordinatorContext.Provider value={tooltipCoordinator}>
          <div
            {...rest}
            ref={ref}
            className={classNames("hjm-root", className)}
            data-hjm-provider=""
            data-motion={environment.reducedMotion ? "reduced" : "full"}
            data-theme={environment.theme}
            data-text-scale={environment.textScale}
            dir={environment.direction}
            style={{ ...createHjmThemeStyle(value), ...style }}
          >
            {children}
          </div>
        </TooltipCoordinatorContext.Provider>
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

/** Internal provider-scoped coordination used by Tooltip renderers. */
export function useTooltipCoordinator(): TooltipCoordinator | null {
  return useContext(TooltipCoordinatorContext);
}
