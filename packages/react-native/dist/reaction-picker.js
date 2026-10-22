import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { holdMenuRecipe } from "@hjmds/design-contracts/screen-patterns";
import { chipRecipe } from "@hjmds/design-contracts/recipes";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { nextReaction, validateReactions, resolveReactionOptions } from "@hjmds/design-contracts/reactions";
import { Text } from "./primitives.js";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
export function ReactionPicker({ label, options, value, onValueChange, disabled = false, layout = "wrap", more }) {
    const [expanded, setExpanded] = useState(false);
    const { colors, palette, tokens } = useHjmNativeTheme();
    const all = resolveReactionOptions(options, more);
    validateReactions(all, value);
    const showingAll = expanded && !!more;
    const visible = showingAll ? all : options;
    const choose = (id) => { if (!disabled) {
        onValueChange(nextReaction(all, value, id));
        setExpanded(false);
    } };
    // One text label lets Button apply Native typography; sibling strings bypass its label wrapper.
    // Strip items are 44pt circles spread across the row (measured hold menus fit 6 reactions + more);
    // pill buttons were ~52pt and pushed the sixth reaction behind a horizontal scroll (2026-10-16 review).
    const stripItem = (option) => _jsxs(Pressable, { accessibilityRole: "button", accessibilityLabel: option.label, accessibilityState: { selected: value === option.id, disabled: disabled || (option.disabled ?? false) }, disabled: disabled || (option.disabled ?? false), onPress: () => choose(option.id), style: ({ pressed }) => ({ width: holdMenuRecipe.stripItemSize, height: holdMenuRecipe.stripItemSize, borderRadius: holdMenuRecipe.stripItemSize / 2, alignItems: "center", justifyContent: "center", backgroundColor: value === option.id ? colors.surfaceSelected : pressed ? colors.surface : "transparent" }), children: [_jsx(FixedGlyph, { fontSize: holdMenuRecipe.emojiSize, lineHeight: holdMenuRecipe.emojiSize + 6, children: option.emoji }), option.count === undefined ? null : _jsx(Text, { variant: "caption", children: ` ${option.count}` })] }, option.id);
    // Wrap reactions keep Chip's compact frame for counted emoji. Both layouts use the shared
    // selected surface because emoji cannot communicate a text-color change.
    const chipItem = (option) => {
        const selected = value === option.id;
        const off = disabled || (option.disabled ?? false);
        const state = chipRecipe.states[selected ? "selected" : "idle"];
        return _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: option.label, accessibilityState: { selected, disabled: off }, disabled: off, hitSlop: chipRecipe.sizes.small.hitSlop, onPress: () => choose(option.id), style: ({ pressed }) => ({ minHeight: chipRecipe.sizes.small.height, paddingHorizontal: chipRecipe.sizes.small.paddingHorizontal, borderRadius: tokens.radius[chipRecipe.radius], borderWidth: chipRecipe.borderWidth,
                borderColor: resolveColorReference(state.border, palette), backgroundColor: selected ? colors.surfaceSelected : resolveColorReference(state.background, palette),
                alignItems: "center", justifyContent: "center", opacity: off ? chipRecipe.states.disabledOpacity : pressed ? chipRecipe.states.pressedOpacity : 1 }), children: _jsx(Text, { variant: "body", children: `${option.emoji}${option.count === undefined ? "" : ` ${option.count}`}` }) }, option.id);
    };
    const strip = layout === "strip" && !showingAll;
    const content = strip ? _jsx(View, { accessibilityLabel: label, style: { flexDirection: "row", flexGrow: 1, justifyContent: "space-between", gap: spacing.xxs }, children: visible.map(stripItem) }) : _jsx(View, { accessibilityLabel: label, style: { flexDirection: "row", flexWrap: showingAll || layout === "wrap" ? "wrap" : "nowrap", gap: spacing.xs }, children: visible.map(option => layout === "wrap" ? chipItem(option) : _jsx(Button, { tone: "ghost", shape: "pill", selected: value === option.id, disabled: disabled || (option.disabled ?? false), accessibilityLabel: option.label, onPress: () => choose(option.id), children: _jsxs(Text, { variant: "title", children: [option.emoji, option.count === undefined ? "" : ` ${option.count}`] }) }, option.id)) });
    const choices = showingAll ? _jsx(ScrollView, { style: { maxHeight: 240 }, keyboardShouldPersistTaps: "handled", children: content }) : strip ? _jsx(ScrollView, { horizontal: true, style: { flexShrink: 1, flexGrow: 1 }, contentContainerStyle: { flexGrow: 1 }, showsHorizontalScrollIndicator: false, keyboardShouldPersistTaps: "handled", children: content }) : content;
    return _jsxs(View, { style: { flexDirection: showingAll ? "column" : "row", alignItems: showingAll ? "flex-start" : "center" }, children: [choices, _jsx(View, { style: { flexShrink: 0 }, children: more ? (strip
                    ? _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: more.label, accessibilityState: { expanded: false, disabled }, disabled: disabled, onPress: () => setExpanded(true), style: ({ pressed }) => ({ width: holdMenuRecipe.stripItemSize, height: holdMenuRecipe.stripItemSize, borderRadius: holdMenuRecipe.stripItemSize / 2, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? colors.surface : "transparent" }), children: _jsx(FixedGlyph, { fontSize: holdMenuRecipe.emojiSize, lineHeight: holdMenuRecipe.emojiSize + 6, children: "+" }) })
                    : layout === "wrap"
                        ? _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: more.label, accessibilityState: { expanded: showingAll, disabled }, disabled: disabled, hitSlop: chipRecipe.sizes.small.hitSlop, onPress: () => setExpanded(current => !current), style: ({ pressed }) => ({ minHeight: chipRecipe.sizes.small.height, paddingHorizontal: chipRecipe.sizes.small.paddingHorizontal, borderRadius: tokens.radius[chipRecipe.radius], borderWidth: chipRecipe.borderWidth, borderColor: resolveColorReference(chipRecipe.states.idle.border, palette), backgroundColor: resolveColorReference(chipRecipe.states.idle.background, palette), alignItems: "center", justifyContent: "center", opacity: disabled ? chipRecipe.states.disabledOpacity : pressed ? chipRecipe.states.pressedOpacity : 1 }), children: _jsx(Text, { variant: "body", children: showingAll ? "−" : "+" }) })
                        : _jsx(Button, { tone: "ghost", shape: "pill", accessibilityLabel: more.label, accessibilityState: { expanded: showingAll }, disabled: disabled, onPress: () => setExpanded(current => !current), children: _jsx(Text, { variant: "title", children: showingAll ? "−" : "+" }) })) : null })] });
}
//# sourceMappingURL=reaction-picker.js.map