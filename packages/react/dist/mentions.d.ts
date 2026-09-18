import { type MentionMatch, type MentionTriggerConfig } from "@hjmds/design-contracts/components/mentions";
import { type ReactNode } from "react";
import { type TextAreaProps } from "./forms.js";
export type MentionCandidate = Readonly<{
    id: string;
    label: string;
    /** Text inserted after the trigger character; defaults to `label`. */
    insertText?: string;
    description?: string;
}>;
export type MentionsProps<TriggerId extends string = string> = Omit<TextAreaProps, "value" | "defaultValue" | "onChange" | "children"> & Readonly<{
    value: string;
    onValueChange: (value: string) => void;
    triggers: readonly MentionTriggerConfig<TriggerId>[];
    /** Candidates for the active query; the product owns filtering and loading. */
    candidates: readonly MentionCandidate[];
    /** Fires whenever the active trigger match changes, including to null. */
    onMentionQueryChange?: (match: MentionMatch<TriggerId> | null) => void;
    /** Localized message shown when the popup is open with no candidates. */
    emptyMessage: string;
    /** Localized accessible name for the candidate list. */
    listLabel: string;
    renderCandidate?: (candidate: MentionCandidate) => ReactNode;
}>;
export declare const Mentions: <TriggerId extends string = string>(props: MentionsProps<TriggerId> & {
    ref?: React.Ref<HTMLTextAreaElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=mentions.d.ts.map