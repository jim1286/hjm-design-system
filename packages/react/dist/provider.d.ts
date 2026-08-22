import { type DesignSystemDirection, type DesignSystemProviderValue, type DesignSystemTextScale } from "@hjm/design-contracts/components/design-system-provider";
import type { ResolvedTheme, ThemePreference } from "@hjm/design-contracts/colors";
import { type HTMLAttributes, type ReactNode } from "react";
export type TooltipCoordinator = Readonly<{
    activeId: string | null;
    activate(id: string): void;
    deactivate(id: string): void;
    shouldSkipDelay(): boolean;
}>;
export type HjmProviderProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "dir"> & Readonly<{
    children: ReactNode;
    theme?: ThemePreference;
    direction?: DesignSystemDirection;
    textScale?: DesignSystemTextScale;
    reducedMotion?: boolean;
    /** Deterministic SSR/test override; otherwise prefers-color-scheme is observed. */
    systemTheme?: ResolvedTheme;
}>;
export declare const HjmProvider: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children" | "dir"> & Readonly<{
    children: ReactNode;
    theme?: ThemePreference;
    direction?: DesignSystemDirection;
    textScale?: DesignSystemTextScale;
    reducedMotion?: boolean;
    /** Deterministic SSR/test override; otherwise prefers-color-scheme is observed. */
    systemTheme?: ResolvedTheme;
}> & import("react").RefAttributes<HTMLDivElement>>;
export declare function useHjmTheme(): DesignSystemProviderValue;
/** Renderer components use the browser default direction when no provider is present. */
export declare function useOptionalHjmTheme(): DesignSystemProviderValue | null;
/** Internal provider-scoped coordination used by Tooltip renderers. */
export declare function useTooltipCoordinator(): TooltipCoordinator | null;
//# sourceMappingURL=provider.d.ts.map