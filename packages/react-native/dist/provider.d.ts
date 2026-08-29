import { type DesignSystemDirection, type DesignSystemProviderValue, type DesignSystemTextScale } from "@hjmds/design-contracts/components/design-system-provider";
import type { ThemePreference } from "@hjmds/design-contracts/colors";
import { spacing, radius, typography } from "@hjmds/design-contracts/foundations";
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
        radius: typeof radius;
        typography: typeof typography;
    }>;
}>;
type HjmNativeProviderEnvironmentProps = Readonly<{
    value?: never;
    theme?: ThemePreference;
    direction?: DesignSystemDirection;
    textScale?: DesignSystemTextScale;
    reducedMotion?: boolean;
}>;
type HjmNativeProviderValueProps = Readonly<{
    /** Pre-resolved environment and product palette for first-party renderer adaptation. */
    value: DesignSystemProviderValue;
    theme?: never;
    direction?: never;
    textScale?: never;
    reducedMotion?: never;
}>;
export type HjmNativeProviderProps = Readonly<{
    children: ReactNode;
}> & (HjmNativeProviderEnvironmentProps | HjmNativeProviderValueProps);
export declare function HjmNativeProvider({ children, theme, direction, textScale, reducedMotion, value: suppliedValue, }: HjmNativeProviderProps): import("react").JSX.Element;
export declare function useHjmNativeTheme(): HjmNativeTheme;
export {};
//# sourceMappingURL=provider.d.ts.map