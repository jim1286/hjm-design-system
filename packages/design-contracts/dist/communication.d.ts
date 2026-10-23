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
/** `role` is the product's localized role mark ("관리자"); `detail` is the secondary line (status, handle). */
export type ChatRoomMember = Readonly<{
    id: string;
    name: string;
    detail?: string;
    role?: string;
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
/** Per-member permitted actions behind one anchored menu. `label` names the menu for that member ("서연 관리"). */
export type ChatRoomMemberActions = Readonly<{
    label: (member: ChatRoomMember) => string;
    dismissLabel: string;
    items: (member: ChatRoomMember) => readonly ChatRoomConfirmation[];
}>;
/** Member search for create/invite. Without `onQueryChange` the list is filtered locally by name. */
export type ChatRoomMemberSearch = Readonly<{
    label: string;
    clearLabel: string;
    busyLabel: string;
    query?: string;
    onQueryChange?: (query: string) => void;
    searching?: boolean;
}>;
/** Labels for the selected-people strip and its count. */
export type ChatRoomSelectionLabels = Readonly<{
    count: (count: number) => string;
    remove: (member: ChatRoomMember) => string;
}>;
export declare function filterChatRoomMembers(members: readonly ChatRoomMember[], query: string): readonly ChatRoomMember[];
export declare function selectedChatRoomMembers(members: readonly ChatRoomMember[]): readonly ChatRoomMember[];
export declare function canSubmitChatRoom(profile: ChatRoomProfileValue, memberIds?: readonly string[]): boolean;
//# sourceMappingURL=communication.d.ts.map