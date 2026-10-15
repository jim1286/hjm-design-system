/**
 * Lucian #033/#092/#131/#144/#178 informed these compositions, not their demo state engines.
 * Reuse FieldGroup, ActionSession and controlled table columns; products own data and persistence.
 */
export const collectionEditingRecipe = { gap: "md", actionGap: "sm" };
export function assertDistinctIds(items) {
    const ids = new Set();
    for (const { id } of items) {
        if (!id.trim() || ids.has(id))
            throw new TypeError("Collection editing requires distinct nonempty ids");
        ids.add(id);
    }
}
/** A mutation gets its own immutable scope; a later selection never changes an in-flight request. */
export function snapshotSelection(ids) {
    assertDistinctIds(ids.map(id => ({ id })));
    return Object.freeze([...ids]);
}
/** Focus the next surviving row, then the preceding row, then the add action. */
export function focusAfterRemoval(ids, removed, disabledIds = []) {
    const index = ids.indexOf(removed);
    if (index < 0)
        return undefined;
    const enabled = (id) => !disabledIds.includes(id);
    return ids.slice(index + 1).find(enabled) ?? ids.slice(0, index).reverse().find(enabled);
}
export function recoverableFilters(options) {
    assertDistinctIds(options);
    if (options.some(option => !Number.isSafeInteger(option.resultCount) || option.resultCount < 0)) {
        throw new RangeError("Filter recovery counts must be nonnegative safe integers from product data");
    }
    return options.filter(option => option.resultCount > 0);
}
/** Locked columns are barriers: a visibility/order UI must not silently move a fixed column. */
export function changeColumnSettings(columns, id, action) {
    assertDistinctIds(columns);
    const index = columns.findIndex(column => column.id === id), column = columns[index];
    if (!column || column.locked)
        return columns;
    if (action === "toggle") {
        if (column.visible && columns.filter(item => item.visible).length <= 1)
            return columns;
        return columns.map(item => item.id === id ? { ...item, visible: !item.visible } : item);
    }
    const nextIndex = index + (action === "earlier" ? -1 : 1), neighbor = columns[nextIndex];
    if (!neighbor || neighbor.locked)
        return columns;
    const next = [...columns];
    next[index] = neighbor;
    next[nextIndex] = column;
    return next;
}
//# sourceMappingURL=collection-editing.js.map