import { type DesignSystemDirection, type DesignSystemProviderValue, type DesignSystemTextScale } from "@hjm/design-contracts/components/design-system-provider";
import type { ThemePreference } from "@hjm/design-contracts/colors";
import { spacing, radius, typography } from "@hjm/design-contracts/foundations";
import { type ReactNode } from "react";
export type HjmNativeTheme = DesignSystemProviderValue & Readonly<{
    colors: DesignSystemProviderValue["palette"]["theme"];
    tokens: Readonly<{
        spacing: typeof spacing;
        radius: typeof radius;
        typography: typeof typography;
    }>;
}>;
export type HjmNativeProviderProps = Readonly<{
    children: ReactNode;
    theme?: ThemePreference;
    direction?: DesignSystemDirection;
    textScale?: DesignSystemTextScale;
    reducedMotion?: boolean;
}>;
export declare function HjmNativeProvider({ children, theme, direction, textScale, reducedMotion, }: HjmNativeProviderProps): import("react").JSX.Element;
export declare function useHjmNativeTheme(): HjmNativeTheme;
//# sourceMappingURL=provider.d.ts.map