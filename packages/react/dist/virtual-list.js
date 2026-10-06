import { jsx as _jsx } from "react/jsx-runtime";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { resolveVirtualWindow, validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
/** Fixed-height rows are an explicit host contract; use List for unconstrained flowing copy. */
export function VirtualList({ items, keyExtractor, renderItem, rowHeight, height, label, empty, overscan = 3, layoutStyle }) {
    const keys = useMemo(() => items.map(keyExtractor), [items, keyExtractor]);
    validateListKeys(keys, label);
    const [scrollTop, setScrollTop] = useState(0);
    const [active, setActive] = useState(0);
    const [focused, setFocused] = useState(null);
    const host = useRef(null);
    const moveFocus = useRef(false);
    const id = useId();
    const range = resolveVirtualWindow(items.length, rowHeight, height, scrollTop, overscan);
    const selected = Math.min(active, Math.max(0, items.length - 1));
    useLayoutEffect(() => { if (host.current && host.current.scrollTop !== range.offset)
        host.current.scrollTop = range.offset; }, [range.offset]);
    useLayoutEffect(() => { if (moveFocus.current) {
        document.getElementById(`${id}-${selected}`)?.focus({ preventScroll: true });
        moveFocus.current = false;
    } }, [selected, id]);
    // Keep keyboard/descendant focus mounted when wheel scrolling moves it outside the window.
    const indices = [...new Set([...Array.from({ length: range.end - range.start }, (_, i) => i + range.start), ...(items.length ? [selected] : []), ...(focused !== null && focused < items.length ? [focused] : [])])].sort((a, b) => a - b);
    return _jsx("div", { "data-hjm-virtual-list": true, className: "hjm-virtual-list", ref: host, role: "list", "aria-label": label, tabIndex: 0, style: { ...layoutStyle, overflowY: "auto", height, position: "relative" }, onScroll: event => setScrollTop(event.currentTarget.scrollTop), onKeyDown: event => {
            if (!items.length || !(event.target instanceof HTMLElement) || (event.target !== event.currentTarget && !event.target.hasAttribute("data-virtual-row")))
                return;
            const next = event.key === "ArrowDown" ? Math.min(selected + 1, items.length - 1) : event.key === "ArrowUp" ? Math.max(0, selected - 1) : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null;
            if (next === null)
                return;
            event.preventDefault();
            moveFocus.current = true;
            setActive(next);
            const top = next * rowHeight;
            const viewport = event.currentTarget;
            if (top < viewport.scrollTop)
                viewport.scrollTop = top;
            else if (top + rowHeight > viewport.scrollTop + height)
                viewport.scrollTop = top + rowHeight - height;
            setScrollTop(viewport.scrollTop);
            const rendered = document.getElementById(`${id}-${next}`);
            if (rendered) {
                rendered.focus({ preventScroll: true });
                moveFocus.current = false;
            }
        }, children: !items.length ? empty : _jsx("div", { style: { position: "relative", height: range.totalHeight }, children: indices.map(index => _jsx("div", { id: `${id}-${index}`, role: "listitem", "data-virtual-row": true, className: "hjm-virtual-list__row", tabIndex: index === selected ? 0 : -1, "aria-setsize": items.length, "aria-posinset": index + 1, onFocusCapture: () => setFocused(index), onBlurCapture: event => { if (!event.currentTarget.contains(event.relatedTarget))
                    setFocused(null); }, style: { position: "absolute", top: index * rowHeight, height: rowHeight, width: "100%" }, children: renderItem(items[index], index) }, keys[index])) }) });
}
//# sourceMappingURL=virtual-list.js.map