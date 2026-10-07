import { validateItems } from "./interaction-adapters.js";
import { layout, spacing } from "./foundations.js";

export type CollectionRailItem<Id extends string = string> = Readonly<{ id: Id; label: string }>;
export type CollectionRailDensity = "compact" | "comfortable";
export type CollectionRailIntent = "previous" | "next" | "first" | "last";

// A finite rail exposes every item's independent actions. Carousel's single
// selected/inert panel is therefore not its state engine (docs/collection-rail.md).
export const collectionRailRecipe = {
  itemMaxWidth: { compact: layout.readingMaxWidth / 3, comfortable: layout.readingMaxWidth / 2 },
  gap: spacing.md,
  edgeHint: spacing.xl,
  defaults: { density: "comfortable" },
} as const;

export type CollectionRailLayout = Readonly<{
  count: number; viewport: number; itemWidth: number; gap: number; contentWidth: number; maxOffset: number;
}>;

export function validateCollectionRail(items: readonly CollectionRailItem[], initialKey?: string): void {
  validateItems(items);
  if (initialKey !== undefined && !items.some(item => item.id === initialKey)) {
    throw new RangeError("CollectionRail defaultStartKey must identify an item");
  }
}

export function resolveCollectionRailLayout(
  count: number, viewport: number, density: CollectionRailDensity = collectionRailRecipe.defaults.density,
  gap: number = collectionRailRecipe.gap,
): CollectionRailLayout {
  if (!Number.isSafeInteger(count) || count < 0) throw new RangeError("CollectionRail count must be a nonnegative integer");
  if (!Number.isFinite(viewport) || viewport < 0 || !Number.isFinite(gap) || gap < 0) {
    throw new RangeError("CollectionRail measurements must be finite and nonnegative");
  }
  if (!(density in collectionRailRecipe.itemMaxWidth)) throw new TypeError("Unknown CollectionRail density");
  // The hint uses the shared spacing rhythm, not the reference's fixed card px.
  // At extremely narrow widths showing readable content takes priority over peek.
  const available = viewport > collectionRailRecipe.edgeHint ? viewport - collectionRailRecipe.edgeHint : viewport;
  const itemWidth = Math.min(collectionRailRecipe.itemMaxWidth[density], available);
  const contentWidth = count === 0 ? 0 : count * itemWidth + (count - 1) * gap;
  return { count, viewport, itemWidth, gap, contentWidth, maxOffset: Math.max(0, contentWidth - viewport) };
}

export function clampCollectionRailOffset(layout: CollectionRailLayout, offset: number): number {
  if (!Number.isFinite(offset)) throw new RangeError("CollectionRail offset must be finite");
  return Math.min(layout.maxOffset, Math.max(0, offset));
}

// Hosts round subpixel measurements differently. Half a CSS pixel/dp avoids
// an enabled end button that can no longer move; it is not an overscroll allowance.
const alignmentTolerance = 0.5;

export function resolveCollectionRailViewport(layout: CollectionRailLayout, offset: number) {
  const start = clampCollectionRailOffset(layout, offset);
  const stride = layout.itemWidth + layout.gap;
  const startIndex = layout.count === 0 ? -1 : Math.min(layout.count - 1, Math.floor((start + alignmentTolerance) / (stride || 1)));
  return { offset: start, startIndex, atStart: start <= alignmentTolerance, atEnd: start >= layout.maxOffset - alignmentTolerance };
}

export function getCollectionRailTargetOffset(layout: CollectionRailLayout, offset: number, intent: CollectionRailIntent): number {
  const current = clampCollectionRailOffset(layout, offset);
  if (intent === "first") return 0;
  if (intent === "last") return layout.maxOffset;
  const stride = layout.itemWidth + layout.gap;
  if (!stride) return 0;
  const target = intent === "next"
    ? (Math.floor((current + alignmentTolerance) / stride) + 1) * stride
    : (Math.ceil((current - alignmentTolerance) / stride) - 1) * stride;
  return clampCollectionRailOffset(layout, target);
}

export function getCollectionRailItemOffset(layout: CollectionRailLayout, index: number): number {
  if (!Number.isInteger(index) || index < 0 || index >= layout.count) throw new RangeError("CollectionRail item index is unavailable");
  return clampCollectionRailOffset(layout, index * (layout.itemWidth + layout.gap));
}

/** Reveal a focused item's full bounds, without treating it as a selection. */
export function getCollectionRailRevealOffset(layout: CollectionRailLayout, offset: number, index: number): number {
  getCollectionRailItemOffset(layout, index);
  const current = clampCollectionRailOffset(layout, offset);
  const start = index * (layout.itemWidth + layout.gap), end = start + layout.itemWidth;
  return clampCollectionRailOffset(layout, start < current ? start : end > current + layout.viewport ? end - layout.viewport : current);
}

/** Native uses an explicitly LTR scroll host; its RTL row is physically reversed. */
export function getCollectionRailPhysicalOffset(layout: CollectionRailLayout, logicalOffset: number, direction: "ltr" | "rtl"): number {
  const offset = clampCollectionRailOffset(layout, logicalOffset);
  return direction === "rtl" ? layout.maxOffset - offset : offset;
}

export function getCollectionRailKeyboardIntent(key: string, direction: "ltr" | "rtl"): CollectionRailIntent | undefined {
  if (key === "Home") return "first";
  if (key === "End") return "last";
  if (key === "ArrowRight") return direction === "rtl" ? "previous" : "next";
  if (key === "ArrowLeft") return direction === "rtl" ? "next" : "previous";
  return undefined;
}
