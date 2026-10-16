import { type ComposerLengthFeedback } from "@hjmds/design-contracts/communication";
import { type DesignProfileScreenPresentation } from "@hjmds/design-contracts/design-profile-layout";
import { type MessageMenuAction } from "./internal/message-reactions.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { type Ref, type ReactNode } from "react";
import { ScrollView, type TextInput, type ScrollViewProps } from "react-native";
import { type MessageAttachmentDescriptor, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { type ListRowProps } from "./data-display.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
/** Internal: lets ChatScreen narrow only the timeline gutter without a public spacing escape hatch. */
type ScreenLayoutPrivateProps = Readonly<{
    hjmBodyInlinePadding?: number;
    hjmTitleLeading?: ReactNode;
}>;
export type ScreenLayoutProps = Readonly<{
    title: string;
    /** The shared header owns badge placement; the product supplies its meaning and label. */
    titleBadge?: ReactNode;
    /** Hide redundant route names while retaining descriptions and a named screen. */
    titleVisibility?: "visible" | "hidden";
    headerAlignment?: "start" | "center";
    /** Host navigation can supply its existing header while the shared shell owns scrolling and state. */
    header?: ReactNode;
    /** Hosts that already inset routes avoid applying the shared gutter twice. */
    contentInset?: "default" | "none";
    /** Center a product prompt in the available body without inventing a query state. */
    contentAlignment?: "start" | "center";
    /** Keep a product wallpaper supplied by the outer host visible. */
    surface?: "default" | "transparent";
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
    /** Use content when the child is a FlatList/virtualized timeline. */
    scroll?: "screen" | "content";
    /** Host owns safe areas and navigation bars, avoiding double insets inside nested routes. */
    layoutStyle?: HjmCompositionStyleProp;
    testID?: string;
    scrollRef?: Ref<ScrollView>;
    scrollProps?: Pick<ScrollViewProps, "refreshControl" | "keyboardDismissMode" | "showsVerticalScrollIndicator" | "showsHorizontalScrollIndicator" | "onScroll" | "onScrollBeginDrag" | "onScrollEndDrag" | "scrollEventThrottle" | "alwaysBounceVertical" | "automaticallyAdjustKeyboardInsets">;
}>;
export declare function ScreenLayout({ title, titleBadge, titleVisibility, headerAlignment, header, contentInset, contentAlignment, surface, presentation: suppliedPresentation, description, leading, actions, notice, footer, state, stateAction, children, scroll, layoutStyle, testID, scrollRef, scrollProps, hjmBodyInlinePadding, hjmTitleLeading }: ScreenLayoutProps & ScreenLayoutPrivateProps): import("react").JSX.Element;
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
    /** Shown while the reader is away from the latest message; the host owns scroll position and visibility. */
    jumpToLatest?: Readonly<{
        label: string;
        icon: ReactNode;
        onPress(): void;
    }>;
    /** Peer or room photo beside the centered title; group rooms add the member count through `titleBadge`. */
    avatar?: ReactNode;
}>;
/** Wrap with existing KeyboardAvoiding (or the host's keyboard adapter), never both. */
export declare function ChatScreen({ composer, jumpToLatest, avatar, scroll, headerAlignment, ...props }: ChatScreenProps): import("react").JSX.Element;
export type MessageComposerProps = Omit<MessageComposerDescriptor, "attachmentCount"> & Readonly<{
    maxLength?: number;
    /** Opt-in count/ring appears only near the actual maxLength; never trims drafts. */
    lengthFeedback?: ComposerLengthFeedback;
    sendDisabled?: boolean;
    additionalContent?: boolean;
    leadingAction?: ReactNode;
    inputRef?: Ref<TextInput>;
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
}>;
export declare function MessageComposer({ value, label, sendLabel, placeholder, description, error, invalid, submitMode, onBlur, disabled, pending, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled, additionalContent, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation, attachmentAction, attachments, onRemoveAttachment }: MessageComposerProps): import("react").JSX.Element;
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
        icon?: ReactNode;
    }>;
    replyLink?: Readonly<{
        label: string;
        onPress(): void;
    }>; /** HJM-drawn quote ("X에게 답장" + one-line excerpt) heading the bubble; preferred over a custom `reply` node. */
    replyQuote?: Readonly<{
        title: string;
        excerpt: string;
    }>; /** Photos sent in the message. Products own the image source, viewer and upload; HJM owns the layout. */
    media?: readonly Readonly<{
        id: string;
        label: string;
        preview: ReactNode;
        aspectRatio?: number;
        onPress?(): void;
    }>[];
    reactions?: ReactionPickerProps & Readonly<{
        closeLabel: string;
        menuAction?: Readonly<{
            label: string;
            onPress(): void;
            disabled?: boolean;
        }>;
        menuActions?: readonly MessageMenuAction[];
        reportAction?: Readonly<{
            label: string;
            onPress(): void;
            disabled?: boolean;
            icon?: ReactNode;
        }>;
    }>;
}>;
export declare function ChatMessage({ direction, author, timestamp, timestampPresentation, bubbleTail, groupPosition, deliveryLabel, avatar, reply, replyQuote, media, actions, replyAction, replyLink, reactions, children, interactiveContent }: ChatMessageProps): import("react").JSX.Element;
/** Shared structure for embedded compositions. The parent supplies size; this never creates a second scroller. */
export type CompositionLayoutProps = Readonly<{
    title?: string;
    /** Document heading level; visual treatment remains the shared composition title. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    description?: string;
    badge?: ReactNode;
    leading?: ReactNode;
    actions?: ReactNode;
    notice?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    state?: ScreenContentState;
    stateAction?: ReactNode;
    /** Brand visual only; the shared state group owns copy, centering and announcement. */
    loadingIndicator?: ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function CompositionLayout({ title, headingLevel, description, badge, leading, actions, notice, children, footer, state, stateAction, loadingIndicator, layoutStyle }: CompositionLayoutProps): import("react").JSX.Element;
export type NotificationRowProps = Readonly<{
    /** Text and inline emphasis only; interactive content belongs outside the row. */
    preview: ReactNode;
    metadata: string;
    avatar: ReactNode;
    avatarBadge?: ReactNode;
    thumbnail?: ReactNode;
    unread?: boolean;
}>;
/** The host supplies navigation/disabled state and the complete accessible name. */
export declare function NotificationRow({ preview, metadata, avatar, avatarBadge, thumbnail, unread }: NotificationRowProps): import("react").JSX.Element;
export type IconTileProps = Readonly<{
    icon: ReactNode;
    label: string;
    overlay?: ReactNode;
    labelLines?: 1 | 2;
    ghost?: boolean;
}>;
/** Presentation shared by launcher and profile grids; the host owns navigation or drag behavior. */
export declare function IconTile({ icon, label, overlay, labelLines, ghost }: IconTileProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=screens.d.ts.map