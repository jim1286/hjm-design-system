import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { resolveMasonryColumns, resolveMasonryLayout } from "@hjmds/design-contracts/components/masonry";
import { validateListKeys } from "@hjmds/design-contracts/components/virtual-list";
import { View } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
export function Masonry(props) {
    const [measured, setMeasured] = useState(0);
    if (props.width !== undefined)
        return _jsx(MasonryFrame, { ...props, width: props.width });
    const { layoutStyle, ...frame } = props;
    return _jsx(View, { style: [{ alignSelf: "stretch" }, layoutStyle], onLayout: event => setMeasured(event.nativeEvent.layout.width), children: measured > 0 ? _jsx(MasonryFrame, { ...frame, width: measured }) : null });
}
function MasonryFrame({ items, keyExtractor, renderItem, getItemHeight, width, columns: suppliedColumns, gap = 12, label, empty, layoutStyle }) {
    const keys = items.map(keyExtractor);
    validateListKeys(keys, label);
    const columns = suppliedColumns ?? resolveMasonryColumns(width, gap);
    const itemWidth = resolveMasonryLayout([], width, columns, gap).itemWidth;
    const layout = resolveMasonryLayout(items.map(item => getItemHeight(item, itemWidth)), width, columns, gap);
    const { environment } = useHjmNativeTheme();
    // The empty collection keeps its measured width and centers within host-allocated space.
    if (!items.length)
        return _jsx(View, { accessibilityLabel: label, style: [layoutStyle, { width, alignItems: "center", justifyContent: "center" }], children: empty });
    return _jsx(View, { accessibilityLabel: label, style: [layoutStyle, { width, height: layout.height }], children: items.map((item, index) => { const frame = layout.items[index]; return _jsx(View, { style: { position: "absolute", top: frame.top, width: frame.width, height: frame.height, ...(environment.direction === "rtl" ? { right: frame.left } : { left: frame.left }) }, children: renderItem(item, index) }, keys[index]); }) });
}
//# sourceMappingURL=masonry.js.map