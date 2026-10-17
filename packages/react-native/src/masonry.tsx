import { useState, type ReactNode } from "react";
import { resolveMasonryColumns, resolveMasonryLayout } from "@hjmds/design-contracts/components/masonry";
import { validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
import { View } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type MasonryProps<T> = { items: readonly T[]; keyExtractor: (item: T) => string; renderItem: (item: T, index: number) => ReactNode; getItemHeight: (item: T, itemWidth: number) => number;
  /** Slot width. Omit it and Masonry measures its own slot with onLayout; before the first measurement nothing is drawn. */
  width?: number;
  /** Fixed column count. Omit it and the count follows the width (`masonryRecipe.minItemWidth`). */
  columns?: number; gap?: number; label: string; empty?: ReactNode; layoutStyle?: HjmCompositionStyleProp };
export function Masonry<T>(props: MasonryProps<T>) {
  const [measured, setMeasured] = useState(0);
  if (props.width !== undefined) return <MasonryFrame {...props} width={props.width} />;
  const { layoutStyle, ...frame } = props;
  return <View style={[{ alignSelf: "stretch" }, layoutStyle]} onLayout={event => setMeasured(event.nativeEvent.layout.width)}>
    {measured > 0 ? <MasonryFrame {...frame} width={measured} /> : null}
  </View>;
}
function MasonryFrame<T>({ items, keyExtractor, renderItem, getItemHeight, width, columns: suppliedColumns, gap = 12, label, empty, layoutStyle }: MasonryProps<T> & { width: number }) {
  const keys = items.map(keyExtractor); validateListKeys(keys, label);
  const columns = suppliedColumns ?? resolveMasonryColumns(width, gap);
  const itemWidth = resolveMasonryLayout([], width, columns, gap).itemWidth;
  const layout = resolveMasonryLayout(items.map(item => getItemHeight(item, itemWidth)), width, columns, gap);
  const { environment } = useHjmNativeTheme();
  // The empty collection keeps its measured width and centers within host-allocated space.
  if (!items.length) return <View accessibilityLabel={label} style={[layoutStyle, { width, alignItems: "center", justifyContent: "center" }]}>{empty}</View>;
  return <View accessibilityLabel={label} style={[layoutStyle, { width, height: layout.height }]}>
    {items.map((item, index) => { const frame = layout.items[index]!; return <View key={keys[index]} style={{ position: "absolute", top: frame.top, width: frame.width, height: frame.height, ...(environment.direction === "rtl" ? { right: frame.left } : { left: frame.left }) }}>{renderItem(item, index)}</View>; })}
  </View>;
}
