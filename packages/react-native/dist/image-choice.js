import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, View } from "react-native";
import { imageChoiceRecipe, resolveImageChoiceToggle, validateImageChoiceItems } from "@hjmds/design-contracts/components/image-choice";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
/**
 * Picks avatars or photos by image (2026-10-16). Tiles are square, wrap to the available width, and show
 * a brand ring plus a check when chosen; screen readers hear radios (single) or checkboxes (multiple).
 */
export function ImageChoiceGroup(props) {
    const { label, showLabel = false, items, disabled = false } = props;
    validateImageChoiceItems(items);
    const { colors, tokens } = useHjmNativeTheme();
    const recipe = imageChoiceRecipe;
    const isSelected = (id) => props.selectionMode === "single" ? props.value === id : props.value.includes(id);
    const choose = (id) => {
        if (props.selectionMode === "single")
            props.onValueChange(resolveImageChoiceToggle("single", props.value, id));
        else
            props.onValueChange(resolveImageChoiceToggle("multiple", props.value, id));
    };
    const role = props.selectionMode === "single" ? "radio" : "checkbox";
    return _jsxs(View, { style: { gap: tokens.spacing.xs }, children: [showLabel ? _jsx(Text, { variant: "label", children: label }) : null, _jsx(View, { accessibilityLabel: label, accessibilityRole: props.selectionMode === "single" ? "radiogroup" : "list", style: { flexDirection: "row", flexWrap: "wrap", gap: recipe.gap }, children: items.map(item => {
                    const selected = isSelected(item.id);
                    const off = disabled || (item.disabled ?? false);
                    return _jsxs(Pressable, { accessibilityRole: role, accessibilityLabel: item.label, accessibilityState: { checked: selected, disabled: off }, disabled: off, onPress: () => choose(item.id), style: ({ pressed }) => ({ width: recipe.tileSize + (recipe.ringWidth + recipe.ringOffset) * 2, height: recipe.tileSize + (recipe.ringWidth + recipe.ringOffset) * 2, padding: recipe.ringOffset, borderWidth: recipe.ringWidth, borderColor: selected ? colors.contentBrand : "transparent", borderRadius: recipe.radius + recipe.ringOffset + recipe.ringWidth, opacity: off ? 0.5 : pressed ? 0.8 : 1 }), children: [_jsx(View, { style: { flex: 1, borderRadius: recipe.radius, overflow: "hidden", backgroundColor: colors.surface }, children: item.image }), selected ? _jsx(View, { pointerEvents: "none", style: { position: "absolute", top: 0, end: 0, width: recipe.checkSize, height: recipe.checkSize, borderRadius: recipe.checkSize / 2, backgroundColor: colors.contentBrand, alignItems: "center", justifyContent: "center" }, children: _jsx(FixedGlyph, { color: colors.onPrimary, fontSize: 12, lineHeight: 14, children: "\u2713" }) }) : null] }, item.id);
                }) })] });
}
//# sourceMappingURL=image-choice.js.map