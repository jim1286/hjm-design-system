export const watermarkRecipe = { tileWidth: 240, tileHeight: 160, rotate: -22, opacity: 0.12, foreground: "textSub" } as const;
export function resolveWatermark(text: string | readonly string[], width = watermarkRecipe.tileWidth as number, height = watermarkRecipe.tileHeight as number, rotate = watermarkRecipe.rotate as number, opacity = watermarkRecipe.opacity as number) {
  const lines = typeof text === "string" ? [text] : [...text];
  // Bounded tiles prevent accidental invisible/huge overlays; this is decorative labeling, not tamper protection.
  if (!lines.length || lines.length > 3 || lines.some(line => !line.trim() || line.length > 120)) throw new TypeError("Watermark needs one to three nonempty lines of at most 120 characters");
  if (![width, height, rotate, opacity].every(Number.isFinite) || width < 80 || height < 60 || Math.abs(rotate) > 90 || opacity < 0 || opacity > 1) throw new TypeError("Invalid Watermark geometry");
  return { lines, width, height, rotate, opacity };
}
