import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { findActiveMentionTrigger, resolveMentionInsertion, } from "@hjmds/design-contracts/components/mentions";
import { spacing } from "@hjmds/design-contracts/foundations";
import { comboboxRecipe } from "@hjmds/design-contracts/recipes";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { TextArea } from "./inputs.js";
import { Text } from "./primitives.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { useHjmNativeTheme } from "./provider.js";
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Mentions({ value, onValueChange, triggers, candidates, onMentionQueryChange, emptyMessage, listLabel, renderCandidate, listStyle, ...textAreaProps }) {
    const { colors, tokens } = useHjmNativeTheme();
    warnDeprecatedStyleProps("Mentions", { listStyle }, "layoutStyle for placement; the candidate list owns its appearance");
    /*
      Native has no caret position on change — only `onSelectionChange` reports
      it. So the cursor is tracked separately and the contract's trigger search
      runs against it; guessing `value.length` would break every edit that is not
      at the end of the text.
    */
    const [caret, setCaret] = useState(value.length);
    const match = findActiveMentionTrigger(value, Math.min(caret, value.length), triggers);
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
                    onSelectionChange: (event) => setCaret(event.nativeEvent.selection.end),
                } }), match !== null ? (_jsx(View, { accessibilityLabel: listLabel, accessibilityRole: "list", 
                // Same popover surface as Combobox (mentions.ts): padding and radius from comboboxRecipe.popover, 8 and md.
                // Until 2026-10-06 the padding was 4 while the Web list and the recipe moved to 8.
                style: [{ gap: spacing.xxs, borderWidth: comboboxRecipe.popover.borderWidth, borderColor: colors.border, borderRadius: tokens.radius[comboboxRecipe.popover.radius], padding: comboboxRecipe.popover.padding }, listStyle], children: candidates.length === 0 ? (_jsx(Text, { tone: "muted", variant: "caption", children: emptyMessage })) : (candidates.map((candidate) => (_jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: candidate.label, onPress: () => insert(candidate), style: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.xs }, children: renderCandidate?.(candidate) ?? _jsx(Text, { fontRole: "ui", children: candidate.label }) }, candidate.id)))) })) : null] }));
}
//# sourceMappingURL=mentions.js.map