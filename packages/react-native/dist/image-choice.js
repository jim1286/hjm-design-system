import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { imageChoiceRecipe, resolveImageChoiceCaptionLines, resolveImageChoiceColumns, resolveImageChoiceOuterSize, resolveImageChoiceTileHeight, resolveImageChoiceToggle, validateImageChoiceItemLabelLines, validateImageChoiceItems, } from "@hjmds/design-contracts/components/image-choice";
import { resolveVirtualWindow, virtualListRecipe } from "@hjmds/design-contracts/components/virtual-list";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
/**
 * Picks avatars or photos by image (2026-10-16). Tiles are square, wrap to the available width, and show
 * a brand ring plus a check when chosen; screen readers hear radios (single) or checkboxes (multiple).
 */
export function ImageChoiceGroup(props) {
    const { label, showLabel = false, showItemLabels = false, itemLabelLines = imageChoiceRecipe.itemLabelLines, items, disabled = false, virtualized } = props;
    validateImageChoiceItems(items);
    validateImageChoiceItemLabelLines(itemLabelLines);
    const { colors, textScaling, tokens } = useHjmNativeTheme();
    const [width, setWidth] = useState(0);
    const recipe = imageChoiceRecipe;
    const isSelected = (id) => props.selectionMode === "single" ? props.value === id : props.value.includes(id);
    const choose = (id) => {
        if (props.selectionMode === "single")
            props.onValueChange(resolveImageChoiceToggle("single", props.value, id));
        else
            props.onValueChange(resolveImageChoiceToggle("multiple", props.value, id));
    };
    const role = props.selectionMode === "single" ? "radio" : "checkbox";
    const groupRole = props.selectionMode === "single" ? "radiogroup" : "list";
    const outer = resolveImageChoiceOuterSize();
    const captionLines = resolveImageChoiceCaptionLines({ showItemLabels, itemLabelLines, hasDescription: items.some(item => item.description !== undefined) });
    // Rendered caption line height: Text scales the token by the Provider's controlled or OS text scale.
    const captionLineHeight = tokens.typography[recipe.itemLabelVariant].lineHeight * textScaling.scale;
    const tileHeight = resolveImageChoiceTileHeight(captionLines, captionLineHeight);
    const renderTile = (item) => {
        const selected = isSelected(item.id);
        const off = disabled || (item.disabled ?? false);
        // The ring lives on an inner frame so an item label can sit below it inside the same Pressable: Android does
        // not deliver touches to children drawn outside their parent's bounds, so the name must not overflow the tile.
        return _jsxs(Pressable, { accessibilityRole: role, accessibilityLabel: item.label, accessibilityHint: item.description, accessibilityState: { checked: selected, disabled: off }, disabled: off, onPress: () => choose(item.id), style: ({ pressed }) => ({ width: outer, minHeight: tileHeight, gap: recipe.itemLabelGap, opacity: off ? 0.5 : pressed ? 0.8 : 1 }), children: [_jsxs(View, { style: { width: outer, height: outer, padding: recipe.ringOffset, borderWidth: recipe.ringWidth, borderColor: selected ? colors.contentBrand : "transparent", borderRadius: recipe.radius + recipe.ringOffset + recipe.ringWidth }, children: [_jsx(View, { style: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: recipe.radius, overflow: "hidden", backgroundColor: colors.surface }, children: item.image }), selected ? _jsx(View, { pointerEvents: "none", style: { position: "absolute", top: 0, end: 0, width: recipe.checkSize, height: recipe.checkSize, borderRadius: recipe.checkSize / 2, backgroundColor: colors.contentBrand, alignItems: "center", justifyContent: "center" }, children: _jsx(FixedGlyph, { color: colors.onPrimary, fontSize: 12, lineHeight: 14, children: "\u2713" }) }) : null] }), showItemLabels ? _jsx(Text, { variant: recipe.itemLabelVariant, align: "center", numberOfLines: itemLabelLines, accessible: false, importantForAccessibility: "no", children: item.label }) : null, item.description === undefined ? null : _jsx(Text, { variant: recipe.itemDescriptionVariant, tone: recipe.itemDescriptionTone, align: "center", numberOfLines: recipe.itemDescriptionLines, accessible: false, importantForAccessibility: "no", children: item.description })] }, item.id);
    };
    const columns = width > 0 ? Math.min(items.length, resolveImageChoiceColumns(width)) : 0;
    const rows = columns ? Array.from({ length: Math.ceil(items.length / columns) }, (_, row) => items.slice(row * columns, row * columns + columns)) : [];
    // Keep the first/last column on the group edges. Empty slots preserve the same columns in the final partial row.
    const renderRow = (row) => _jsxs(_Fragment, { children: [row.map(renderTile), Array.from({ length: columns - row.length }, (_, index) => _jsx(View, { accessible: false, style: { width: outer } }, `empty-${index}`))] });
    if (virtualized) {
        // Validates the viewport and overscan with the VirtualList window contract before the first layout.
        const overscan = virtualized.overscan ?? virtualListRecipe.overscan;
        const stride = tileHeight + recipe.gap;
        resolveVirtualWindow(0, stride, virtualized.height, 0, overscan);
        // A FlatList of tile rows, not VirtualList: VirtualList exposes a plain list, and this group must stay the
        // radiogroup/list that names its radio/checkbox tiles. Row height is fixed, so getItemLayout skips measuring.
        return _jsxs(View, { style: { gap: tokens.spacing.xs }, children: [showLabel ? _jsx(Text, { variant: "label", children: label }) : null, _jsx(View, { style: { height: virtualized.height }, onLayout: event => setWidth(event.nativeEvent.layout.width), children: columns ? _jsx(FlatList, { data: rows, keyExtractor: (row) => row[0].id, accessibilityLabel: label, accessibilityRole: groupRole, style: { height: virtualized.height, flexGrow: 0 }, initialNumToRender: Math.ceil(virtualized.height / stride) + overscan, getItemLayout: (_data, index) => ({ length: stride, offset: index * stride, index }), renderItem: ({ item: row }) => _jsx(View, { style: { flexDirection: "row", justifyContent: "space-between", gap: recipe.gap, height: stride, paddingBottom: recipe.gap }, children: renderRow(row) }) }) : null })] });
    }
    return _jsxs(View, { style: { gap: tokens.spacing.xs }, children: [showLabel ? _jsx(Text, { variant: "label", children: label }) : null, _jsx(View, { accessibilityLabel: label, accessibilityRole: groupRole, onLayout: event => setWidth(event.nativeEvent.layout.width), style: { gap: recipe.gap }, children: rows.map(row => _jsx(View, { style: { flexDirection: "row", justifyContent: "space-between", gap: recipe.gap }, children: renderRow(row) }, row[0].id)) })] });
}
//# sourceMappingURL=image-choice.js.map