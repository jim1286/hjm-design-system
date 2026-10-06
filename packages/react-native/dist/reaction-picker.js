import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { nextReaction, validateReactions, resolveReactionOptions } from "@hjmds/design-contracts/reactions";
import { Text } from "./primitives.js";
import { Button } from "./actions.js";
export function ReactionPicker({ label, options, value, onValueChange, disabled = false, layout = "wrap", more }) {
    const [expanded, setExpanded] = useState(false);
    const all = resolveReactionOptions(options, more);
    validateReactions(all, value);
    const showingAll = expanded && !!more;
    const visible = showingAll ? all : options;
    const choose = (id) => { if (!disabled) {
        onValueChange(nextReaction(all, value, id));
        setExpanded(false);
    } };
    // One text label lets Button apply Native typography; sibling strings bypass its label wrapper.
    const content = _jsx(View, { accessibilityLabel: label, style: { flexDirection: "row", flexWrap: showingAll || layout === "wrap" ? "wrap" : "nowrap", gap: spacing.xs }, children: visible.map(option => _jsx(Button, { tone: "ghost", shape: "pill", selected: value === option.id, disabled: disabled || (option.disabled ?? false), accessibilityLabel: option.label, onPress: () => choose(option.id), children: layout === "strip" ? _jsxs(Text, { variant: "title", children: [option.emoji, option.count === undefined ? "" : ` ${option.count}`] }) : `${option.emoji}${option.count === undefined ? "" : ` ${option.count}`}` }, option.id)) });
    const choices = showingAll ? _jsx(ScrollView, { style: { maxHeight: 240 }, keyboardShouldPersistTaps: "handled", children: content }) : layout === "strip" ? _jsx(ScrollView, { horizontal: true, style: { flexShrink: 1 }, showsHorizontalScrollIndicator: false, keyboardShouldPersistTaps: "handled", children: content }) : content;
    return _jsxs(View, { style: { flexDirection: showingAll ? "column" : "row", alignItems: "flex-start" }, children: [choices, _jsx(View, { style: { flexShrink: 0 }, children: more ? _jsx(Button, { tone: "ghost", shape: "pill", accessibilityLabel: more.label, accessibilityState: { expanded: showingAll }, disabled: disabled, onPress: () => setExpanded(current => !current), children: _jsx(Text, { variant: "title", children: showingAll ? "−" : "+" }) }) : null })] });
}
//# sourceMappingURL=reaction-picker.js.map