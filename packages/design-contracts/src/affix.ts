import type { layer } from "./foundations.js";

/**
 * Stacking step of the sticky box (2026-10-23). Affix set no z-index, so later positioned content in the scroll area
 * painted over a pinned tab bar; the portfolio site kept its own `.tabs-bar { z-index: 2 }` instead of adopting Affix.
 * `sticky` (default) is the shared `layer.sticky` step BottomCTA and FAB use; `base` keeps the box in normal order for
 * an Affix that lives inside a surface which already owns its stacking (a dialog or side panel body).
 */
export type AffixLayer = Extract<keyof typeof layer, "base" | "sticky">;
/**
 * Fill behind the box. `canvas` (default): the screen background, so scrolled content does not show through a pinned
 * bar. `none`: transparent, for children that bring their own surface (a Card, a filled toolbar).
 */
export type AffixFill = "canvas" | "none";

export const affixRecipe = {
  edge: "top",
  offset: 0,
  position: "sticky",
  oversize: "flow",
  defaults: { layer: "sticky", fill: "canvas" },
} as const satisfies {
  edge: "top";
  offset: number;
  position: "sticky";
  oversize: "flow";
  defaults: { layer: AffixLayer; fill: AffixFill };
};

export function validateAffixPresentation(layerStep: unknown, fill: unknown): void {
  if (layerStep !== "base" && layerStep !== "sticky") throw new TypeError(`Unsupported Affix layer: ${String(layerStep)}`);
  if (fill !== "canvas" && fill !== "none") throw new TypeError(`Unsupported Affix fill: ${String(fill)}`);
}
export function validateAffixOffset(offset: number): number {
  if (!Number.isFinite(offset) || offset < 0) throw new TypeError("Affix offset must be finite and nonnegative");
  return offset;
}
