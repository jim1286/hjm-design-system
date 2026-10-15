import { type ReactNode } from "react";
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
//# sourceMappingURL=communication.d.ts.map