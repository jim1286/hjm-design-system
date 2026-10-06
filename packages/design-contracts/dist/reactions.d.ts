export type ReactionOption = Readonly<{
    id: string;
    emoji: string;
    label: string;
    count?: number;
    disabled?: boolean;
}>;
export declare function validateReactions(options: readonly ReactionOption[], value: string | null): void;
export declare function nextReaction(options: readonly ReactionOption[], current: string | null, id: string): string | null;
/** The expanded catalog is product-localized; quick and additional IDs stay unique. */
export type ReactionMoreOptions = Readonly<{
    label: string;
    options: readonly ReactionOption[];
}>;
export declare function resolveReactionOptions(options: readonly ReactionOption[], more?: ReactionMoreOptions): readonly ReactionOption[];
//# sourceMappingURL=reactions.d.ts.map