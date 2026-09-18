import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { findActiveMentionTrigger, resolveMentionInsertion, } from "@hjmds/design-contracts/components/mentions";
import { spacing } from "@hjmds/design-contracts/foundations";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { TextArea } from "./inputs.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Mentions({ value, onValueChange, triggers, candidates, onMentionQueryChange, emptyMessage, listLabel, renderCandidate, listStyle, ...textAreaProps }) {
    const { colors } = useHjmNativeTheme();
    /*
      Native has no caret position on change — only `onSelectionChange` reports
      it. So the cursor is tracked separately and the contract's trigger search
      runs against it; guessing `value.length` would break every edit that is not
      at the end of the text.
    */
    const [caret, setCaret] = useState(value.length);
    const match = findActiveMentionTrigger(value, Math.min(caret, value.length), triggers);
    const [lastMatchKey, setLastMatchKey] = useState(null);
    const matchKey = match === null ? null : `${String(match.triggerId)}:${match.query}:${match.triggerStart}`;
    if (matchKey !== lastMatchKey) {
        setLastMatchKey(matchKey);
        onMentionQueryChange?.(match);
    }
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
                } }), match !== null ? (_jsx(View, { accessibilityLabel: listLabel, style: [{ gap: spacing.xxs, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.xxs }, listStyle], children: candidates.length === 0 ? (_jsx(Text, { tone: "muted", variant: "caption", children: emptyMessage })) : (candidates.map((candidate) => (_jsx(Pressable, { accessibilityRole: "button", onPress: () => insert(candidate), style: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.xs }, children: renderCandidate?.(candidate) ?? _jsx(Text, { children: candidate.label }) }, candidate.id)))) })) : null] }));
}
//# sourceMappingURL=mentions.js.map