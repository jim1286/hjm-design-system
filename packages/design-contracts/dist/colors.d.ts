/** A persisted preference is an application concern; this package only defines valid values. */
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = Exclude<ThemePreference, "system">;
export declare function isThemePreference(value: unknown): value is ThemePreference;
/**
 * Product code chooses colors by meaning, never by a raw palette name.
 * Both themes deliberately expose exactly the same keys.
 */
export type ThemeColors = {
    bg: string;
    surface: string;
    surfaceAlt: string;
    surfaceAccent: string;
    border: string;
    text: string;
    textBody: string;
    textMuted: string;
    textSub: string;
    textWeak: string;
    primary: string;
    contentBrand: string;
    danger: string;
    onPrimary: string;
    dangerFill: string;
    onDanger: string;
};
export declare const THEMES: Readonly<Record<ResolvedTheme, Readonly<ThemeColors>>>;
/** Generic emphasis roles. Product-specific meanings are mapped by each consumer. */
export type AccentTone = "info" | "success" | "warning" | "attention";
export declare const ACCENTS: Readonly<Record<ResolvedTheme, Readonly<Record<AccentTone, string>>>>;
/** Solid emphasis fills always pair with `onAccentFill`. */
export declare const accentFill: Readonly<Record<AccentTone, string>>;
export declare const onAccentFill = "#ffffff";
export declare const accentTint: {
    readonly weak: 0.1;
    readonly base: 0.15;
    readonly strong: 0.2;
    readonly border: 0.3;
};
/** Shared visual signature. Renderers translate the normalized coordinates. */
export declare const brandGradient: {
    readonly from: "#0369a1";
    readonly to: "#155dfc";
    readonly start: {
        readonly x: 0;
        readonly y: 0;
    };
    readonly end: {
        readonly x: 1;
        readonly y: 1;
    };
};
export declare const onBrandGradient = "#ffffff";
/** Add an alpha channel without coupling callers to a CSS or React Native helper. */
export declare function withAlpha(hex: string, alpha: number): string;
//# sourceMappingURL=colors.d.ts.map