import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { assertNoRemovedStyleProps } from "./internal/diagnostics.js";
import { findActiveMentionTrigger, resolveMentionInsertion, } from "@hjmds/design-contracts/components/mentions";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import { comboboxRecipe } from "@hjmds/design-contracts/recipes";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { TextArea } from "./inputs.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Mentions({ value, onValueChange, triggers, candidates, onMentionQueryChange, emptyMessage, listLabel, renderCandidate, ...textAreaProps }) {
    assertNoRemovedStyleProps("Mentions", textAreaProps, ["listStyle"]);
    const { colors, tokens } = useHjmNativeTheme();
    /*
      Native has no caret position on change — only `onSelectionChange` reports
      it. So the cursor is tracked separately and the contract's trigger search
      runs against it; guessing `value.length` would break every edit that is not
      at the end of the text.
    */
    const [caret, setCaret] = useState(value.length);
    const unavailable = textAreaProps.disabled || textAreaProps.readOnly || textAreaProps.editable === false || textAreaProps.busy;
    const match = unavailable ? null : findActiveMentionTrigger(value, Math.min(caret, value.length), triggers);
    const matchKey = match === null ? null : `${String(match.triggerId)}:${match.query}:${match.triggerStart}`;
    const matchRef = useRef(match);
    matchRef.current = match;
    const lastNotifiedMatchKey = useRef(null);
    const onMentionQueryChangeRef = useRef(onMentionQueryChange);
    onMentionQueryChangeRef.current = onMentionQueryChange;
    // A query callback commonly filters candidates in the parent; defer it until commit so that
    // this renderer does not update another component during its own render.
    useEffect(() => {
        if (matchKey === lastNotifiedMatchKey.current)
            return;
        lastNotifiedMatchKey.current = matchKey;
        onMentionQueryChangeRef.current?.(matchRef.current);
    }, [matchKey]);
    const insert = (candidate) => {
        if (match === null)
            return;
        const next = resolveMentionInsertion(value, match, Math.min(caret, value.length), candidate.insertText ?? candidate.label);
        onValueChange(next.text);
        // The caret belongs after the inserted text; without this the next
        // keystroke reopens the list on the mention just committed.
        setCaret(next.cursorPosition);
    };
    return (_jsxs(View, { style: { gap: spacing.xs }, children: [_jsx(TextArea, { ...{
                    ...textAreaProps,
                    value,
                    onValueChange,
                    onSelectionChange: (event) => {
                        setCaret(event.nativeEvent.selection.end);
                        textAreaProps.onSelectionChange?.(event);
                    },
                } }), match !== null ? (_jsx(View, { accessibilityLabel: listLabel, accessibilityRole: "list", 
                // Same popover surface as Combobox (mentions.ts): padding and radius from comboboxRecipe.popover, 8 and md.
                // Until 2026-10-06 the padding was 4 while the Web list and the recipe moved to 8.
                style: [{ gap: spacing.xxs, borderWidth: comboboxRecipe.popover.borderWidth, borderColor: colors.border, borderRadius: tokens.radius[comboboxRecipe.popover.radius], padding: comboboxRecipe.popover.padding }], children: candidates.length === 0 ? (_jsx(Text, { tone: "muted", variant: "caption", children: emptyMessage })) : (candidates.map((candidate) => (_jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: candidate.label, onPress: () => insert(candidate), style: { minHeight: control.minTouchTarget, justifyContent: "center", paddingHorizontal: spacing.xs }, children: renderCandidate?.(candidate) ?? _jsx(Text, { fontRole: "ui", children: candidate.label }) }, candidate.id)))) })) : null] }));
}
//# sourceMappingURL=mentions.js.map