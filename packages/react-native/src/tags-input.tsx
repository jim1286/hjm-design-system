import {
  removeTagAt,
  resolveTagsInputCommit,
  tagsInputRecipe,
  type TagsInputCommitResult,
  type TagsInputPolicy,
  type TagsInputSuggestion,
} from "@hjmds/design-contracts/components/tags-input";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { radius, spacing } from "@hjmds/design-contracts/foundations";
import { useState } from "react";
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type TagsInputProps = Readonly<{
  label: string;
  tags?: readonly string[];
  defaultTags?: readonly string[];
  onTagsChange?: (tags: readonly string[]) => void;
  onReject?: (result: TagsInputCommitResult) => void;
  /** The text being typed; a product filtering `suggestions` needs it. */
  onDraftChange?: (draft: string) => void;
  policy?: TagsInputPolicy;
  /** Candidates for the current draft, already filtered by the product. */
  suggestions?: readonly TagsInputSuggestion[];
  suggestionsLabel?: string;
  /** Composes one tag's remove-control name from the tag text. */
  composeRemoveLabel: (tag: string) => string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function TagsInput({
  label,
  tags: controlledTags,
  defaultTags,
  onTagsChange,
  onReject,
  onDraftChange,
  policy,
  suggestions,
  suggestionsLabel,
  composeRemoveLabel,
  placeholder,
  description,
  disabled = false,
  style,
}: TagsInputProps) {
  const { palette } = useHjmNativeTheme();
  const [internal, setInternal] = useState<readonly string[]>(defaultTags ?? []);
  const tags = controlledTags ?? internal;
  const [draft, setDraft] = useState("");
  const border = resolveColorReference(tagsInputRecipe.frame.border, palette);
  const surface = resolveColorReference(tagsInputRecipe.tag.background, palette);
  const content = resolveColorReference(tagsInputRecipe.tag.color, palette);

  const setTags = (next: readonly string[]) => {
    if (controlledTags === undefined) setInternal(next);
    onTagsChange?.(next);
  };
  const changeDraft = (next: string) => { setDraft(next); onDraftChange?.(next); };
  const commit = (value: string) => {
    const result = resolveTagsInputCommit(tags, value, policy ?? {});
    if (!result.accepted) { onReject?.(result); return; }
    setTags([...tags, result.value]);
    changeDraft("");
  };

  return (
    <View style={[{ gap: tagsInputRecipe.frame.gap }, style]}>
      <Text variant="label">{label}</Text>
      <View
        style={{
          minHeight: tagsInputRecipe.frame.minHeight,
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: tagsInputRecipe.frame.gap,
          padding: spacing.xs,
          borderWidth: 1,
          borderColor: border,
          borderRadius: radius.md,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {tags.map((tag, index) => (
          <View
            key={`${tag}-${index}`}
            style={{
              minHeight: tagsInputRecipe.tag.minHeight,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xxs,
              paddingHorizontal: spacing.xs,
              borderRadius: 999,
              backgroundColor: surface,
            }}
          >
            <Text style={{ color: content }}>{tag}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={composeRemoveLabel(tag)}
              disabled={disabled}
              // The visible chip is small; the touch target is not.
              hitSlop={tagsInputRecipe.remove.minTouchTarget / 2}
              onPress={() => setTags(removeTagAt(tags, index))}
            >
              <Text style={{ color: content }}>×</Text>
            </Pressable>
          </View>
        ))}
        <TextInput
          accessibilityLabel={label}
          editable={!disabled}
          placeholder={placeholder}
          value={draft}
          onChangeText={changeDraft}
          // There is no keyboard commit vocabulary here: the return key is the
          // only reliable one on a phone, so Comma/Space/Blur stay Web-only.
          onSubmitEditing={() => commit(draft)}
          onBlur={() => commit(draft)}
          style={{ flexGrow: 1, minWidth: 80, color: content }}
        />
      </View>
      {suggestions !== undefined && suggestions.length > 0 && draft.trim().length > 0 ? (
        <View accessibilityLabel={suggestionsLabel} style={{ gap: spacing.xxs }}>
          {suggestions.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: item.disabled === true }}
              disabled={item.disabled === true || disabled}
              onPress={() => commit(item.value ?? item.label)}
              style={{ minHeight: tagsInputRecipe.tag.minHeight, justifyContent: "center", paddingHorizontal: spacing.xs }}
            >
              <Text style={{ color: content }}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {description ? <Text tone="muted" variant="caption">{description}</Text> : null}
    </View>
  );
}
