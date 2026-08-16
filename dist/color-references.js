import { withAlpha, } from "./colors.js";
function assertAlpha(alpha) {
    if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
        throw new RangeError("Color reference alpha must be between 0 and 1");
    }
}
export function themeColor(key, alpha) {
    if (alpha === undefined)
        return { source: "theme", key };
    assertAlpha(alpha);
    return { source: "theme", key, alpha };
}
export function accentColor(key, alpha) {
    if (alpha === undefined)
        return { source: "accent", key };
    assertAlpha(alpha);
    return { source: "accent", key, alpha };
}
export function solidAccentColor(key, alpha) {
    if (alpha === undefined)
        return { source: "accentFill", key };
    assertAlpha(alpha);
    return { source: "accentFill", key, alpha };
}
/** Resolve a recipe color without coupling the recipe to CSS or React Native. */
export function resolveColorReference(reference, palette) {
    const value = reference.source === "theme"
        ? palette.theme[reference.key]
        : reference.source === "accent"
            ? palette.statusAccents[reference.key]
            : palette.statusAccentFills[reference.key];
    if (typeof value !== "string") {
        throw new TypeError(`Missing ${reference.source} color for semantic key \"${reference.key}\"`);
    }
    return reference.alpha === undefined || reference.alpha === 1
        ? value
        : withAlpha(value, reference.alpha);
}
//# sourceMappingURL=color-references.js.map