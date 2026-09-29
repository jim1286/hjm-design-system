import { jsx as _jsx } from "react/jsx-runtime";
import { FlatList, View } from "react-native";
import { resolveVirtualWindow, validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
/** FlatList owns recycling and native assistive scrolling; rowHeight must fit the host's current text scale. */
export function VirtualList({ items, keyExtractor, renderItem, rowHeight, height, label, empty, overscan = 3 }) {
    validateListKeys(items.map(keyExtractor), label);
    resolveVirtualWindow(items.length, rowHeight, height, 0, overscan);
    // ScrollView defaults to flexGrow: 1; disable it so the declared viewport
    // remains fixed inside a tall host instead of expanding beyond `height`.
    return _jsx(FlatList, { data: items, accessibilityLabel: label, keyExtractor: keyExtractor, style: { height, flexGrow: 0, flexShrink: 0 }, getItemLayout: (_data, index) => ({ length: rowHeight, offset: index * rowHeight, index }), initialNumToRender: Math.ceil(height / rowHeight) + overscan, ListEmptyComponent: _jsx(View, { children: empty }), renderItem: ({ item, index }) => _jsx(View, { style: { height: rowHeight }, children: renderItem(item, index) }) });
}
//# sourceMappingURL=virtual-list.js.map