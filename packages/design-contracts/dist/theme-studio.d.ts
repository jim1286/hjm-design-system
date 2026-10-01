import { type ResolvedTheme, type ThemeColors } from "./colors.js";
export type StudioPalette = Partial<Record<ResolvedTheme, Partial<ThemeColors>>>;
export type StudioColorRole = "primary" | "onPrimary" | "contentBrand";
export declare function applyStudioColor(palette: StudioPalette, theme: ResolvedTheme, role: StudioColorRole, color: string): StudioPalette;
export declare function studioReport(palette: StudioPalette, theme: ResolvedTheme): {
    ratio: number;
    pass: boolean;
    foreground: keyof ThemeColors;
    background: keyof ThemeColors;
    minimum: number;
    kind: "text" | "non-text";
}[];
export declare function exportStudioPalette(palette: StudioPalette): string;
//# sourceMappingURL=theme-studio.d.ts.map