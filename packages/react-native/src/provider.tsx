import {
  resolveDesignSystemProviderValue,
  validateDesignSystemProviderValue,
  type DesignSystemDirection,
  type DesignSystemEnvironmentInput,
  type DesignSystemProviderValue,
  type DesignSystemTextScale,
  type ResolveDesignSystemEnvironmentOptions,
} from "@hjmds/design-contracts/components/design-system-provider";
import type { ThemePreference } from "@hjmds/design-contracts/colors";
import { spacing, radius, typography } from "@hjmds/design-contracts/foundations";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  AccessibilityInfo,
  I18nManager,
  Platform,
  useColorScheme,
  useWindowDimensions,
} from "react-native";

import type { NativeTextScaling } from "./internal/styles.js";

export type HjmNativeTheme = DesignSystemProviderValue &
  Readonly<{
    colors: DesignSystemProviderValue["palette"]["theme"];
    /**
     * Native lets the OS scale text automatically. A product-supplied scale,
     * however, must be applied by HJM exactly once instead of being multiplied
     * by the OS a second time.
     */
    textScaling: NativeTextScaling;
    tokens: Readonly<{
      spacing: typeof spacing;
      radius: typeof radius;
      typography: typeof typography;
    }>;
  }>;

/** Per-theme partial palette merged over the HJM defaults; see docs/brand-boundary.md. */
export type HjmNativeBrandPalette = NonNullable<ResolveDesignSystemEnvironmentOptions["brandPalette"]>;

type HjmNativeProviderEnvironmentProps = Readonly<{
  value?: never;
  theme?: ThemePreference;
  direction?: DesignSystemDirection;
  textScale?: DesignSystemTextScale;
  reducedMotion?: boolean;
  minimumVisualTarget?: boolean;
  /**
   * The supported brand route. Before 1.5.0 branding required a hand-built
   * `value`, which also stopped following the OS theme, text scale and
   * reduced-motion settings.
   */
  brandPalette?: HjmNativeBrandPalette;
}>;

type HjmNativeProviderValueProps = Readonly<{
  /** Pre-resolved environment and product palette for first-party renderer adaptation. */
  value: DesignSystemProviderValue;
  theme?: never;
  direction?: never;
  textScale?: never;
  reducedMotion?: never;
  minimumVisualTarget?: never;
  brandPalette?: never;
}>;

export type HjmNativeProviderProps = Readonly<{
  children: ReactNode;
}> & (HjmNativeProviderEnvironmentProps | HjmNativeProviderValueProps);

const HjmNativeThemeContext = createContext<HjmNativeTheme | null>(null);

/**
 * The nearest ancestor's brand palette, so a nested provider keeps the product
 * brand; the resolved palette cannot be split back into defaults and overrides.
 */
const HjmNativeBrandPaletteContext = createContext<HjmNativeBrandPalette | undefined>(undefined);

const subscribeHydration = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function useSystemReducedMotion(observe: boolean): boolean {
  // AccessibilityInfo resolves asynchronously. Treat the unknown first frame
  // as reduced motion so a surface never starts an animation before the OS
  // preference is known; an explicit Provider value still wins immediately.
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    if (!observe) return undefined;
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReducedMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, [observe]);

  return reducedMotion;
}

function toEnvironmentInput(
  props: HjmNativeProviderEnvironmentProps,
): DesignSystemEnvironmentInput {
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

export function HjmNativeProvider({
  children,
  theme,
  direction,
  textScale,
  reducedMotion,
  minimumVisualTarget,
  brandPalette: suppliedBrandPalette,
  value: suppliedValue,
}: HjmNativeProviderProps) {
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
  const systemReducedMotion = useSystemReducedMotion(
    suppliedValue === undefined && reducedMotion === undefined && parent === null,
  );
  const { fontScale: systemTextScale } = useWindowDimensions();
  const environment = useMemo(
    () =>
      toEnvironmentInput({
        ...(theme === undefined ? {} : { theme }),
        ...(direction === undefined ? {} : { direction }),
        ...(textScale === undefined ? {} : { textScale }),
        ...(reducedMotion === undefined ? {} : { reducedMotion }),
        ...(minimumVisualTarget === undefined ? {} : { minimumVisualTarget }),
      }),
    [direction, minimumVisualTarget, reducedMotion, textScale, theme],
  );

  const contextValue = useMemo<HjmNativeTheme>(() => {
    const resolved = suppliedValue ?? resolveDesignSystemProviderValue(
      environment,
      {
        systemTheme,
        systemDirection: I18nManager.isRTL ? "rtl" : "ltr",
        systemTextScale,
        systemReducedMotion,
        ...(brandPalette === undefined ? {} : { brandPalette }),
        ...(parent === null ? {} : { parent: parent.environment }),
      },
    );
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

  return (
    <HjmNativeThemeContext.Provider value={contextValue}>
      <HjmNativeBrandPaletteContext.Provider value={brandPalette}>{children}</HjmNativeBrandPaletteContext.Provider>
    </HjmNativeThemeContext.Provider>
  );
}

export function useHjmNativeTheme(): HjmNativeTheme {
  const value = useContext(HjmNativeThemeContext);
  if (value === null) {
    throw new Error("useHjmNativeTheme must be used inside HjmNativeProvider");
  }
  return value;
}
