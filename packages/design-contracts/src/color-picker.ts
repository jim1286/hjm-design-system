/** sRGB hex is the interchange format; HSV/RGB editors can be added without changing stored values. */
export function normalizePickerColor(value: string, alpha = false): string {
  const hex = value.trim().replace(/^#/, "");
  if (!/^(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(hex)) throw new TypeError("ColorPicker needs an sRGB hex value");
  const expanded = hex.length <= 4 ? [...hex].map(char => char + char).join("") : hex;
  if (!alpha && expanded.length === 8 && expanded.slice(6).toLowerCase() !== "ff") throw new TypeError("ColorPicker alpha is disabled");
  return `#${expanded.slice(0, 6).toLowerCase()}${alpha ? (expanded.slice(6) || "ff").toLowerCase() : ""}`;
}
export function pickerOpacity(value: string): number {
  return Math.round(parseInt(normalizePickerColor(value, true).slice(7), 16) / 255 * 100);
}
export function withPickerOpacity(value: string, opacity: number): string {
  if (!Number.isFinite(opacity) || opacity < 0 || opacity > 100) throw new TypeError("Opacity must be between 0 and 100");
  return normalizePickerColor(value, true).slice(0, 7) + Math.round(opacity / 100 * 255).toString(16).padStart(2, "0");
}
export const colorPickerRecipe = { colorSpace: "srgb", background: "bg", border: "border", minTargetSize: 44 } as const;
