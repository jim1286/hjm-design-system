import { jsx as _jsx } from "react/jsx-runtime";
import { FlatList, View } from "react-native";
import { resolveVirtualWindow, validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
import { listRowRecipe } from "@hjmds/design-contracts/recipes";
/** FlatList owns recycling and native assistive scrolling; rowHeight must fit the host's current text scale. */
export function VirtualList({ items, keyExtractor, renderItem, rowHeight, height, label, empty, overscan = 3 }) {
    validateListKeys(items.map(keyExtractor), label);
    resolveVirtualWindow(items.length, rowHeight, height, 0, overscan);
    // ScrollView defaults to flexGrow: 1; disable it so the declared viewport
    // remains fixed inside a tall host instead of expanding beyond `height`.
    // Empty guidance occupies the declared viewport, not a zero-height first row.
    return _jsx(FlatList, { data: items, accessibilityLabel: label, keyExtractor: keyExtractor, 
        // FlatList clips its rows, so it leaves room for the ListRow surface bleed and bleeds itself by the same amount (row
        // text stays on the host's content edge, the row fill is not cut; 2026-10-17, as Web).
        style: { height, flexGrow: 0, flexShrink: 0, marginHorizontal: -listRowRecipe.surfaceBleed }, getItemLayout: (_data, index) => ({ length: rowHeight, offset: index * rowHeight, index }), contentContainerStyle: [{ paddingHorizontal: listRowRecipe.surfaceBleed }, items.length === 0 ? { flexGrow: 1, justifyContent: "center", alignItems: "center" } : undefined], initialNumToRender: Math.ceil(height / rowHeight) + overscan, ListEmptyComponent: _jsx(View, { children: empty }), renderItem: ({ item, index }) => _jsx(View, { style: { height: rowHeight }, children: renderItem(item, index) }) });
}
//# sourceMappingURL=virtual-list.js.map