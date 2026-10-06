import { jsx as _jsx } from "react/jsx-runtime";
import { resolveMasonryLayout } from "@hjmds/design-contracts/components/masonry";
import { validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
import { View } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
export function Masonry({ items, keyExtractor, renderItem, getItemHeight, width, columns = 2, gap = 12, label, empty, layoutStyle }) {
    const keys = items.map(keyExtractor);
    validateListKeys(keys, label);
    const itemWidth = resolveMasonryLayout([], width, columns, gap).itemWidth;
    const layout = resolveMasonryLayout(items.map(item => getItemHeight(item, itemWidth)), width, columns, gap);
    const { environment } = useHjmNativeTheme();
    if (!items.length)
        return _jsx(View, { accessibilityLabel: label, style: layoutStyle, children: empty });
    return _jsx(View, { accessibilityLabel: label, style: [layoutStyle, { width, height: layout.height }], children: items.map((item, index) => { const frame = layout.items[index]; return _jsx(View, { style: { position: "absolute", top: frame.top, width: frame.width, height: frame.height, ...(environment.direction === "rtl" ? { right: frame.left } : { left: frame.left }) }, children: renderItem(item, index) }, keys[index]); }) });
}
//# sourceMappingURL=masonry.js.map