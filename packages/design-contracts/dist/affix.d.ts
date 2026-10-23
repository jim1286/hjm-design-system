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
export declare const affixRecipe: {
    readonly edge: "top";
    readonly offset: 0;
    readonly position: "sticky";
    readonly oversize: "flow";
    readonly defaults: {
        readonly layer: "sticky";
        readonly fill: "canvas";
    };
};
export declare function validateAffixPresentation(layerStep: unknown, fill: unknown): void;
export declare function validateAffixOffset(offset: number): number;
//# sourceMappingURL=affix.d.ts.map