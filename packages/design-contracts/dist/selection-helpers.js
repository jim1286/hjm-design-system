export const checkboxBehaviorDefaults = {
    mixedActivation: "check",
};
function validateCheckboxSelectionItems(items) {
    const ids = new Set();
    for (const item of items) {
        if (typeof item.id !== "string" || item.id.trim().length === 0) {
            throw new TypeError("Selection item id must not be empty");
        }
        if (typeof item.label !== "string" || item.label.trim().length === 0) {
            throw new TypeError(`Selection item ${item.id} label must not be empty`);
        }
        if (item.description !== undefined &&
            (typeof item.description !== "string" || item.description.trim().length === 0)) {
            throw new TypeError(`Selection item ${item.id} description must not be empty when provided`);
        }
        if (ids.has(item.id)) {
            throw new TypeError(`Duplicate selection item id: ${item.id}`);
        }
        ids.add(item.id);
    }
}
export function getCheckboxNextState(current, mixedActivation = checkboxBehaviorDefaults.mixedActivation) {
    return current === "mixed" ? mixedActivation === "check" : !current;
}
export function toggleCheckboxSelection(items, current, id) {
    validateCheckboxSelectionItems(items);
    const knownIds = new Set(items.map((item) => item.id));
    for (const selectedId of current) {
        if (!knownIds.has(selectedId)) {
            throw new RangeError(`Selected checkbox must exist: ${selectedId}`);
        }
    }
    const item = items.find((candidate) => candidate.id === id);
    if (!item)
        throw new RangeError(`Checkbox must exist: ${id}`);
    const next = new Set(current);
    if (item.disabled)
        return next;
    if (next.has(id))
        next.delete(id);
    else
        next.add(id);
    return next;
}
export function reconcileCheckboxSelection(items, current) {
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
export function resolveScrollRevealOffset(offset, viewport, start, size, inset = 0) {
    if (start - inset < offset)
        return Math.max(0, start - inset);
    if (start + size + inset > offset + viewport)
        return Math.max(0, start + size + inset - viewport);
    return offset;
}
//# sourceMappingURL=selection-helpers.js.map