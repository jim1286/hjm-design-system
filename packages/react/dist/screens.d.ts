import { type DesignProfileScreenPresentation } from "@hjmds/design-contracts/design-profile-layout";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { type Ref, type ReactNode } from "react";
import { type MessageAttachmentDescriptor, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { type ListRowProps } from "./display.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ScreenLayoutProps = Readonly<{
    title: string;
    /** Preserve host navigation while the shared shell owns content and state. */
    header?: ReactNode;
    contentInset?: "default" | "none";
    /** Explicit layout wins over the nearest design profile. */
    presentation?: DesignProfileScreenPresentation;
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
    /**
     * Canonical layout-only placement on the screen root (for example `flex` or `width` in a split
     * view), matching Native ScreenLayout. Every screen built on ScreenLayout forwards it.
     */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Shared screen shell. Routing, data, permission checks and mutation state remain product-owned. */
export declare function ScreenLayout({ title, header, contentInset, presentation: suppliedPresentation, description, leading, actions, notice, footer, state, stateAction, children, scroll, as: Element, className, layoutStyle }: ScreenLayoutProps): import("react").JSX.Element;
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
    /** Release typing presence when the host input loses focus. */
    onBlur?: () => void;
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
    /** Canonical layout-only placement on the composer root. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function MessageComposer({ value, label, sendLabel, placeholder, description, error, invalid, submitMode, onBlur, disabled, pending, onValueChange, onSend, maxLength, sendDisabled, additionalContent, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation, attachmentAction, attachments, onRemoveAttachment, layoutStyle }: MessageComposerProps): import("react").JSX.Element;
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
    /** Canonical layout-only placement on the message row. The swipe offset still owns `transform`. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function ChatMessage({ direction, author, timestamp, timestampPresentation, bubbleTail, deliveryLabel, avatar, reply, actions, replyAction, replyLink, reactions, children, interactiveContent, layoutStyle }: ChatMessageProps): import("react").JSX.Element;
//# sourceMappingURL=screens.d.ts.map