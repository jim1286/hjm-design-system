import { jsx as _jsx } from "react/jsx-runtime";
import { View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { nextReaction, validateReactions } from "@hjmds/design-contracts/reactions";
import { Button } from "./actions.js";
export function ReactionPicker({ label, options, value, onValueChange, disabled = false }) {
    validateReactions(options, value);
    // One text label lets Button apply Native typography; sibling strings bypass its label wrapper.
    return _jsx(View, { accessibilityLabel: label, style: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }, children: options.map(option => _jsx(Button, { tone: "ghost", shape: "pill", selected: value === option.id, disabled: disabled || (option.disabled ?? false), accessibilityLabel: option.label, onPress: () => onValueChange(nextReaction(options, value, option.id)), children: `${option.emoji}${option.count === undefined ? "" : ` ${option.count}`}` }, option.id)) });
}
//# sourceMappingURL=reaction-picker.js.map