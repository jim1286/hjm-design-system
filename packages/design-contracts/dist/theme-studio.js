import { THEMES } from "./colors.js";
import { contrastRatio, paletteContrastRules } from "./palette-contrast.js";
export function applyStudioColor(palette, theme, role, color) {
    if (!/^#[0-9a-f]{6}$/i.test(color.trim()))
        throw new TypeError("Expected a six-digit hex color");
    return { ...palette, [theme]: { ...palette[theme], [role]: color.trim().toLowerCase() } };
}
export function studioReport(palette, theme) {
    const resolved = { ...THEMES[theme], ...palette[theme] };
    return paletteContrastRules.map(rule => ({ ...rule, ratio: contrastRatio(resolved[rule.foreground], resolved[rule.background]), pass: contrastRatio(resolved[rule.foreground], resolved[rule.background]) >= rule.minimum }));
}
export function exportStudioPalette(palette) {
    // Export the actual provider overrides, not invented derived hues or product defaults.
    return JSON.stringify({ brandPalette: palette }, null, 2);
}
//# sourceMappingURL=theme-studio.js.map