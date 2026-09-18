import {
  findActiveMentionTrigger,
  resolveMentionInsertion,
  type MentionMatch,
  type MentionTriggerConfig,
} from "@hjmds/design-contracts/components/mentions";
import { spacing } from "@hjmds/design-contracts/foundations";
import { useState, type ReactNode } from "react";
import { Pressable, View, type NativeSyntheticEvent, type StyleProp, type TextInputSelectionChangeEventData, type ViewStyle } from "react-native";
import { TextArea, type TextAreaProps } from "./inputs.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type MentionCandidate = Readonly<{
  id: string;
  label: string;
  /** Text inserted after the trigger character; defaults to `label`. */
  insertText?: string;
  description?: string;
}>;

export type MentionsProps<TriggerId extends string = string> =
  Omit<TextAreaProps, "value" | "defaultValue" | "onValueChange"> &
  Readonly<{
    value: string;
    onValueChange: (value: string) => void;
    triggers: readonly MentionTriggerConfig<TriggerId>[];
    /** Candidates for the active query; the product owns filtering and loading. */
    candidates: readonly MentionCandidate[];
    /** Fires whenever the active trigger match changes, including to null. */
    onMentionQueryChange?: (match: MentionMatch<TriggerId> | null) => void;
    /** Localized message shown when the list is open with no candidates. */
    emptyMessage: string;
    /** Localized accessible name for the candidate list. */
    listLabel: string;
    renderCandidate?: (candidate: MentionCandidate) => ReactNode;
    listStyle?: StyleProp<ViewStyle>;
  }>;

export function Mentions<TriggerId extends string = string>({
  value,
  onValueChange,
  triggers,
  candidates,
  onMentionQueryChange,
  emptyMessage,
  listLabel,
  renderCandidate,
  listStyle,
  ...textAreaProps
}: MentionsProps<TriggerId>) {
  const { colors } = useHjmNativeTheme();
  /*
    Native has no caret position on change — only `onSelectionChange` reports
    it. So the cursor is tracked separately and the contract's trigger search
    runs against it; guessing `value.length` would break every edit that is not
    at the end of the text.
  */
  const [caret, setCaret] = useState(value.length);
  const match = findActiveMentionTrigger(value, Math.min(caret, value.length), triggers);
  const [lastMatchKey, setLastMatchKey] = useState<string | null>(null);
  const matchKey = match === null ? null : `${String(match.triggerId)}:${match.query}:${match.triggerStart}`;
  if (matchKey !== lastMatchKey) {
    setLastMatchKey(matchKey);
    onMentionQueryChange?.(match);
  }

  const insert = (candidate: MentionCandidate) => {
    if (match === null) return;
    const next = resolveMentionInsertion(value, match, Math.min(caret, value.length), candidate.insertText ?? candidate.label);
    onValueChange(next.text);
    // The caret belongs after the inserted text; without this the next
    // keystroke reopens the list on the mention just committed.
    setCaret(next.cursorPosition);
  };

  return (
    <View style={{ gap: spacing.xs }}>
      {/*
        The cast keeps TextArea's label/accessibilityLabel union intact: a
        spread widens it to "both optional", which the union rejects. The
        forwarded props are exactly TextArea's own, minus the value axis.
      */}
      <TextArea
        {...({
          ...textAreaProps,
          value,
          onValueChange,
          onSelectionChange: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
            setCaret(event.nativeEvent.selection.end),
        } as TextAreaProps)}
      />
      {match !== null ? (
        <View
          accessibilityLabel={listLabel}
          style={[{ gap: spacing.xxs, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.xxs }, listStyle]}
        >
          {candidates.length === 0 ? (
            <Text tone="muted" variant="caption">{emptyMessage}</Text>
          ) : (
            candidates.map((candidate) => (
              <Pressable
                key={candidate.id}
                accessibilityRole="button"
                onPress={() => insert(candidate)}
                style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.xs }}
              >
                {renderCandidate?.(candidate) ?? <Text>{candidate.label}</Text>}
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}
