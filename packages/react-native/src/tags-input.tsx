import { FixedGlyph } from "./internal/fixed-glyph.js";
import {
  removeTagAt,
  resolveTagsInputCommit,
  tagsInputRecipe,
  type TagsInputCommitResult,
  type TagsInputPolicy,
  type TagsInputSuggestion,
} from "@hjmds/design-contracts/components/tags-input";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { useState } from "react";
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { useHjmNativeTheme } from "./provider.js";
import { resolveNativeFontStyle, resolveNativeTextScaleProps } from "./internal/styles.js";

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
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
   * `tagsInputRecipe` owns appearance. Removed in the next major (consumer-policy.md §3.1).
   */
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
  layoutStyle,
  style,
}: TagsInputProps) {
  warnDeprecatedStyleProps("TagsInput", { style }, "layoutStyle for placement; tagsInputRecipe owns appearance");
  const { palette, tokens, textScaling } = useHjmNativeTheme();
  const [internal, setInternal] = useState<readonly string[]>(defaultTags ?? []);
  const tags = controlledTags ?? internal;
  const [draft, setDraft] = useState("");
  const border = resolveColorReference(tagsInputRecipe.frame.border, palette);
  const surface = resolveColorReference(tagsInputRecipe.tag.background, palette);
  const content = resolveColorReference(tagsInputRecipe.tag.color, palette);
  const inputText = resolveNativeTextScaleProps(textScaling, [
    tokens.typography[fieldRecipe.textVariant],
    resolveNativeFontStyle(tokens.fontFamily.ui),
    { flexGrow: 1, minWidth: 80, color: content },
  ]);

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

  // A suggestion row is a touch target, not a tag chip: tag.minHeight (28) left
  // these rows under 44 (2026-10-06 follow-up). Both renderers use the target role.
  return (
    <View style={[{ gap: tagsInputRecipe.frame.gap }, style, layoutStyle]}>
      {/* fieldRecipe.disabledScope: label and frame fade by the field default (Web drew 0.6, this drew a
          literal 0.5 on the frame only until 2026-10-06); the description keeps full contrast. */}
      <Text variant="label" style={disabled ? { opacity: fieldRecipe.disabledOpacity } : undefined}>{label}</Text>
      <View
        style={{
          backgroundColor: resolveColorReference(tagsInputRecipe.frame.background, palette),
          minHeight: tagsInputRecipe.frame.minHeight,
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: tagsInputRecipe.frame.gap,
          padding: spacing.xs,
          borderWidth: 1,
          borderColor: border,
          borderRadius: tokens.radius.md,
          opacity: disabled ? fieldRecipe.disabledOpacity : 1,
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
              <FixedGlyph color={content}>×</FixedGlyph>
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
          // Return adds a tag and the next one follows, so keep the keyboard up.
          // The single-line default ("blurAndSubmit") closed it after every tag
          // (2026-09-30 audit). blurOnSubmit is deprecated in RN 0.81.
          submitBehavior="submit"
          {...inputText}
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
              style={{ minHeight: control.minTouchTarget, justifyContent: "center", paddingHorizontal: spacing.xs }}
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
