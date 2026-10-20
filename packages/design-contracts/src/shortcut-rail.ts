import { validateItems } from "./interaction-adapters.js";
import { control, glyph, spacing } from "./foundations.js";

export type ShortcutRailItem = Readonly<{ id: string; label: string; description?: string; disabled?: boolean }>;

// Recent cities need independent open/remove targets, not nested buttons or selected filters.
// Chip owns the pill's appearance; this composition adds finite horizontal placement and removal.
export const shortcutRailRecipe = {
  defaults: { layout: "scroll" },
  gap: spacing.xs,
  glyph: glyph.xs,
  actionMinWidth: control.minTouchTarget,
  removeWidth: control.minTouchTarget,
  minTouchTarget: control.minTouchTarget,
} as const;

export function validateShortcutRail(items: readonly ShortcutRailItem[], label: string, layout: "scroll" | "wrap" = "scroll") {
  if (layout !== "scroll" && layout !== "wrap") throw new RangeError("ShortcutRail layout must be scroll or wrap");
  validateItems(items);
  if (!label.trim()) throw new TypeError("ShortcutRail label must not be empty");
}

/** Minimal physical offset that exposes a focused shortcut in either reading direction. */
export function revealShortcut(offset: number, viewport: number, start: number, width: number) {
  if (start < offset) return Math.max(0, start);
  if (start + width > offset + viewport) return Math.max(0, start + width - viewport);
  return offset;
}
