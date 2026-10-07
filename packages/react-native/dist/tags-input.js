import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { removeTagAt, resolveTagsInputCommit, tagsInputRecipe, } from "@hjmds/design-contracts/components/tags-input";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Text } from "./primitives.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { useHjmNativeTheme } from "./provider.js";
import { resolveNativeFontStyle, resolveNativeTextScaleProps } from "./internal/styles.js";
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function TagsInput({ label, tags: controlledTags, defaultTags, onTagsChange, onReject, onDraftChange, policy, suggestions, suggestionsLabel, composeRemoveLabel, placeholder, description, disabled = false, layoutStyle, style, }) {
    warnDeprecatedStyleProps("TagsInput", { style }, "layoutStyle for placement; tagsInputRecipe owns appearance");
    const { palette, tokens, textScaling } = useHjmNativeTheme();
    const [internal, setInternal] = useState(defaultTags ?? []);
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
    const setTags = (next) => {
        if (controlledTags === undefined)
            setInternal(next);
        onTagsChange?.(next);
    };
    const changeDraft = (next) => { setDraft(next); onDraftChange?.(next); };
    const commit = (value) => {
        const result = resolveTagsInputCommit(tags, value, policy ?? {});
        if (!result.accepted) {
            onReject?.(result);
            return;
        }
        setTags([...tags, result.value]);
        changeDraft("");
    };
    // A suggestion row is a touch target, not a tag chip: tag.minHeight (28) left
    // these rows under 44 (2026-10-06 follow-up). Both renderers use the target role.
    return (_jsxs(View, { style: [{ gap: tagsInputRecipe.frame.gap }, style, layoutStyle], children: [_jsx(Text, { variant: "label", style: disabled ? { opacity: fieldRecipe.disabledOpacity } : undefined, children: label }), _jsxs(View, { style: {
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
                }, children: [tags.map((tag, index) => (_jsxs(View, { style: {
                            minHeight: tagsInputRecipe.tag.minHeight,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.xxs,
                            paddingHorizontal: spacing.xs,
                            borderRadius: 999,
                            backgroundColor: surface,
                        }, children: [_jsx(Text, { fontRole: "ui", style: { color: content }, children: tag }), _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: composeRemoveLabel(tag), disabled: disabled, hitSlop: tagsInputRecipe.remove.minTouchTarget / 2, onPress: () => setTags(removeTagAt(tags, index)), children: _jsx(FixedGlyph, { color: content, children: "\u00D7" }) })] }, `${tag}-${index}`))), _jsx(TextInput, { accessibilityLabel: label, editable: !disabled, placeholder: placeholder, value: draft, onChangeText: changeDraft, onSubmitEditing: () => commit(draft), submitBehavior: "submit", ...inputText })] }), suggestions !== undefined && suggestions.length > 0 && draft.trim().length > 0 ? (_jsx(View, { accessibilityLabel: suggestionsLabel, style: { gap: spacing.xxs }, children: suggestions.map((item) => (_jsx(Pressable, { accessibilityRole: "button", accessibilityState: { disabled: item.disabled === true }, disabled: item.disabled === true || disabled, onPress: () => commit(item.value ?? item.label), style: { minHeight: control.minTouchTarget, justifyContent: "center", paddingHorizontal: spacing.xs }, children: _jsx(Text, { fontRole: "ui", style: { color: content }, children: item.label }) }, item.id))) })) : null, description ? _jsx(Text, { tone: "muted", variant: "caption", children: description }) : null] }));
}
//# sourceMappingURL=tags-input.js.map