import { type TagsInputCommitKey, type TagsInputCommitResult, type TagsInputPolicy, type TagsInputSuggestion } from "@hjmds/design-contracts/components/tags-input";
export type TagsInputProps = Readonly<{
    label: string;
    tags?: readonly string[];
    defaultTags?: readonly string[];
    onTagsChange?: (tags: readonly string[]) => void;
    /** Fires when a value could not be committed, with the contract's reason. */
    onReject?: (result: TagsInputCommitResult) => void;
    /**
     * The text being typed. A product filtering `suggestions` cannot do it
     * without this — the draft lives here, not in the product's state.
     */
    onDraftChange?: (draft: string) => void;
    policy?: TagsInputPolicy;
    commitKeys?: readonly TagsInputCommitKey[];
    /** Composes one tag's remove-control name from the tag text. */
    composeRemoveLabel: (tag: string) => string;
    /**
     * Candidates for the current draft, already filtered by the product. Present
     * them and the field becomes the multi-select combobox case without a second
     * value shape.
     */
    suggestions?: readonly TagsInputSuggestion[];
    /** Localized accessible name for the candidate list. */
    suggestionsLabel?: string;
    placeholder?: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}>;
export declare const TagsInput: import("react").ForwardRefExoticComponent<Readonly<{
    label: string;
    tags?: readonly string[];
    defaultTags?: readonly string[];
    onTagsChange?: (tags: readonly string[]) => void;
    /** Fires when a value could not be committed, with the contract's reason. */
    onReject?: (result: TagsInputCommitResult) => void;
    /**
     * The text being typed. A product filtering `suggestions` cannot do it
     * without this — the draft lives here, not in the product's state.
     */
    onDraftChange?: (draft: string) => void;
    policy?: TagsInputPolicy;
    commitKeys?: readonly TagsInputCommitKey[];
    /** Composes one tag's remove-control name from the tag text. */
    composeRemoveLabel: (tag: string) => string;
    /**
     * Candidates for the current draft, already filtered by the product. Present
     * them and the field becomes the multi-select combobox case without a second
     * value shape.
     */
    suggestions?: readonly TagsInputSuggestion[];
    /** Localized accessible name for the candidate list. */
    suggestionsLabel?: string;
    placeholder?: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}> & import("react").RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=tags-input.d.ts.map