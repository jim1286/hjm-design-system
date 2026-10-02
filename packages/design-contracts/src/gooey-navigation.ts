export type TabsAppearance = "standard" | "gooey";
export type GooeyIndicatorRect = Readonly<{ x: number; width: number }>;
/** Stretch only the selected indicator; tab hit targets and text never move. */
export function resolveGooeyIndicator(from: GooeyIndicatorRect, to: GooeyIndicatorRect) {
  for (const rect of [from, to]) if (!Number.isFinite(rect.x) || !Number.isFinite(rect.width) || rect.width <= 0) throw new RangeError("Indicator needs finite coordinates and positive widths");
  // Keep the elastic bridge within the measured source/destination span, including RTL layouts.
  const left = Math.min(from.x, to.x);
  const right = Math.max(from.x + from.width, to.x + to.width);
  return { duration: 320, input: [0, 0.45, 1], x: [from.x, left, to.x], width: [from.width, right - left, to.width] } as const;
}
