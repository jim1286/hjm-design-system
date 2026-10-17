"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { resolveMasonryColumns, resolveMasonryLayout } from "@hjmds/design-contracts/components/masonry";
import { validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
export function Masonry(props) {
    const host = useRef(null);
    const [measured, setMeasured] = useState(0);
    const selfMeasured = props.width === undefined;
    useEffect(() => {
        if (!selfMeasured || !host.current)
            return;
        // Measure the actual slot: viewport widths also include sidebars, gutters and sheets.
        const observer = new ResizeObserver(([entry]) => setMeasured(entry?.contentRect.width ?? 0));
        observer.observe(host.current);
        return () => observer.disconnect();
    }, [selfMeasured]);
    if (!selfMeasured)
        return _jsx(MasonryFrame, { ...props, width: props.width });
    const { layoutStyle, ...frame } = props;
    return _jsx("div", { ref: host, "data-hjm-masonry-host": "", style: layoutStyle, children: measured > 0 ? _jsx(MasonryFrame, { ...frame, width: measured }) : null });
}
function MasonryFrame({ items, keyExtractor, renderItem, getItemHeight, width, columns: suppliedColumns, gap = 12, label, empty, layoutStyle }) {
    const keys = items.map(keyExtractor);
    validateListKeys(keys, label);
    const columns = suppliedColumns ?? resolveMasonryColumns(width, gap);
    const itemWidth = resolveMasonryLayout([], width, columns, gap).itemWidth;
    const layout = resolveMasonryLayout(items.map(item => getItemHeight(item, itemWidth)), width, columns, gap);
    // A named div without a role is not exposed with its name (ARIA prohibits aria-label on generic).
    // `group` keeps the collection name with the empty copy; `list` was rejected because the empty slot is not a listitem.
    // The empty collection keeps its measured width and centers within host-allocated space.
    if (!items.length)
        return _jsx("div", { role: "group", "aria-label": label, style: { ...layoutStyle, width, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }, children: empty });
    // Each frame is a column flex box like a Native View, so a card with `layoutStyle={{ flex: 1 }}` fills the fixed
    // frame on both platforms without a product-side wrapper element.
    return _jsx("div", { "data-hjm-masonry": true, role: "list", "aria-label": label, style: { ...layoutStyle, position: "relative", width, height: layout.height }, children: items.map((item, index) => { const frame = layout.items[index]; return _jsx("div", { role: "listitem", style: { position: "absolute", insetInlineStart: frame.left, top: frame.top, width: frame.width, height: frame.height, display: "flex", flexDirection: "column" }, children: renderItem(item, index) }, keys[index]); }) });
}
//# sourceMappingURL=masonry.js.map