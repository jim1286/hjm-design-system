import { View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { nextReaction, validateReactions, type ReactionOption } from "@hjmds/design-contracts/reactions";
import { Button } from "./actions.js";
export type ReactionPickerProps = Readonly<{ label: string; options: readonly ReactionOption[]; value: string | null; onValueChange: (value: string | null) => void; disabled?: boolean }>;
export function ReactionPicker({ label, options, value, onValueChange, disabled = false }: ReactionPickerProps) {
  validateReactions(options, value);
  // One text label lets Button apply Native typography; sibling strings bypass its label wrapper.
  return <View accessibilityLabel={label} style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>{options.map(option => <Button key={option.id} tone="ghost" shape="pill" selected={value === option.id} disabled={disabled || (option.disabled ?? false)} accessibilityLabel={option.label} onPress={() => onValueChange(nextReaction(options, value, option.id))}>{`${option.emoji}${option.count === undefined ? "" : ` ${option.count}`}`}</Button>)}</View>;
}
