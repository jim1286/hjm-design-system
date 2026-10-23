export type CheckboxState = boolean | "mixed";
export type MixedCheckboxActivation = "check" | "uncheck";

/** Minimum collection shape needed by checkbox selection algorithms. */
export type CheckboxSelectionItem<Key extends string = string> = Readonly<{
  id: Key;
  label: string;
  description?: string;
  disabled?: boolean;
}>;

export const checkboxBehaviorDefaults = {
  mixedActivation: "check",
} as const satisfies Readonly<{ mixedActivation: MixedCheckboxActivation }>;

function validateCheckboxSelectionItems<Key extends string>(
  items: readonly CheckboxSelectionItem<Key>[],
): void {
  const ids = new Set<Key>();
  for (const item of items) {
    if (typeof item.id !== "string" || item.id.trim().length === 0) {
      throw new TypeError("Selection item id must not be empty");
    }
    if (typeof item.label !== "string" || item.label.trim().length === 0) {
      throw new TypeError(`Selection item ${item.id} label must not be empty`);
    }
    if (
      item.description !== undefined &&
      (typeof item.description !== "string" || item.description.trim().length === 0)
    ) {
      throw new TypeError(
        `Selection item ${item.id} description must not be empty when provided`,
      );
    }
    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate selection item id: ${item.id}`);
    }
    ids.add(item.id);
  }
}

export function getCheckboxNextState(
  current: CheckboxState,
  mixedActivation: MixedCheckboxActivation = checkboxBehaviorDefaults.mixedActivation,
): boolean {
  return current === "mixed" ? mixedActivation === "check" : !current;
}

export function toggleCheckboxSelection<Key extends string>(
  items: readonly CheckboxSelectionItem<Key>[],
  current: ReadonlySet<Key>,
  id: Key,
): ReadonlySet<Key> {
  validateCheckboxSelectionItems(items);
  const knownIds = new Set(items.map((item) => item.id));
  for (const selectedId of current) {
    if (!knownIds.has(selectedId)) {
      throw new RangeError(`Selected checkbox must exist: ${selectedId}`);
    }
  }
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new RangeError(`Checkbox must exist: ${id}`);

  const next = new Set(current);
  if (item.disabled) return next;
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function reconcileCheckboxSelection<Key extends string>(
  items: readonly CheckboxSelectionItem<Key>[],
  current: ReadonlySet<Key>,
): ReadonlySet<Key> {
  validateCheckboxSelectionItems(items);
  const knownIds = new Set(items.map((item) => item.id));
  const reconciled = [...current].filter((id) => knownIds.has(id));
  return reconciled.length === current.size ? current : new Set(reconciled);
}

/**
 * Smallest scroll offset that shows an item inside a horizontal rail (SegmentedControl / CheckboxGroup
 * `overflow="scroll"`). `start`/`size` are the item's position and width in content coordinates; `inset` keeps
 * that much room around the item (focus ring, hit slop). Returns the current offset when the item is already shown.
 */
export function resolveScrollRevealOffset(offset: number, viewport: number, start: number, size: number, inset = 0): number {
  if (start - inset < offset) return Math.max(0, start - inset);
  if (start + size + inset > offset + viewport) return Math.max(0, start + size + inset - viewport);
  return offset;
}
