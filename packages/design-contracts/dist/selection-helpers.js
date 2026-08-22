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
//# sourceMappingURL=selection-helpers.js.map