import { type TagsInputCommitResult, type TagsInputPolicy, type TagsInputSuggestion } from "@hjmds/design-contracts/components/tags-input";
import { type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
export declare function TagsInput({ label, tags: controlledTags, defaultTags, onTagsChange, onReject, onDraftChange, policy, suggestions, suggestionsLabel, composeRemoveLabel, placeholder, description, disabled, layoutStyle, style, }: TagsInputProps): import("react").JSX.Element;
//# sourceMappingURL=tags-input.d.ts.map