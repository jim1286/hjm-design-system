import { motion } from "./foundations.js";

export type TabsAppearance = "standard" | "slide" | "gooey";
export type GooeyIndicatorRect = Readonly<{ x: number; width: number }>;

/** A product's explicit appearance wins; vertical tabs keep the canonical line.
 * Plain profile sliding is not an implicit request for elastic gooey stretching. */
export function resolveTabsAppearance(
  appearance: TabsAppearance | undefined,
  selectionMotion: "none" | "slide" = "none",
  orientation: "horizontal" | "vertical" = "horizontal",
): TabsAppearance {
  if (appearance !== undefined && !["standard", "slide", "gooey"].includes(appearance)) throw new TypeError("Unsupported tabs appearance");
  return orientation === "vertical" ? "standard" : appearance ?? (selectionMotion === "slide" ? "slide" : "standard");
}

/** Both renderers interpolate measured bounds without changing selection or panels. */
export function resolveTabIndicator(from: GooeyIndicatorRect, to: GooeyIndicatorRect, appearance: "slide" | "gooey") {
  if (appearance === "gooey") return resolveGooeyIndicator(from, to);
  if (appearance !== "slide") throw new TypeError("Unsupported moving tab indicator");
  validateRects(from, to);
  // Ordinary selection feedback uses the shared normal duration; retain the
  // existing 320ms elastic recipe for explicit gooey consumers.
  return { duration: motion.normal, input: [0, 1], x: [from.x, to.x], width: [from.width, to.width] } as const;
}

/** Capture the current JS-driver frame before cancellation so rapid input starts
 * where the indicator is visible, rather than jumping to the abandoned target. */
export function sampleTabIndicator(recipe: ReturnType<typeof resolveTabIndicator>, progress: number): GooeyIndicatorRect {
  const value = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 1;
  const index = recipe.input.findIndex((offset, i) => i > 0 && offset >= value);
  const end = index < 0 ? recipe.input.length - 1 : index;
  const start = Math.max(0, end - 1);
  const fraction = (value - recipe.input[start]!) / (recipe.input[end]! - recipe.input[start]!);
  return {
    x: recipe.x[start]! + (recipe.x[end]! - recipe.x[start]!) * fraction,
    width: recipe.width[start]! + (recipe.width[end]! - recipe.width[start]!) * fraction,
  };
}

function validateRects(from: GooeyIndicatorRect, to: GooeyIndicatorRect) {
  for (const rect of [from, to]) if (!Number.isFinite(rect.x) || !Number.isFinite(rect.width) || rect.width <= 0) throw new RangeError("Indicator needs finite coordinates and positive widths");
}
/** Stretch only the selected indicator; tab hit targets and text never move. */
export function resolveGooeyIndicator(from: GooeyIndicatorRect, to: GooeyIndicatorRect) {
  validateRects(from, to);
  // Keep the elastic bridge within the measured source/destination span, including RTL layouts.
  const left = Math.min(from.x, to.x);
  const right = Math.max(from.x + from.width, to.x + to.width);
  return { duration: 320, input: [0, 0.45, 1], x: [from.x, left, to.x], width: [from.width, right - left, to.width] } as const;
}

/** A pager publishes fractional item indexes without rendering React each frame.
 * Selection and panel activation stay owned by value/onValueChange at settle. */
export type TabSwipePosition = Readonly<{
  get: () => number;
  subscribe: (listener: (position: number) => void) => () => void;
}>;

export function resolveSwipeTabIndicator(rects: readonly (GooeyIndicatorRect | undefined)[], position: number): GooeyIndicatorRect | null {
  if (!Number.isFinite(position) || rects.length === 0) return null;
  const clamped = Math.max(0, Math.min(rects.length - 1, position));
  const index = Math.floor(clamped), fraction = clamped - index;
  const from = rects[index], to = rects[Math.min(index + 1, rects.length - 1)];
  if (!from || !to) return null;
  return { x: from.x + (to.x - from.x) * fraction, width: from.width + (to.width - from.width) * fraction };
}
