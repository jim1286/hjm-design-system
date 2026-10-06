import type { ReactionPickerProps } from "./reaction-picker.js";
import { type Ref, type ReactNode } from "react";
import { type MessageAttachmentDescriptor, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { type ListRowProps } from "./display.js";
export type ScreenLayoutProps = Readonly<{
    title: string;
    /** Preserve host navigation while the shared shell owns content and state. */
    header?: ReactNode;
    contentInset?: "default" | "none";
    description?: string;
    leading?: ReactNode;
    actions?: ReactNode;
    notice?: ReactNode;
    footer?: ReactNode;
    state?: ScreenContentState;
    stateAction?: ReactNode;
    children?: ReactNode;
    /** A virtualized list must own scrolling; never nest it inside a second scroll container. */
    scroll?: "screen" | "content";
    as?: "main" | "section";
    className?: string;
}>;
/** Shared screen shell. Routing, data, permission checks and mutation state remain product-owned. */
export declare function ScreenLayout({ title, header, contentInset, description, leading, actions, notice, footer, state, stateAction, children, scroll, as: Element, className }: ScreenLayoutProps): import("react").JSX.Element;
export type SettingsScreenSection = Readonly<{
    id: string;
    title: string;
    description?: string;
    children: ReactNode;
}>;
export type SettingsScreenProps = Omit<ScreenLayoutProps, "children" | "scroll"> & Readonly<{
    profile?: ReactNode;
    sections: readonly SettingsScreenSection[];
}>;
export declare function SettingsScreen({ profile, sections, ...props }: SettingsScreenProps): import("react").JSX.Element;
export type NotificationInboxScreenProps = Omit<ScreenLayoutProps, "children"> & Readonly<{
    filters?: ReactNode;
    children: ReactNode;
}>;
export declare function NotificationInboxScreen({ filters, children, notice, ...props }: NotificationInboxScreenProps): import("react").JSX.Element;
/** Read/unread is announced in localized copy as well as emphasis; rendering never marks an item read. */
export type NotificationItemProps = Omit<ListRowProps, "description" | "selected"> & Readonly<{
    read: boolean;
    statusLabel: string;
    timestamp: string;
    description?: ReactNode;
}>;
export declare function NotificationItem({ read, statusLabel, timestamp, description, title, className, ...props }: NotificationItemProps): import("react").JSX.Element;
export type ChatScreenProps = Omit<ScreenLayoutProps, "footer"> & Readonly<{
    composer: ReactNode;
}>;
/** Caller supplies a virtualized timeline and keyboard-aware composer; no implicit auto-scroll or send. */
export declare function ChatScreen({ composer, scroll, ...props }: ChatScreenProps): import("react").JSX.Element;
export type MessageComposerProps = Omit<MessageComposerDescriptor, "attachmentCount"> & Readonly<{
    maxLength?: number;
    sendDisabled?: boolean;
    additionalContent?: boolean;
    leadingAction?: ReactNode;
    inputRef?: Ref<HTMLTextAreaElement>;
    onValueChange(value: string): void;
    onSend(value: string): void;
    context?: ReactNode;
    replyTo?: Readonly<{
        author: string;
        excerpt: string;
        cancelLabel: string;
        onCancel(): void;
    }>;
    /** Icon mode puts the send/attachment action inside the growing field. */
    sendIcon?: ReactNode;
    /** Reference comment layout: a filled circular send action inside the field. */
    sendPresentation?: "inline" | "circle";
    attachmentAction?: Readonly<{
        label: string;
        icon: ReactNode;
        onPress(): void;
        disabled?: boolean;
    }>;
    attachments?: readonly (MessageAttachmentDescriptor & Readonly<{
        preview: ReactNode;
    }>)[];
    onRemoveAttachment?: (id: string) => void;
}>;
export declare function MessageComposer({ value, label, sendLabel, disabled, pending, onValueChange, onSend, maxLength, sendDisabled, additionalContent, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation, attachmentAction, attachments, onRemoveAttachment }: MessageComposerProps): import("react").JSX.Element;
export type ChatMessageProps = ChatMessageDescriptor & Readonly<{
    children: ReactNode;
    interactiveContent?: boolean;
    avatar?: ReactNode;
    reply?: ReactNode;
    actions?: ReactNode;
    replyAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    replyLink?: Readonly<{
        label: string;
        onPress(): void;
    }>;
    reactions?: ReactionPickerProps & Readonly<{
        closeLabel: string;
        menuAction?: Readonly<{
            label: string;
            onPress(): void;
            disabled?: boolean;
        }>;
    }>;
}>;
export declare function ChatMessage({ direction, author, timestamp, deliveryLabel, avatar, reply, actions, replyAction, replyLink, reactions, children, interactiveContent }: ChatMessageProps): import("react").JSX.Element;
//# sourceMappingURL=screens.d.ts.map