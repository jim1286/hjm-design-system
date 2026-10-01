export type ReactionOption = Readonly<{
    id: string;
    emoji: string;
    label: string;
    count?: number;
    disabled?: boolean;
}>;
export declare function validateReactions(options: readonly ReactionOption[], value: string | null): void;
export declare function nextReaction(options: readonly ReactionOption[], current: string | null, id: string): string | null;
//# sourceMappingURL=reactions.d.ts.map