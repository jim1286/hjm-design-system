import type { ReactionPickerProps } from "./reaction-picker.js";
import { type Ref, type ReactNode } from "react";
import { ScrollView, type TextInput, type ScrollViewProps } from "react-native";
import { type MessageAttachmentDescriptor, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { type ListRowProps } from "./data-display.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ScreenLayoutProps = Readonly<{
    title: string;
    /** Host navigation can supply its existing header while the shared shell owns scrolling and state. */
    header?: ReactNode;
    /** Hosts that already inset routes avoid applying the shared gutter twice. */
    contentInset?: "default" | "none";
    description?: string;
    leading?: ReactNode;
    actions?: ReactNode;
    notice?: ReactNode;
    footer?: ReactNode;
    state?: ScreenContentState;
    stateAction?: ReactNode;
    children?: ReactNode;
    /** Use content when the child is a FlatList/virtualized timeline. */
    scroll?: "screen" | "content";
    /** Host owns safe areas and navigation bars, avoiding double insets inside nested routes. */
    layoutStyle?: HjmCompositionStyleProp;
    testID?: string;
    scrollRef?: Ref<ScrollView>;
    scrollProps?: Pick<ScrollViewProps, "refreshControl" | "keyboardDismissMode" | "showsVerticalScrollIndicator" | "showsHorizontalScrollIndicator">;
}>;
export declare function ScreenLayout({ title, header, contentInset, description, leading, actions, notice, footer, state, stateAction, children, scroll, layoutStyle, testID, scrollRef, scrollProps }: ScreenLayoutProps): import("react").JSX.Element;
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
export type NotificationItemProps = Omit<ListRowProps, "description" | "selected" | "titleStyle"> & Readonly<{
    read: boolean;
    statusLabel: string;
    timestamp: string;
    description?: string;
}>;
export declare function NotificationItem({ read, statusLabel, timestamp, description, ...props }: NotificationItemProps): import("react").JSX.Element;
export type ChatScreenProps = Omit<ScreenLayoutProps, "footer"> & Readonly<{
    composer: ReactNode;
}>;
/** Wrap with existing KeyboardAvoiding (or the host's keyboard adapter), never both. */
export declare function ChatScreen({ composer, scroll, ...props }: ChatScreenProps): import("react").JSX.Element;
export type MessageComposerProps = Omit<MessageComposerDescriptor, "attachmentCount"> & Readonly<{
    maxLength?: number;
    sendDisabled?: boolean;
    additionalContent?: boolean;
    leadingAction?: ReactNode;
    inputRef?: Ref<TextInput>;
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