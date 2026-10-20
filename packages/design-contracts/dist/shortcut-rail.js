import { validateItems } from "./interaction-adapters.js";
import { control, glyph, spacing } from "./foundations.js";
// Recent cities need independent open/remove targets, not nested buttons or selected filters.
// Chip owns the pill's appearance; this composition adds finite horizontal placement and removal.
export const shortcutRailRecipe = {
    defaults: { layout: "scroll" },
    gap: spacing.xs,
    glyph: glyph.xs,
    actionMinWidth: control.minTouchTarget,
    removeWidth: control.minTouchTarget,
    minTouchTarget: control.minTouchTarget,
};
export function validateShortcutRail(items, label, layout = "scroll") {
    if (layout !== "scroll" && layout !== "wrap")
        throw new RangeError("ShortcutRail layout must be scroll or wrap");
    validateItems(items);
    if (!label.trim())
        throw new TypeError("ShortcutRail label must not be empty");
}
/** Minimal physical offset that exposes a focused shortcut in either reading direction. */
export function revealShortcut(offset, viewport, start, width) {
    if (start < offset)
        return Math.max(0, start);
    if (start + width > offset + viewport)
        return Math.max(0, start + width - viewport);
    return offset;
}
//# sourceMappingURL=shortcut-rail.js.map