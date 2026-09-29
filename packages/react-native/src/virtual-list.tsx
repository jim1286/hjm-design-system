import type { ReactNode } from "react";
import { FlatList, View } from "react-native";
import { resolveVirtualWindow, validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
export type VirtualListProps<T> = { items: readonly T[]; keyExtractor: (item: T) => string; renderItem: (item: T, index: number) => ReactNode; rowHeight: number; height: number; label: string; empty?: ReactNode; overscan?: number };
/** FlatList owns recycling and native assistive scrolling; rowHeight must fit the host's current text scale. */
export function VirtualList<T>({ items, keyExtractor, renderItem, rowHeight, height, label, empty, overscan = 3 }: VirtualListProps<T>) {
  validateListKeys(items.map(keyExtractor), label); resolveVirtualWindow(items.length, rowHeight, height, 0, overscan);
  // ScrollView defaults to flexGrow: 1; disable it so the declared viewport
  // remains fixed inside a tall host instead of expanding beyond `height`.
  return <FlatList data={items} accessibilityLabel={label} keyExtractor={keyExtractor}
    style={{ height, flexGrow: 0, flexShrink: 0 }} getItemLayout={(_data, index) => ({ length: rowHeight, offset: index * rowHeight, index })}
    initialNumToRender={Math.ceil(height / rowHeight) + overscan} ListEmptyComponent={<View>{empty}</View>}
    renderItem={({ item, index }) => <View style={{ height: rowHeight }}>{renderItem(item, index)}</View>} />;
}
