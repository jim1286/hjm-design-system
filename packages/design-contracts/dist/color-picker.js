/** sRGB hex is the interchange format; the HSV editor below converts at the edge without changing stored values. */
export function normalizePickerColor(value, alpha = false) {
    const hex = value.trim().replace(/^#/, "");
    if (!/^(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(hex))
        throw new TypeError("ColorPicker needs an sRGB hex value");
    const expanded = hex.length <= 4 ? [...hex].map(char => char + char).join("") : hex;
    if (!alpha && expanded.length === 8 && expanded.slice(6).toLowerCase() !== "ff")
        throw new TypeError("ColorPicker alpha is disabled");
    return `#${expanded.slice(0, 6).toLowerCase()}${alpha ? (expanded.slice(6) || "ff").toLowerCase() : ""}`;
}
export function pickerOpacity(value) {
    return Math.round(parseInt(normalizePickerColor(value, true).slice(7), 16) / 255 * 100);
}
export function withPickerOpacity(value, opacity) {
    if (!Number.isFinite(opacity) || opacity < 0 || opacity > 100)
        throw new TypeError("Opacity must be between 0 and 100");
    return normalizePickerColor(value, true).slice(0, 7) + Math.round(opacity / 100 * 255).toString(16).padStart(2, "0");
}
/**
 * HSV of the opaque part of `value`. Black has no saturation and greys have no hue; those channels keep `previous`
 * so dragging the area into a corner does not snap the hue slider back to red (2026-10-25 ColorPicker redesign,
 * the same behavior as Figma's and React Aria's colour areas).
 */
export function pickerHsv(value, previous) {
    const hex = normalizePickerColor(value, true);
    const [r, g, b] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
    const max = Math.max(r, g, b), delta = max - Math.min(r, g, b);
    const brightness = max * 100;
    const saturation = max === 0 ? previous?.saturation ?? 0 : delta / max * 100;
    let hue = previous?.hue ?? 0;
    if (delta > 0) {
        const sector = max === r ? (g - b) / delta % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
        hue = (sector * 60 + 360) % 360;
    }
    return { hue, saturation, brightness };
}
/** Opaque `#rrggbb` for an HSV triple; out-of-range channels are clamped. */
export function pickerHexFromHsv({ hue, saturation, brightness }) {
    const h = ((hue % 360) + 360) % 360 / 60, s = clamp(saturation, 0, 100) / 100, v = clamp(brightness, 0, 100) / 100;
    const channel = (n) => {
        const k = (n + h) % 6;
        return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255).toString(16).padStart(2, "0");
    };
    return `#${channel(5)}${channel(3)}${channel(1)}`;
}
/** Fully saturated colour at `hue`: the area's base and the hue thumb fill. */
export function pickerHueColor(hue) {
    return pickerHexFromHsv({ hue, saturation: 100, brightness: 100 });
}
/** Stops for the hue track gradient, red to red. */
export const pickerHueStops = [0, 60, 120, 180, 240, 300, 360].map(hue => ({ offset: hue / 360, color: pickerHueColor(hue) }));
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
/**
 * 2026-10-25 redesign (Diairy hand-drawn profile request): a saturation/brightness area with hue and opacity bars
 * replaces the browser colour popup (Web) and RGB channel sliders (Native). People pick colour by hue and shade, as
 * in Figma, Procreate Classic and iOS Spectrum; RGB channels made "a lighter pink" a three-slider puzzle, and the
 * browser popup looked different on every OS. Swatches are round 44pt targets with a ring for the selection.
 */
export const colorPickerRecipe = {
    colorSpace: "srgb",
    background: "bg",
    border: "border",
    minTargetSize: 44,
    area: { aspectRatio: 4 / 3, thumbDiameter: 24, thumbBorder: 3, radius: "md" },
    bar: { height: 24, thumbDiameter: 28, thumbBorder: 3 },
    /** Area keyboard / accessibility step in percent. */
    step: 1,
    largeStep: 10,
    swatch: { target: 44, diameter: 32, ringWidth: 2, ringGap: 2 },
    preview: { size: 44 },
};
//# sourceMappingURL=color-picker.js.map