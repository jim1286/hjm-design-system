import { jsx as _jsx } from "react/jsx-runtime";
import { resolveMasonryLayout } from "@hjmds/design-contracts/components/masonry";
import { validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
export function Masonry({ items, keyExtractor, renderItem, getItemHeight, width, columns = 2, gap = 12, label, empty }) {
    const keys = items.map(keyExtractor);
    validateListKeys(keys, label);
    const itemWidth = resolveMasonryLayout([], width, columns, gap).itemWidth;
    const layout = resolveMasonryLayout(items.map(item => getItemHeight(item, itemWidth)), width, columns, gap);
    if (!items.length)
        return _jsx("div", { "aria-label": label, children: empty });
    return _jsx("div", { "data-hjm-masonry": true, role: "list", "aria-label": label, style: { position: "relative", width, height: layout.height }, children: items.map((item, index) => { const frame = layout.items[index]; return _jsx("div", { role: "listitem", style: { position: "absolute", insetInlineStart: frame.left, top: frame.top, width: frame.width, height: frame.height }, children: renderItem(item, index) }, keys[index]); }) });
}
//# sourceMappingURL=masonry.js.map