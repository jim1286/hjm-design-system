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
//# sourceMappingURL=palette-contrast.d.ts.map