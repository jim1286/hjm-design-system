import type { ReactNode } from "react";
import { resolveMasonryLayout } from "@hjmds/design-contracts/components/masonry";
import { validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
import { View } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
export type MasonryProps<T> = { items: readonly T[]; keyExtractor: (item: T) => string; renderItem: (item: T, index: number) => ReactNode; getItemHeight: (item: T, itemWidth: number) => number; width: number; columns?: number; gap?: number; label: string; empty?: ReactNode };
export function Masonry<T>({ items, keyExtractor, renderItem, getItemHeight, width, columns = 2, gap = 12, label, empty }: MasonryProps<T>) {
  const keys = items.map(keyExtractor); validateListKeys(keys, label);
  const itemWidth = resolveMasonryLayout([], width, columns, gap).itemWidth;
  const layout = resolveMasonryLayout(items.map(item => getItemHeight(item, itemWidth)), width, columns, gap);
  const { environment } = useHjmNativeTheme();
  if (!items.length) return <View accessibilityLabel={label}>{empty}</View>;
  return <View accessibilityLabel={label} style={{ width, height: layout.height }}>
    {items.map((item, index) => { const frame = layout.items[index]!; return <View key={keys[index]} style={{ position: "absolute", top: frame.top, width: frame.width, height: frame.height, ...(environment.direction === "rtl" ? { right: frame.left } : { left: frame.left }) }}>{renderItem(item, index)}</View>; })}
  </View>;
}
