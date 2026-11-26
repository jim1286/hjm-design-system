import { validateItems } from "./interaction-adapters.js";
import { control, glyph, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

export type ShortcutRailItem = Readonly<{ id: string; label: string; description?: string; disabled?: boolean }>;

/**
 * `default` keeps the Chip idle face (hairline border, muted label). `strong` is for a rail that sits among controls with a
 * resting control outline, such as Spint's recent cities above period pills: the hairline read as disabled next to them
 * (2026-11-26 Spint city sheet). It uses the same control outline and primary label as the pills and secondary Button.
 */
export type ShortcutRailEmphasis = "default" | "strong";

// Recent cities need independent open/remove targets, not nested buttons or selected filters.
// Chip owns the pill's appearance; this composition adds finite horizontal placement and removal.
export const shortcutRailRecipe = {
  defaults: { layout: "scroll", emphasis: "default" as ShortcutRailEmphasis },
  /** Overrides on top of `chipRecipe.states.idle`; `default` overrides nothing. */
  emphasis: {
    default: {},
    strong: { content: semanticColors.content.primary, border: semanticColors.border.control },
  },
  gap: spacing.xs,
  glyph: glyph.xs,
  actionMinWidth: control.minTouchTarget,
  /**
   * Visible width of the × part. The full 44pt target used to be painted, so a removable chip ("퓨처스 ×") looked about
   * twice its label (오늘야구 기록실, 2026-11-04). The target keeps 44pt through `removeHitSlop` past the trailing edge,
   * where it overlaps nothing, and the label gives up its trailing padding to the ×.
   */
  removeWidth: spacing.xl,
  removeHitSlop: control.minTouchTarget - spacing.xl,
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
