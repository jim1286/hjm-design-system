import { type ReactNode } from "react";
import type { CharacterCountOptions } from "@hjmds/design-contracts/character-count";
import { type ChatRoomProfileValue, type ChatRoomMember, type ChatRoomConfirmation, type ChatRoomMemberActions, type ChatRoomMemberSearch, type ChatRoomSelectionLabels } from "@hjmds/design-contracts/communication";
import { type ReplyTarget, type SearchResponse } from "@hjmds/design-contracts/communication";
import { type ChatMessageProps, type MessageComposerProps } from "./screens.js";
import { type SearchRecentQueries } from "./screen-flows.js";
export type ReplyMessageProps = Omit<ChatMessageProps, "replyAction" | "timestampPresentation"> & Readonly<{
    messageId: string;
    onReply: (messageId: string) => void;
    replyLabel: string;
    replyDisabled?: boolean;
    /** A drag has one owner: reply, or time reveal. Accessible reply stays available in either mode. */
    swipeAction?: "reply" | "timestamp";
}>;
export declare function ReplyMessage({ messageId, onReply, replyLabel, replyDisabled, swipeAction, ...message }: ReplyMessageProps): import("react").JSX.Element;
export type ReplyComposerProps = Omit<MessageComposerProps, "onSend" | "replyTo" | "pending" | "error"> & Readonly<{
    replyTarget: ReplyTarget | null;
    onReplyCancel: () => void;
    cancelReplyLabel: string;
    errorLabel: string;
    /** Resolve only after the actual send acknowledgement. The controlled draft is never cleared here. */
    onSend: (value: string, context: Readonly<{
        replyToId: string | null;
    }>) => void | Promise<void>;
}>;
export declare function ReplyComposer({ replyTarget, onReplyCancel, cancelReplyLabel, errorLabel, onSend, ...composer }: ReplyComposerProps): import("react").JSX.Element;
export type ExpandableSearchProps<T> = Readonly<{
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    query: string;
    onQueryChange: (query: string) => void;
    onSearch: (query: string, context: Readonly<{
        signal: AbortSignal;
    }>) => Promise<SearchResponse<T>>;
    renderResult: (result: T) => ReactNode;
    onSubmit?: (query: string) => void;
    recentQueries?: SearchRecentQueries;
    debounceMs?: number;
    disabled?: boolean;
    labels: Readonly<{
        title: string;
        open: string;
        cancel: string;
        query: string;
        clear: string;
        searching: string;
        error: string;
        commit: (query: string) => string;
        suggestionCount: (count: number) => string;
    }>;
}>;
export declare function ExpandableSearch<T>(props: ExpandableSearchProps<T>): import("react").JSX.Element;
type Exit = Readonly<{
    label: string;
    onPress: () => void;
}>;
export type ChatRoomProfileProps = Readonly<{
    value: ChatRoomProfileValue;
    onValueChange: (value: ChatRoomProfileValue) => void;
    onSave: (value: ChatRoomProfileValue) => void | Promise<void>;
    /** The product picks/uploads the image and returns its persistent URL; null means cancellation. */
    onPickPhoto?: () => Promise<string | null>;
    presentation?: "centered" | "inline";
    title: string;
    back?: Exit;
    /** Live count under the name field (KakaoTalk 0/20); the product owns the limit its server accepts and the locale. */
    nameCharacterCount?: CharacterCountOptions;
    disabled?: boolean;
    submitDisabled?: boolean;
    children?: ReactNode | ((disabled: boolean) => ReactNode);
    labels: Readonly<{
        name: string;
        description: string;
        photo: string;
        changePhoto: string;
        removePhoto: string;
        save: string;
        error: string;
        photoError: string;
    }>;
}>;
export declare function ChatRoomProfile({ value, onValueChange, onSave, onPickPhoto, disabled, submitDisabled, presentation, title, back, nameCharacterCount, children, labels }: ChatRoomProfileProps): import("react").JSX.Element;
export type ChatRoomMembersProps = Readonly<{
    members: readonly ChatRoomMember[];
    title: string;
    emptyLabel: string;
    /** Shown beside the title ("3"); the product formats it. */
    countLabel?: string;
    onSelectionChange?: (id: string, selected: boolean) => void;
    disabled?: boolean;
    /** Row above the list that opens the product's invite route (Telegram "Add Members"). Omit without permission. */
    invite?: Exit;
    /** Omit actions without permission. The product owns roles and server authorization. */
    renderActions?: (member: ChatRoomMember) => ReactNode;
    memberActions?: ChatRoomMemberActions;
    /** Ordinary member rows open the member profile; selection pickers keep their selection behavior. */
    memberProfile?: Readonly<{
        label(member: ChatRoomMember): string;
        onPress(member: ChatRoomMember): void;
    }>;
}>;
export declare function ChatRoomMembers({ members, title, emptyLabel, countLabel, onSelectionChange, disabled, invite, renderActions, memberActions, memberProfile }: ChatRoomMembersProps): import("react").JSX.Element;
export type ChatRoomCreateProps = Omit<ChatRoomProfileProps, "onSave" | "children" | "title" | "back" | "presentation"> & Readonly<{
    members: readonly ChatRoomMember[];
    onSelectionChange: (id: string, selected: boolean) => void;
    membersLabel: string;
    emptyMembersLabel: string;
    nextLabel: string;
    backLabel: string;
    title: string;
    search: ChatRoomMemberSearch;
    selection: ChatRoomSelectionLabels;
    onCancel?: () => void;
    onCreate: (value: ChatRoomProfileValue, memberIds: readonly string[]) => void | Promise<void>;
}>;
export declare function ChatRoomCreate({ members, onSelectionChange, membersLabel, emptyMembersLabel, onCreate, disabled, nextLabel, backLabel, title, search, selection, onCancel, ...profile }: ChatRoomCreateProps): import("react").JSX.Element;
export type ChatRoomActionsProps = Readonly<{
    /** Local history deletion and membership exit are deliberately separate actions. */
    leave?: ChatRoomConfirmation;
    deleteHistory?: ChatRoomConfirmation;
    deleteRoom?: ChatRoomConfirmation;
    disabled?: boolean;
}>;
export declare function ChatRoomActions({ leave, deleteHistory, deleteRoom, disabled }: ChatRoomActionsProps): import("react").JSX.Element | null;
/** `pressed` makes the tile a toggle (mute): its surface and the product icon show the current state. */
export type ChatRoomTool = Readonly<{
    id: string;
    label: string;
    icon?: ReactNode;
    pressed?: boolean;
    onPress: () => void | Promise<void>;
}>;
export type ChatRoomDetailsProps = Readonly<{
    profile: ChatRoomProfileValue;
    back?: Exit;
    photoLabel: string;
    memberCountLabel: string;
    edit?: Exit;
    /** Search, shared media, invite and notification settings use product-owned routes. */
    tools?: readonly ChatRoomTool[];
    members: ChatRoomMembersProps;
    actions?: ChatRoomActionsProps;
    errorLabel: string;
}>;
export declare function ChatRoomDetails({ profile, back, photoLabel, memberCountLabel, edit, tools, members, actions, errorLabel }: ChatRoomDetailsProps): import("react").JSX.Element;
export type ChatRoomInviteProps = Readonly<{
    members: readonly ChatRoomMember[];
    title: string;
    membersLabel: string;
    emptyLabel: string;
    onSelectionChange: (id: string, selected: boolean) => void;
    onInvite: (memberIds: readonly string[]) => void | Promise<void>;
    search: ChatRoomMemberSearch;
    selection: ChatRoomSelectionLabels;
    back?: Exit;
    confirmLabel: string;
    errorLabel: string;
    disabled?: boolean;
}>;
export declare function ChatRoomInvite({ members, title, membersLabel, emptyLabel, onSelectionChange, onInvite, search, selection, back, confirmLabel, errorLabel, disabled }: ChatRoomInviteProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=communication.d.ts.map