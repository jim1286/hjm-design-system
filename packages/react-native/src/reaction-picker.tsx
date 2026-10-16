import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { holdMenuRecipe } from "@hjmds/design-contracts/screen-patterns";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { nextReaction, validateReactions, resolveReactionOptions, type ReactionMoreOptions, type ReactionOption } from "@hjmds/design-contracts/reactions";
import { Text } from "./primitives.js";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
export type ReactionPickerProps = Readonly<{ label: string; options: readonly ReactionOption[]; value: string | null; onValueChange: (value: string | null) => void; disabled?: boolean; layout?: "wrap" | "strip"; more?: ReactionMoreOptions }>;
export function ReactionPicker({ label, options, value, onValueChange, disabled = false, layout = "wrap", more }: ReactionPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useHjmNativeTheme();
  const all = resolveReactionOptions(options, more);
  validateReactions(all, value);
  const showingAll = expanded && !!more;
  const visible = showingAll ? all : options;
  const choose = (id: string) => { if (!disabled) { onValueChange(nextReaction(all, value, id)); setExpanded(false); } };
  // One text label lets Button apply Native typography; sibling strings bypass its label wrapper.
  // Strip items are 44pt circles spread across the row (measured hold menus fit 6 reactions + more);
  // pill buttons were ~52pt and pushed the sixth reaction behind a horizontal scroll (2026-10-16 review).
  const stripItem = (option: ReactionOption) => <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={option.label} accessibilityState={{ selected: value === option.id, disabled: disabled || (option.disabled ?? false) }}
    disabled={disabled || (option.disabled ?? false)} onPress={() => choose(option.id)}
    style={({ pressed }) => ({ width: holdMenuRecipe.stripItemSize, height: holdMenuRecipe.stripItemSize, borderRadius: holdMenuRecipe.stripItemSize / 2, alignItems: "center", justifyContent: "center", backgroundColor: value === option.id ? colors.surfaceAccent : pressed ? colors.surface : "transparent" })}>
    {/* Emoji keep the measured ~28pt glyph regardless of the reading text scale. */}
    <FixedGlyph fontSize={holdMenuRecipe.emojiSize} lineHeight={holdMenuRecipe.emojiSize + 6}>{option.emoji}</FixedGlyph>{option.count === undefined ? null : <Text variant="caption">{` ${option.count}`}</Text>}
  </Pressable>;
  const strip = layout === "strip" && !showingAll;
  const content = strip ? <View accessibilityLabel={label} style={{ flexDirection: "row", flexGrow: 1, justifyContent: "space-between", gap: spacing.xxs }}>{visible.map(stripItem)}</View> : <View accessibilityLabel={label} style={{ flexDirection: "row", flexWrap: showingAll || layout === "wrap" ? "wrap" : "nowrap", gap: spacing.xs }}>{visible.map(option => <Button key={option.id} tone="ghost" shape="pill" selected={value === option.id} disabled={disabled || (option.disabled ?? false)} accessibilityLabel={option.label} onPress={() => choose(option.id)}>{layout === "strip" ? <Text variant="title">{option.emoji}{option.count === undefined ? "" : ` ${option.count}`}</Text> : `${option.emoji}${option.count === undefined ? "" : ` ${option.count}`}`}</Button>)}</View>;
  const choices = showingAll ? <ScrollView style={{maxHeight:240}} keyboardShouldPersistTaps="handled">{content}</ScrollView> : strip ? <ScrollView horizontal style={{flexShrink:1,flexGrow:1}} contentContainerStyle={{flexGrow:1}} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">{content}</ScrollView> : content;
  return <View style={{flexDirection:showingAll ? "column" : "row",alignItems:showingAll ? "flex-start" : "center"}}>{choices}<View style={{flexShrink:0}}>{more ? (strip
    ? <Pressable accessibilityRole="button" accessibilityLabel={more.label} accessibilityState={{expanded:false,disabled}} disabled={disabled} onPress={() => setExpanded(true)} style={({pressed}) => ({width:holdMenuRecipe.stripItemSize,height:holdMenuRecipe.stripItemSize,borderRadius:holdMenuRecipe.stripItemSize / 2,alignItems:"center",justifyContent:"center",backgroundColor:pressed ? colors.surface : "transparent"})}><FixedGlyph fontSize={holdMenuRecipe.emojiSize} lineHeight={holdMenuRecipe.emojiSize + 6}>+</FixedGlyph></Pressable>
    : <Button tone="ghost" shape="pill" accessibilityLabel={more.label} accessibilityState={{expanded:showingAll}} disabled={disabled} onPress={() => setExpanded(current => !current)}><Text variant="title">{showingAll ? "−" : "+"}</Text></Button>) : null}</View></View>;
}
