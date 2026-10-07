import type { HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { type DesignSystemDirection, type DesignSystemProviderValue, type DesignSystemTextScale, type ResolveDesignSystemEnvironmentOptions } from "@hjmds/design-contracts/components/design-system-provider";
import type { ThemePreference } from "@hjmds/design-contracts/colors";
import { spacing } from "@hjmds/design-contracts/foundations";
import { type ReactNode } from "react";
import type { NativeTextScaling } from "./internal/styles.js";
export type HjmNativeTheme = DesignSystemProviderValue & Readonly<{
    colors: DesignSystemProviderValue["palette"]["theme"];
    /**
     * Native lets the OS scale text automatically. A product-supplied scale,
     * however, must be applied by HJM exactly once instead of being multiplied
     * by the OS a second time.
     */
    textScaling: NativeTextScaling;
    tokens: Readonly<{
        spacing: typeof spacing;
        radius: HjmDesignProfile["tokens"]["radius"];
        typography: HjmDesignProfile["tokens"]["typography"];
        shadow: HjmDesignProfile["tokens"]["shadow"];
        fontFamily: HjmDesignProfile["tokens"]["fontFamily"];
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
    /** Appearance and interaction defaults defined once by the product. Explicit props win. */
    designProfile?: HjmDesignProfile;
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
    designProfile?: never;
}>;
/** Window insets in points, usually `useSafeAreaInsets()` from react-native-safe-area-context. */
export type HjmNativeSafeAreaInsets = Readonly<{
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}>;
export type HjmNativeProviderProps = Readonly<{
    children: ReactNode;
    /**
     * Window safe-area insets that full-screen overlays (Sheet, DatePicker, Select,
     * Combobox) apply when the call site passes none. Added after the 2026-09-30
     * audit found sheet content under the iOS home indicator and the Android
     * navigation bar because every call site had to remember the prop. The core
     * entry cannot import the optional safe-area peer, so the host measures once
     * here; nested providers inherit the nearest supplied value.
     */
    safeAreaInsets?: HjmNativeSafeAreaInsets;
}> & (HjmNativeProviderEnvironmentProps | HjmNativeProviderValueProps);
export declare function HjmNativeProvider({ children, theme, direction, textScale, reducedMotion, minimumVisualTarget, brandPalette: suppliedBrandPalette, designProfile: suppliedDesignProfile, value: suppliedValue, safeAreaInsets: suppliedInsets, }: HjmNativeProviderProps): import("react").JSX.Element;
export declare function useHjmNativeTheme(): HjmNativeTheme;
/** Insets supplied to the nearest HjmNativeProvider; `{}` when the host supplied none. */
export declare function useHjmNativeSafeAreaInsets(): HjmNativeSafeAreaInsets;
export {};
//# sourceMappingURL=provider.d.ts.map