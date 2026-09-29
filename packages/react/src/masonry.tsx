import type { ReactNode } from "react";
import { resolveMasonryLayout } from "@hjmds/design-contracts/components/masonry";
import { validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
export type MasonryProps<T> = { items: readonly T[]; keyExtractor: (item: T) => string; renderItem: (item: T, index: number) => ReactNode; getItemHeight: (item: T, itemWidth: number) => number; width: number; columns?: number; gap?: number; label: string; empty?: ReactNode };
export function Masonry<T>({ items, keyExtractor, renderItem, getItemHeight, width, columns = 2, gap = 12, label, empty }: MasonryProps<T>) {
  const keys = items.map(keyExtractor); validateListKeys(keys, label);
  const itemWidth = resolveMasonryLayout([], width, columns, gap).itemWidth;
  const layout = resolveMasonryLayout(items.map(item => getItemHeight(item, itemWidth)), width, columns, gap);
  if (!items.length) return <div aria-label={label}>{empty}</div>;
  return <div data-hjm-masonry role="list" aria-label={label} style={{ position: "relative", width, height: layout.height }}>
    {items.map((item, index) => { const frame = layout.items[index]!; return <div role="listitem" key={keys[index]} style={{ position: "absolute", insetInlineStart: frame.left, top: frame.top, width: frame.width, height: frame.height }}>{renderItem(item, index)}</div>; })}
  </div>;
}
