import { type MentionMatch, type MentionTriggerConfig } from "@hjmds/design-contracts/components/mentions";
import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type TextAreaProps } from "./inputs.js";
export type MentionCandidate = Readonly<{
    id: string;
    label: string;
    /** Text inserted after the trigger character; defaults to `label`. */
    insertText?: string;
    description?: string;
}>;
export type MentionsProps<TriggerId extends string = string> = Omit<TextAreaProps, "value" | "defaultValue" | "onValueChange"> & Readonly<{
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
export declare function Mentions<TriggerId extends string = string>({ value, onValueChange, triggers, candidates, onMentionQueryChange, emptyMessage, listLabel, renderCandidate, listStyle, ...textAreaProps }: MentionsProps<TriggerId>): import("react").JSX.Element;
//# sourceMappingURL=mentions.d.ts.map