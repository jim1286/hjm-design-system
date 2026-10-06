import { useState } from "react";
import { ScrollView, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { nextReaction, validateReactions, resolveReactionOptions, type ReactionMoreOptions, type ReactionOption } from "@hjmds/design-contracts/reactions";
import { Text } from "./primitives.js";
import { Button } from "./actions.js";
export type ReactionPickerProps = Readonly<{ label: string; options: readonly ReactionOption[]; value: string | null; onValueChange: (value: string | null) => void; disabled?: boolean; layout?: "wrap" | "strip"; more?: ReactionMoreOptions }>;
export function ReactionPicker({ label, options, value, onValueChange, disabled = false, layout = "wrap", more }: ReactionPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const all = resolveReactionOptions(options, more);
  validateReactions(all, value);
  const showingAll = expanded && !!more;
  const visible = showingAll ? all : options;
  const choose = (id: string) => { if (!disabled) { onValueChange(nextReaction(all, value, id)); setExpanded(false); } };
  // One text label lets Button apply Native typography; sibling strings bypass its label wrapper.
  const content = <View accessibilityLabel={label} style={{ flexDirection: "row", flexWrap: showingAll || layout === "wrap" ? "wrap" : "nowrap", gap: spacing.xs }}>{visible.map(option => <Button key={option.id} tone="ghost" shape="pill" selected={value === option.id} disabled={disabled || (option.disabled ?? false)} accessibilityLabel={option.label} onPress={() => choose(option.id)}>{layout === "strip" ? <Text variant="title">{option.emoji}{option.count === undefined ? "" : ` ${option.count}`}</Text> : `${option.emoji}${option.count === undefined ? "" : ` ${option.count}`}`}</Button>)}</View>;
  const choices = showingAll ? <ScrollView style={{maxHeight:240}} keyboardShouldPersistTaps="handled">{content}</ScrollView> : layout === "strip" ? <ScrollView horizontal style={{flexShrink:1}} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">{content}</ScrollView> : content;
  return <View style={{flexDirection:showingAll ? "column" : "row",alignItems:"flex-start"}}>{choices}<View style={{flexShrink:0}}>{more ? <Button tone="ghost" shape="pill" accessibilityLabel={more.label} accessibilityState={{expanded:showingAll}} disabled={disabled} onPress={() => setExpanded(current => !current)}><Text variant="title">{showingAll ? "−" : "+"}</Text></Button> : null}</View></View>;
}
