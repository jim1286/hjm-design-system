"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { resolveMasonryColumns, resolveMasonryLayout } from "@hjmds/design-contracts/components/masonry";
import { validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type MasonryProps<T> = { items: readonly T[]; keyExtractor: (item: T) => string; renderItem: (item: T, index: number) => ReactNode; getItemHeight: (item: T, itemWidth: number) => number;
  /** Slot width. Omit it and Masonry measures its own slot; before the first measurement nothing is drawn. */
  width?: number;
  /** Fixed column count. Omit it and the count follows the width (`masonryRecipe.minItemWidth`). */
  columns?: number; gap?: number; label: string; empty?: ReactNode;
  /** Canonical layout-only placement on the root. The measured `width`/height still win: absolute item frames depend on them. */
  layoutStyle?: HjmCompositionStyleProp };
export function Masonry<T>(props: MasonryProps<T>) {
  const host = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(0);
  const selfMeasured = props.width === undefined;
  useEffect(() => {
    if (!selfMeasured || !host.current) return;
    // Measure the actual slot: viewport widths also include sidebars, gutters and sheets.
    const observer = new ResizeObserver(([entry]) => setMeasured(entry?.contentRect.width ?? 0));
    observer.observe(host.current);
    return () => observer.disconnect();
  }, [selfMeasured]);
  if (!selfMeasured) return <MasonryFrame {...props} width={props.width!} />;
  const { layoutStyle, ...frame } = props;
  return <div ref={host} data-hjm-masonry-host="" style={layoutStyle}>{measured > 0 ? <MasonryFrame {...frame} width={measured} /> : null}</div>;
}
function MasonryFrame<T>({ items, keyExtractor, renderItem, getItemHeight, width, columns: suppliedColumns, gap = 12, label, empty, layoutStyle }: MasonryProps<T> & { width: number }) {
  const keys = items.map(keyExtractor); validateListKeys(keys, label);
  const columns = suppliedColumns ?? resolveMasonryColumns(width, gap);
  const itemWidth = resolveMasonryLayout([], width, columns, gap).itemWidth;
  const layout = resolveMasonryLayout(items.map(item => getItemHeight(item, itemWidth)), width, columns, gap);
  // A named div without a role is not exposed with its name (ARIA prohibits aria-label on generic).
  // `group` keeps the collection name with the empty copy; `list` was rejected because the empty slot is not a listitem.
  // The empty collection keeps its measured width and centers within host-allocated space.
  if (!items.length) return <div role="group" aria-label={label} style={{ ...layoutStyle, width, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>{empty}</div>;
  // Each frame is a column flex box like a Native View, so a card with `layoutStyle={{ flex: 1 }}` fills the fixed
  // frame on both platforms without a product-side wrapper element.
  return <div data-hjm-masonry role="list" aria-label={label} style={{ ...layoutStyle, position: "relative", width, height: layout.height }}>
    {items.map((item, index) => { const frame = layout.items[index]!; return <div role="listitem" key={keys[index]} style={{ position: "absolute", insetInlineStart: frame.left, top: frame.top, width: frame.width, height: frame.height, display: "flex", flexDirection: "column" }}>{renderItem(item, index)}</div>; })}
  </div>;
}
