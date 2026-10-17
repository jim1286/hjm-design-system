import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { iconButtonRecipe, resolveIconButtonEdgeOverhang, } from "@hjmds/design-contracts/recipes";
/**
 * Logical margins that put an IconButton's glyph slot on its container inset (`resolveIconButtonEdgeOverhang` on the
 * visible diameter the Provider's minimumVisualTarget axis draws). IconButton applies them to itself; a component that
 * wraps an IconButton together with an anchored decoration (NotificationBell's badge) applies them to its own root,
 * so the decoration keeps its corner instead of drifting by the overhang (2026-10-17 1.27.2 adoption finding).
 */
export function iconButtonEdgeMargins(edge, tone, size, minimumVisualTarget) {
    if (edge === undefined)
        return {};
    const overhang = resolveIconButtonEdgeOverhang(tone, size, visibleControlHeight(iconButtonRecipe.sizes[size].diameter, minimumVisualTarget));
    if (overhang <= 0)
        return {};
    return {
        ...(edge !== "end" ? { marginStart: -overhang } : {}),
        ...(edge !== "start" ? { marginEnd: -overhang } : {}),
    };
}
//# sourceMappingURL=icon-button-edge.js.map