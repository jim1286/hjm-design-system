import { radius, spacing } from "./foundations.js";

/**
 * Picking by picture (avatar faces, photos). 2026-10-16 composition review: products imitated this with
 * rows of selected ghost Buttons because HJM had no image-choice control.
 */
export type ImageChoiceSelectionMode = "single" | "multiple";
export type ImageChoiceItemDescriptor = Readonly<{ id: string; label: string; disabled?: boolean }>;

export const imageChoiceRecipe = {
  tileSize: 72,
  gap: spacing.xs,
  radius: radius.md,
  ringWidth: 2,
  ringOffset: 2,
  checkSize: 20,
  /**
   * Visible per-tile caption (`showItemLabels`, 2026-10-18 BurnTok share recipients): people are recognised by name,
   * not only by face. One line, ellipsized, as wide as the tile so the wrap grid stays even.
   */
  itemLabelGap: spacing.xxs,
  itemLabelVariant: "caption",
  itemLabelLines: 1,
} as const;

export function validateImageChoiceItems(items: readonly ImageChoiceItemDescriptor[]): void {
  if (!items.length) throw new TypeError("ImageChoiceGroup needs at least one item");
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id.trim() || ids.has(item.id) || !item.label.trim()) throw new TypeError("ImageChoiceGroup items need unique ids and localized labels");
    ids.add(item.id);
  }
}

/** Single mode keeps exactly the pressed id (radio semantics); multiple toggles membership in order. */
export function resolveImageChoiceToggle(mode: "single", value: string | null, id: string): string;
export function resolveImageChoiceToggle(mode: "multiple", value: readonly string[], id: string): string[];
export function resolveImageChoiceToggle(mode: ImageChoiceSelectionMode, value: string | null | readonly string[], id: string): string | string[] {
  if (mode === "single") return id;
  const list = (value ?? []) as readonly string[];
  return list.includes(id) ? list.filter(entry => entry !== id) : [...list, id];
}
