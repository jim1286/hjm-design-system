export function isThemePreference(value) {
    return value === "system" || value === "light" || value === "dark";
}
const light = {
    bg: "#ffffff",
    surface: "#f2f4f6",
    surfaceAlt: "#e5e8eb",
    surfaceAccent: "#c9e2ff",
    border: "#e5e8eb",
    // Keeps the value the secondary control outline already resolved to.
    borderControl: "#6b7684",
    text: "#191f28",
    textBody: "#333d4b",
    textMuted: "#4e5968",
    textSub: "#65707d",
    textWeak: "#8b95a1",
    primary: "#0369a1",
    contentBrand: "#075985",
    danger: "#b71919",
    onPrimary: "#ffffff",
    dangerFill: "#b91c1c",
    onDanger: "#ffffff",
};
/** Mirrors light's neutrals; see docs/theme-palette.md before editing a value. */
const dark = {
    bg: "#0d1116",
    surface: "#161b22",
    surfaceAlt: "#1e232a",
    surfaceAccent: "#224159",
    border: "#6a788a",
    borderControl: "#929faf",
    text: "#f3f5f7",
    textBody: "#e1e5ea",
    textMuted: "#cad0d8",
    textSub: "#9ba5b0",
    textWeak: "#8b96a2",
    primary: "#0476b4",
    contentBrand: "#51bff6",
    danger: "#f87171",
    onPrimary: "#ffffff",
    dangerFill: "#b91c1c",
    onDanger: "#ffffff",
};
export const THEMES = { light, dark };
export const ACCENTS = {
    light: {
        info: "#6d28d9",
        success: "#065f46",
        warning: "#92400e",
        attention: "#9a3412",
    },
    dark: {
        info: "#a78bfa",
        success: "#34d399",
        warning: "#fbbf24",
        attention: "#fb923c",
    },
};
/** Solid emphasis fills always pair with `onAccentFill`. */
export const accentFill = {
    info: "#6d28d9",
    success: "#065f46",
    warning: "#92400e",
    attention: "#9a3412",
};
export const onAccentFill = "#ffffff";
export const accentTint = {
    weak: 0.1,
    base: 0.15,
    strong: 0.2,
    border: 0.3,
};
/**
 * HJM organization surfaces' default signature. Renderers translate the
 * normalized coordinates. Product identity is owned by each product adapter;
 * consumers must not treat this value as every product's automatic brand.
 */
export const brandGradient = {
    from: "#0369a1",
    to: "#155dfc",
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
};
export const onBrandGradient = "#ffffff";
/** Add an alpha channel without coupling callers to a CSS or React Native helper. */
export function withAlpha(hex, alpha) {
    const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
    if (!match) {
        throw new TypeError("A six-digit hex color is required");
    }
    if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
        throw new RangeError("Alpha must be a finite number between 0 and 1");
    }
    const source = match[1];
    const channels = [0, 2, 4].map((offset) => Number.parseInt(source.slice(offset, offset + 2), 16));
    return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
}
//# sourceMappingURL=colors.js.map