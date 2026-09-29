export function resolveVirtualWindow(count, rowHeight, viewportHeight, scrollTop, overscan = 3) {
    if (!Number.isInteger(count) || count < 0 || !Number.isFinite(rowHeight) || rowHeight <= 0 || !Number.isFinite(viewportHeight) || viewportHeight <= 0 || !Number.isFinite(scrollTop) || scrollTop < 0 || !Number.isInteger(overscan) || overscan < 0)
        throw new TypeError("Invalid VirtualList dimensions");
    const totalHeight = count * rowHeight;
    const offset = Math.min(scrollTop, Math.max(0, totalHeight - viewportHeight));
    return { start: Math.max(0, Math.floor(offset / rowHeight) - overscan), end: Math.min(count, Math.ceil((offset + viewportHeight) / rowHeight) + overscan), totalHeight, offset };
}
export function validateListKeys(keys, label) {
    if (!label.trim() || new Set(keys).size !== keys.length || keys.some(key => !key.trim()))
        throw new TypeError("List needs a label and unique nonempty keys");
}
export const virtualListRecipe = { layout: "fixed-row-window", overscan: 3, readingOrder: "source" };
//# sourceMappingURL=virtual-list.js.map