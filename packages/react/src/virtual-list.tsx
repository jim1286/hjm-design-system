"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { resolveVirtualWindow, validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
import { listRowScrollRoom } from "./internal/list-row-scroll-room.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type VirtualListProps<T> = { items: readonly T[]; keyExtractor: (item: T) => string; renderItem: (item: T, index: number) => ReactNode; rowHeight: number; height: number; label: string; empty?: ReactNode; overscan?: number;
  /** Canonical layout-only placement on the scroll viewport. `height` stays the prop's: the window math reads it. */
  layoutStyle?: HjmCompositionStyleProp };
/** Fixed-height rows are an explicit host contract; use List for unconstrained flowing copy. */
export function VirtualList<T>({ items, keyExtractor, renderItem, rowHeight, height, label, empty, overscan = 3, layoutStyle }: VirtualListProps<T>) {
  const keys = useMemo(() => items.map(keyExtractor), [items, keyExtractor]); validateListKeys(keys, label);
  const [scrollTop, setScrollTop] = useState(0);
  const [active, setActive] = useState<{ key: string | null; index: number }>({ key: null, index: 0 });
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const host = useRef<HTMLDivElement>(null); const moveFocus = useRef(false); const id = useId();
  const range = resolveVirtualWindow(items.length, rowHeight, height, scrollTop, overscan);
  // Stable keys preserve the focused item when filtering/reordering moves it outside the window.
  const activeIndex = active.key === null ? -1 : keys.indexOf(active.key);
  const selected = activeIndex >= 0 ? activeIndex : Math.min(active.index, Math.max(0, items.length - 1));
  const focused = focusedKey === null ? -1 : keys.indexOf(focusedKey);
  useLayoutEffect(() => { if (host.current && host.current.scrollTop !== range.offset) host.current.scrollTop = range.offset; }, [range.offset]);
  useLayoutEffect(() => { if (moveFocus.current) { document.getElementById(`${id}-${selected}`)?.focus({ preventScroll: true }); moveFocus.current = false; } }, [selected, id]);
  const previousKeys = useRef(keys);
  useLayoutEffect(() => {
    const previous = previousKeys.current;
    previousKeys.current = keys;
    if (focusedKey === null || keys.includes(focusedKey) || document.activeElement !== document.body) return;
    // Removing a focused DOM subtree sends focus to body without a blur event.
    // Continue at its former position (or the previous last row), never steal
    // focus from a control the user deliberately reached outside this list.
    const index = Math.min(Math.max(0, previous.indexOf(focusedKey)), Math.max(0, keys.length - 1));
    setFocusedKey(null);
    setActive({ key: keys[index] ?? null, index });
    const viewport = host.current;
    if (!viewport) return;
    if (!keys.length) { moveFocus.current = false; viewport.focus({ preventScroll: true }); return; }
    const top = index * rowHeight;
    if (top < viewport.scrollTop) viewport.scrollTop = top;
    else if (top + rowHeight > viewport.scrollTop + height) viewport.scrollTop = top + rowHeight - height;
    setScrollTop(viewport.scrollTop);
    moveFocus.current = true;
    const row = document.getElementById(`${id}-${index}`);
    if (row) { row.focus({ preventScroll: true }); moveFocus.current = false; }
  }, [keys, focusedKey, id, rowHeight, height]);
  // Keep keyboard/descendant focus mounted when wheel scrolling moves it outside the window.
  const indices = [...new Set([...Array.from({ length: range.end - range.start }, (_, i) => i + range.start), ...(items.length ? [selected] : []), ...(focused >= 0 ? [focused] : [])])].sort((a,b) => a-b);
  // Pointer or programmatic focus must become the keyboard origin too.
  return <div data-hjm-virtual-list className="hjm-virtual-list" ref={host} role="list" aria-label={label} tabIndex={0}
    // The viewport clips, so it keeps the shared ListRow bleed room: row text stays on the host's content edge and the
    // row fill is not cut or turned into horizontal scroll (2026-10-17).
    style={{ ...listRowScrollRoom(), ...layoutStyle, overflowY: "auto", height, position: "relative" }} onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
    onKeyDown={event => {
      if (!items.length || !(event.target instanceof HTMLElement) || (event.target !== event.currentTarget && !event.target.hasAttribute("data-virtual-row"))) return;
      const next = event.key === "ArrowDown" ? Math.min(selected + 1, items.length - 1) : event.key === "ArrowUp" ? Math.max(0, selected - 1) : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null;
      if (next === null) return; event.preventDefault(); moveFocus.current = true; setActive({ key: keys[next]!, index: next });
      const top = next * rowHeight; const viewport = event.currentTarget;
      if (top < viewport.scrollTop) viewport.scrollTop = top;
      else if (top + rowHeight > viewport.scrollTop + height) viewport.scrollTop = top + rowHeight - height;
      setScrollTop(viewport.scrollTop);
      const rendered = document.getElementById(`${id}-${next}`);
      if (rendered) { rendered.focus({ preventScroll: true }); moveFocus.current = false; }
    }}>
    {!items.length ? <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>{empty}</div> : <div style={{ position: "relative", height: range.totalHeight }}>
      {indices.map(index => <div key={keys[index]} id={`${id}-${index}`} role="listitem" data-virtual-row className="hjm-virtual-list__row" tabIndex={index === selected ? 0 : -1} aria-setsize={items.length} aria-posinset={index + 1}
        onFocusCapture={() => { setFocusedKey(keys[index]!); setActive({ key: keys[index]!, index }); }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedKey(null); }}
        style={{ position: "absolute", top: index * rowHeight, height: rowHeight, width: "100%" }}>{renderItem(items[index]!, index)}</div>)}
    </div>}
  </div>;
}
