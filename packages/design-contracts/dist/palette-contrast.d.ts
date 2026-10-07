import { type ResolvedTheme, type ThemeColors } from "./colors.js";
/** Pair thresholds and their rationale: docs/brand-boundary.md. */
export type PaletteContrastRule = Readonly<{
    foreground: keyof ThemeColors;
    background: keyof ThemeColors;
    minimum: number;
    kind: "text" | "non-text";
}>;
export type PaletteContrastFinding = PaletteContrastRule & Readonly<{
    ratio: number;
}>;
export declare const paletteContrastRules: readonly PaletteContrastRule[];
/** WCAG 2.x contrast ratio between two six-digit hex colors. */
export declare function contrastRatio(foreground: string, background: string): number;
/** Pairs of a resolved theme palette that fall below their threshold; empty means it passes. */
export declare function checkPaletteContrast(palette: Readonly<ThemeColors>): readonly PaletteContrastFinding[];
/** Checks a `brandPalette` the way the Provider applies it: each theme merged over the HJM defaults. */
export declare function checkBrandPaletteContrast(brandPalette: Readonly<Partial<Record<ResolvedTheme, Readonly<Partial<ThemeColors>>>>>): Readonly<Record<ResolvedTheme, readonly PaletteContrastFinding[]>>;
/** Shared whole-surface fill adaptation. This palette-only entry keeps ordinary
 * renderer imports independent of the optional preset registry/effect descriptors.
 * The supported 0.85..1 interval keeps readable foregrounds outside the backdrop
 * luminance interval; testing its black/white endpoints bounds any opaque backdrop.
 * See docs/design-profile.md for why a reference card's low alpha is not copied. */
export declare function resolveSurfaceFillOpacity(requested: number, palette: Readonly<ThemeColors>): number;
//# sourceMappingURL=palette-contrast.d.ts.map