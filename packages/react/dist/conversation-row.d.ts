import type { ReactNode } from "react";
export type ConversationRowProps = Readonly<{
    title: string;
    preview: string;
    metadata: string;
    avatar: ReactNode;
    unread?: boolean;
    avatarAction?: Readonly<{
        label: string;
        onPress(): void;
    }>;
    /** Router host for the body, separate from the member avatar destination. */
    renderBody?: (body: ReactNode) => ReactNode;
}>;
/** Presentation inside a router-owned link: the host supplies its full accessible name. */
export declare function ConversationRow({ title, preview, metadata, avatar, avatarAction, renderBody, unread }: ConversationRowProps): import("react").JSX.Element;
//# sourceMappingURL=conversation-row.d.ts.map