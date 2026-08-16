import { accentColor, themeColor } from "./color-references.js";
/**
 * Stable role aliases above the legacy ThemeColors key set. New recipes should
 * prefer these roles so the underlying theme shape can evolve independently.
 */
export const semanticColors = {
    canvas: themeColor("bg"),
    surface: {
        default: themeColor("surface"),
        sunken: themeColor("surfaceAlt"),
        raised: themeColor("bg"),
        brand: themeColor("surfaceAccent"),
    },
    content: {
        primary: themeColor("text"),
        body: themeColor("textBody"),
        secondary: themeColor("textMuted"),
        tertiary: themeColor("textSub"),
        decorative: themeColor("textWeak"),
        brand: themeColor("contentBrand"),
        danger: themeColor("danger"),
        inverse: themeColor("onPrimary"),
    },
    border: {
        subtle: themeColor("border", 0.7),
        default: themeColor("border"),
        strong: themeColor("textWeak"),
        focus: themeColor("contentBrand"),
        danger: themeColor("danger"),
    },
    action: {
        brand: {
            background: themeColor("primary"),
            content: themeColor("onPrimary"),
        },
        neutral: {
            background: themeColor("surfaceAlt"),
            content: themeColor("text"),
        },
        danger: {
            background: themeColor("dangerFill"),
            content: themeColor("onDanger"),
        },
    },
    feedback: {
        info: {
            foreground: accentColor("info"),
            background: accentColor("info", 0.1),
            badgeBackground: accentColor("info", 0.1),
            border: accentColor("info", 0.3),
        },
        success: {
            foreground: accentColor("success"),
            background: accentColor("success", 0.1),
            badgeBackground: accentColor("success", 0.1),
            border: accentColor("success", 0.3),
        },
        warning: {
            foreground: accentColor("warning"),
            background: accentColor("warning", 0.1),
            badgeBackground: accentColor("warning", 0.1),
            border: accentColor("warning", 0.3),
        },
        attention: {
            foreground: accentColor("attention"),
            background: accentColor("attention", 0.1),
            badgeBackground: accentColor("attention", 0.1),
            border: accentColor("attention", 0.3),
        },
        danger: {
            foreground: themeColor("danger"),
            background: themeColor("danger", 0.1),
            badgeBackground: themeColor("danger", 0.1),
            border: themeColor("danger", 0.3),
        },
    },
    interaction: {
        hover: themeColor("text", 0.06),
        focus: themeColor("contentBrand", 0.08),
        pressed: themeColor("text", 0.1),
        selected: themeColor("primary", 0.1),
    },
};
//# sourceMappingURL=semantic-colors.js.map