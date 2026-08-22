import { type AccentTone, type ThemeColors } from "./colors.js";
/**
 * Recipes point at semantic colors instead of copying a palette value.
 * Renderers resolve the reference with the active theme and accent map.
 */
export type ThemeColorReference = Readonly<{
    source: "theme";
    key: keyof ThemeColors;
    alpha?: number;
}>;
export type AccentColorReference = Readonly<{
    source: "accent";
    key: AccentTone;
    alpha?: number;
}>;
export type AccentFillReference = Readonly<{
    source: "accentFill";
    key: AccentTone;
    alpha?: number;
}>;
export type ColorReference = ThemeColorReference | AccentColorReference | AccentFillReference;
export type ColorReferencePalette = Readonly<{
    theme: Readonly<ThemeColors>;
    /** Generic feedback roles. Product aliases belong in a separate product map. */
    statusAccents: Readonly<Record<AccentTone, string>>;
    /** Solid fills stay generic too; products may map their vocabulary separately. */
    statusAccentFills: Readonly<Record<AccentTone, string>>;
}>;
export declare function themeColor<K extends keyof ThemeColors>(key: K, alpha?: number): Readonly<{
    source: "theme";
    key: K;
    alpha?: number;
}>;
export declare function accentColor<K extends AccentTone>(key: K, alpha?: number): Readonly<{
    source: "accent";
    key: K;
    alpha?: number;
}>;
export declare function solidAccentColor<K extends AccentTone>(key: K, alpha?: number): Readonly<{
    source: "accentFill";
    key: K;
    alpha?: number;
}>;
/** Resolve a recipe color without coupling the recipe to CSS or React Native. */
export declare function resolveColorReference(reference: ColorReference, palette: ColorReferencePalette): string;
//# sourceMappingURL=color-references.d.ts.map