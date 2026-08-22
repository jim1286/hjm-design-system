import type { ColorReferencePalette } from "./color-references.js";
import { type ResolvedTheme, type ThemePreference } from "./colors.js";
/**
 * Canonical logical direction. Existing public component-specific names stay
 * source-compatible as aliases of this type instead of redeclaring the union.
 */
export type DesignSystemDirection = "ltr" | "rtl";
/**
 * A continuous OS/user font-scale multiplier (iOS Dynamic Type, Android font
 * size, browser zoom) — not `ShowcaseTextScale`'s closed `1 | 1.5 | 2`, which
 * only names Showcase's five fixture stories, or `description-list.ts`'s
 * local layout clamp. This is the single upstream signal both now consume.
 */
export type DesignSystemTextScale = number;
export type DesignSystemEnvironmentInput = Readonly<{
    theme?: ThemePreference;
    direction?: DesignSystemDirection;
    textScale?: DesignSystemTextScale;
    reducedMotion?: boolean;
}>;
export declare const designSystemEnvironmentDefaults: {
    readonly theme: "system";
    readonly direction: "ltr";
    readonly textScale: 1;
    readonly reducedMotion: false;
};
export type ResolvedDesignSystemEnvironment = Readonly<{
    theme: ResolvedTheme;
    direction: DesignSystemDirection;
    textScale: DesignSystemTextScale;
    reducedMotion: boolean;
}>;
export type ResolveDesignSystemEnvironmentOptions = Readonly<{
    /**
     * The platform's current OS-level scheme, consulted only when `theme`
     * resolves to `"system"`. Renderers detect this themselves
     * (`Appearance.getColorScheme()`, `matchMedia('(prefers-color-scheme)')`)
     * — this package never queries the OS.
     */
    systemTheme: ResolvedTheme;
    /** Optional OS/renderer signals used when neither input nor a parent supplies the axis. */
    systemDirection?: DesignSystemDirection;
    systemTextScale?: DesignSystemTextScale;
    systemReducedMotion?: boolean;
    /** A nested renderer inherits the already-resolved parent before consulting OS defaults. */
    parent?: ResolvedDesignSystemEnvironment;
}>;
export type DesignSystemProviderValue = Readonly<{
    environment: ResolvedDesignSystemEnvironment;
    /** Palette consumed directly by `resolveColorReference`. */
    palette: ColorReferencePalette;
}>;
/**
 * Runtime boundary for reviewed full product palettes supplied to a renderer.
 * Partial token overrides remain unsupported: every semantic role required by
 * a recipe must be present, and alpha composition requires six-digit hex.
 */
export declare function validateDesignSystemProviderValue(value: DesignSystemProviderValue): void;
export declare function validateDesignSystemEnvironmentInput(input: DesignSystemEnvironmentInput): void;
/**
 * A parent has already crossed the system-preference boundary. Unlike the
 * partial input validator, this rejects `"system"`, missing axes, and every
 * malformed resolved value instead of silently resolving them again.
 */
export declare function validateResolvedDesignSystemEnvironment(environment: ResolvedDesignSystemEnvironment): void;
/**
 * Merges partial signals with safe defaults and resolves `"system"` against
 * the renderer-supplied `systemTheme`. This — not a React/RN context, which
 * this package cannot own — is the entire portable contract behind antd
 * `ConfigProvider`: see docs/design-system-provider.md for what was
 * deliberately left to the renderer.
 */
export declare function resolveDesignSystemEnvironment(input: DesignSystemEnvironmentInput, options: ResolveDesignSystemEnvironmentOptions): ResolvedDesignSystemEnvironment;
/**
 * Resolves the portable Provider value without owning React/RN Context. A
 * renderer stores this object in its own context and feeds `palette` directly
 * to recipe color resolution.
 */
export declare function resolveDesignSystemProviderValue(input: DesignSystemEnvironmentInput, options: ResolveDesignSystemEnvironmentOptions): DesignSystemProviderValue;
//# sourceMappingURL=design-system-provider.d.ts.map