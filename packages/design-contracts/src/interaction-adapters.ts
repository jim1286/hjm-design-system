/** Optional interaction contracts have no engine or catalog dependency. */
export type SortableItem = Readonly<{ id: string; label: string; disabled?: boolean }>;
export type ReorderIntent = Readonly<{
  itemId: string; fromIndex: number; toIndex: number; orderedIds: readonly string[];
  source: "drag" | "keyboard" | "accessibility-action";
}>;
export type SortableLabels = Readonly<{
  instructions: string;
  dragStart: (item: SortableItem) => string;
  dragCancel: string;
  handle: (item: SortableItem) => string;
  previous: (item: SortableItem) => string;
  next: (item: SortableItem) => string;
  position: (item: SortableItem, position: number, total: number) => string;
}>;
export function validateItems(items: readonly SortableItem[]): void {
  if (items.some(item => !item.id.trim() || !item.label.trim()) || new Set(items.map(item => item.id)).size !== items.length)
    throw new TypeError("Items require unique nonempty IDs and localized labels");
}
export function reorderIntent(items: readonly SortableItem[], id: string, to: number, source: ReorderIntent["source"]): ReorderIntent | null {
  validateItems(items);
  const from = items.findIndex(item => item.id === id);
  if (from < 0 || !Number.isInteger(to) || to < 0 || to >= items.length || from === to) return null;
  // A disabled item is fixed in place, not merely missing a drag handle.
  if (items.slice(Math.min(from, to), Math.max(from, to) + 1).some(item => item.disabled)) return null;
  const orderedIds = items.map(item => item.id);
  orderedIds.splice(to, 0, orderedIds.splice(from, 1)[0]!);
  return { itemId: id, fromIndex: from, toIndex: to, orderedIds, source };
}
export type RowAction = Readonly<{ id: string; label: string; intent?: "default" | "danger"; disabled?: boolean }>;
export function validateActions(actions: readonly RowAction[]): void { validateItems(actions); }
export type CelebrationPreset = "small-burst" | "milestone";
// Conservative recipes: bounded one-shot effects rather than an infinite
// celebratory layer. Device profiling is required before increasing these limits.
export const celebrationRecipe = {
  "small-burst": { count: 32, duration: 1600 },
  milestone: { count: 64, duration: 2400 },
} as const;
/**
 * Particle colors: the primary plus the four theme status accents, resolved per theme by the renderer.
 * The first adoption used primary + surfaceAccent; surfaceAccent is a pale surface tint, so 2026-09-30 device
 * captures showed a sparse single-blue burst that barely read as a celebration. Status accents are already
 * contrast-checked foreground hues in both themes, so no new palette is introduced.
 */
export const celebrationAccentTones = ["info", "success", "warning", "attention"] as const;
export function celebrationColors(primary: string, accents: Readonly<Record<(typeof celebrationAccentTones)[number], string>>): string[] {
  return [primary, ...celebrationAccentTones.map(tone => accents[tone])];
}
export function validateEventId(eventId: string): void {
  if (!eventId.trim()) throw new TypeError("Celebration eventId must not be empty");
}
export function validateCarousel(items: readonly SortableItem[], currentKey: string): number {
  validateItems(items);
  const index = items.findIndex(item => item.id === currentKey);
  if (index < 0) throw new TypeError("Carousel currentKey must identify a slide");
  return index;
}
