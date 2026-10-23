export type ComposerLengthFeedback = Readonly<{
    label: string;
    formatCount: (used: number, max: number) => string;
    threshold?: number;
}>;
/** Match the controlled text/maxLength UTF-16 unit; do not silently trim a user's draft. */
export declare function resolveComposerLimit(value: string, max: number, threshold?: number): {
    used: number;
    max: number;
    near: boolean;
    exceeded: boolean;
};
export type ReplyTarget = Readonly<{
    id: string;
    author: string;
    excerpt: string;
}>;
export declare function validateReplyTarget(target: ReplyTarget | null): void;
export type SearchResponse<T> = Readonly<{
    result: T;
    suggestions: readonly Readonly<{
        query: string;
        match?: Readonly<{
            start: number;
            end: number;
        }>;
    }>[];
}>;
/** Room data stays controlled: only the product can acknowledge persistence or grant permissions. */
export type ChatRoomProfileValue = Readonly<{
    name: string;
    description: string;
    photoUrl: string | null;
}>;
export type ChatRoomMember = Readonly<{
    id: string;
    name: string;
    detail?: string;
    photoUrl?: string;
    selected?: boolean;
    disabled?: boolean;
}>;
export type ChatRoomConfirmation = Readonly<{
    destructive?: boolean;
    label: string;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    errorLabel: string;
    onConfirm: () => void | Promise<void>;
}>;
export declare function canSubmitChatRoom(profile: ChatRoomProfileValue, memberIds?: readonly string[]): boolean;
//# sourceMappingURL=communication.d.ts.map