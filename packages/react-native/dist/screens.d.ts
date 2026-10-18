import { type IconTileArtwork, type IconTileFrame, type IconTileShape, type IconTileSize } from "@hjmds/design-contracts/screen-patterns";
import { type ComposerLengthFeedback } from "@hjmds/design-contracts/communication";
import { type DesignProfileScreenPresentation } from "@hjmds/design-contracts/design-profile-layout";
import { type MessageMenuAction } from "./internal/message-reactions.js";
import { type MediaAlbum } from "./internal/media-album.js";
export type { MediaAlbum, MediaAlbumPageStatusProps } from "./internal/media-album.js";
export { MediaAlbumPageStatus } from "./internal/media-album.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { type Ref, type ReactNode } from "react";
import { ScrollView, type TextInput, type ScrollViewProps } from "react-native";
import { type ScreenExit } from "./internal/screen-exit.js";
import { type MessageAttachmentDescriptor, type ChatReactionSummary, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState, type ScreenContentInset, type ScreenInitialFocus } from "@hjmds/design-contracts/screen-patterns";
import { type ListRowProps } from "./data-display.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
/** Internal: lets ChatScreen narrow only the timeline gutter without a public spacing escape hatch. */
type ScreenLayoutPrivateProps = Readonly<{
    hjmBodyInlinePadding?: number;
}>;
export type ScreenLayoutProps = Readonly<{
    title: string;
    /** The shared header owns badge placement; the product supplies its meaning and label. */
    titleBadge?: ReactNode;
    /**
     * Identity mark or artwork before the title (team logo, tool artwork). Decorative: the title stays the header and
     * the accessible name. With `titleVisibility="hidden"` the mark stands alone in the title slot as the header,
     * named by `title` (2026-10-18: yajalal team detail and Utilverse tool headers rebuilt the header to get this).
     */
    titleLeading?: ReactNode;
    /** Hide redundant route names while retaining a named screen. */
    titleVisibility?: "visible" | "hidden";
    /** Centered by default (2026-10-17 user rule); `start` remains available. Extra actions sit at the trailing edge. */
    headerAlignment?: "start" | "center";
    /** Host navigation can supply its existing header while the shared shell owns scrolling and state. */
    header?: ReactNode;
    /**
     * Hosts that already inset routes avoid applying the shared gutter twice (`none`). `body-edge` keeps the header,
     * notice and footer gutter and drops only the body's horizontal padding so full-width list rows own their inset.
     * `body-bleed` keeps the same gutters and drops every body padding, so a map or canvas runs edge to edge.
     */
    contentInset?: ScreenContentInset;
    /** Center a product prompt in the available body without inventing a query state. */
    contentAlignment?: "start" | "center";
    /** Keep a product wallpaper supplied by the outer host visible. */
    surface?: "default" | "transparent";
    /** Explicit layout wins over the nearest design profile. */
    presentation?: DesignProfileScreenPresentation;
    /** @deprecated Screen headers no longer show supporting copy (2026-10-18). Move required guidance into body content. Retained until the next major API cleanup. */
    description?: string;
    /**
     * Leaving this screen (back, close, settings exit): icon-only button fixed at the header's leading edge.
     * The leading edge has no free slot (2026-10-17): every product use was a hand-made back button.
     */
    exit?: ScreenExit;
    actions?: ReactNode;
    notice?: ReactNode;
    footer?: ReactNode;
    state?: ScreenContentState;
    stateAction?: ReactNode;
    /** Brand visual for `state.kind === "loading"`; the shared state group keeps copy, centering and announcement (as CompositionLayout). */
    loadingIndicator?: ReactNode;
    children?: ReactNode;
    /** Use content when the child is a FlatList/virtualized timeline. */
    scroll?: "screen" | "content";
    /** Host owns safe areas and navigation bars, avoiding double insets inside nested routes. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * Bottom safe-area inset of the window edge this screen reaches (`useSafeAreaInsets().bottom`; 0 above a tab bar
     * or inside a host that already insets the bottom). The footer — or the body when there is none — pads
     * max(16, inset) instead of the host's inset plus 16, matching Web's `max(padding, env(safe-area-inset-bottom))`
     * (2026-10-17 user report: too much space below buttons). Pass it instead of a bottom SafeAreaView edge, never both.
     */
    safeAreaBottom?: number;
    testID?: string;
    scrollRef?: Ref<ScrollView>;
    /**
     * Keeps the footer and focused field above the keyboard (default on, 2026-10-16 keyboard audit).
     * Skipped inside KeyboardAvoiding or a keyboard-aware Sheet/Dialog, which already handle it.
     */
    keyboardAvoidance?: boolean;
    /**
     * Focus the marked, else first enabled input once on page entry (default `first-input`). Never steals an existing
     * input's focus or focuses below an overlay. A pending entry can wait for data; after user interaction it ends.
     * Bottom sheets disable automatic focus for this screen and all nested inputs, regardless of this prop.
     */
    initialFocus?: ScreenInitialFocus;
    scrollProps?: Pick<ScrollViewProps, "refreshControl" | "keyboardDismissMode" | "showsVerticalScrollIndicator" | "showsHorizontalScrollIndicator" | "onScroll" | "onScrollBeginDrag" | "onScrollEndDrag" | "scrollEventThrottle" | "alwaysBounceVertical" | "automaticallyAdjustKeyboardInsets">;
}>;
export declare function ScreenLayout({ title, titleBadge, titleLeading, titleVisibility, headerAlignment, header, contentInset, contentAlignment, surface, presentation: suppliedPresentation, exit, actions, notice, footer, state, stateAction, loadingIndicator, children, scroll, layoutStyle, testID, scrollRef, scrollProps, keyboardAvoidance, safeAreaBottom, initialFocus, hjmBodyInlinePadding }: ScreenLayoutProps & ScreenLayoutPrivateProps): import("react").JSX.Element;
/**
 * Styles for a product scroller that owns the body with `scroll="content"` (FlatList, SectionList): `style` reaches
 * across the ScreenLayout body gutter and `contentContainerStyle` pads it back, so items stay on the gutter while the
 * clip moves to the screen edges. A bleeding CollectionRail inside then scrolls edge to edge instead of being cut by
 * the list (spint home re-added a gutter per section under `body-edge` to get one edge-to-edge rail, 2026-10-17).
 * Outside a ScreenLayout body it returns zero room.
 */
export declare function useScreenBodyScrollRoom(): {
    style: {
        marginHorizontal: number;
    };
    contentContainerStyle: {
        paddingHorizontal: number;
    };
};
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
export type ChatScreenProps = Omit<ScreenLayoutProps, "footer" | "titleLeading"> & Readonly<{
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
export declare function ChatScreen({ composer, jumpToLatest, avatar, scroll, ...props }: ChatScreenProps): import("react").JSX.Element;
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
    /** Emoji row above the input; a tap appends the emoji to the draft (measured comment sheet, 2026-10-16). */
    /** Outside the field, beside the input row (e.g. the writer's avatar); the quick-insert row stays full width. */
    leading?: ReactNode;
    quickInserts?: Readonly<{
        label: string;
        items: readonly Readonly<{
            id: string;
            emoji: string;
            label: string;
        }>[];
    }>;
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
export declare function MessageComposer({ leading, quickInserts, value, label, sendLabel, placeholder, description, error, invalid, submitMode, onBlur, disabled, pending, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled, additionalContent, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation, attachmentAction, attachments, onRemoveAttachment }: MessageComposerProps): import("react").JSX.Element;
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
    }>; /** HJM-drawn quote ("Replying to X" + one-line excerpt) heading the bubble; preferred over a custom `reply` node. */
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
        summary?: ChatMessageReactionSummary;
    }>;
}> & Readonly<{
    /**
     * Paged alternative to `media` (2026-10-18, Utilverse): HJM mounts only the shown photo, so a product that authorizes
     * each image fetches one page at a time. Exclusive with `media` (validated at render): one message has one photo set.
     */
    mediaAlbum?: MediaAlbum;
}>;
/**
 * Current reactions drawn beside the time as one button that opens the same hold menu (2026-10-18 BurnTok DM, which
 * showed counts as status tags because the menu could not be opened from outside). Counts and the localized
 * accessible name ("Reactions: heart 2. Open menu") come from the product; `items` in display order.
 */
export type ChatMessageReactionSummary = ChatReactionSummary;
export declare function ChatMessage({ direction, author, timestamp, timestampPresentation, bubbleTail, groupPosition, deliveryLabel, avatar, reply, replyQuote, media, mediaAlbum, actions, replyAction, replyLink, reactions, children, interactiveContent }: ChatMessageProps): import("react").JSX.Element;
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
    /**
     * Icon artwork. A function receives the rendered edge (`IconTileArtwork`) so fixed-size artwork such as an image
     * sizes itself to a `size="fill"` icon without the product re-computing the cell clamp.
     */
    icon: ReactNode | ((artwork: IconTileArtwork) => ReactNode);
    label: string;
    overlay?: ReactNode;
    labelLines?: 1 | 2;
    ghost?: boolean;
    /** `none`: the icon is complete product artwork, so no frame fill or hairline is drawn. */
    frame?: IconTileFrame;
    /** Frame (and ghost outline) corner shape from the product's icon theme. */
    shape?: IconTileShape;
    /** `fill`: the icon spans the grid cell between iconTileRecipe.fillMinSize and fillMaxSize. */
    size?: IconTileSize;
}>;
/** Presentation shared by launcher and profile grids; the host owns navigation or drag behavior. */
export declare function IconTile({ icon, label, overlay, labelLines, ghost, frame, shape, size }: IconTileProps): import("react").JSX.Element;
export type TypingIndicatorProps = Readonly<{
    /** Localized status read by assistive tech ("Seoyeon is typing"); the visible row shows only the dots. */
    label: string;
    /** Typer's photo in a group room, sized like ChatMessage avatars (`chatMessageRecipe.avatarSize`). */
    avatar?: ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Incoming "is typing" row for a ChatScreen timeline (2026-10-18 BurnTok DM drew its own). The host shows it only while
 * presence says someone is typing and places it after the last message; HJM owns the bubble, dots and announcement.
 */
export declare function TypingIndicator({ label, avatar, layoutStyle }: TypingIndicatorProps): import("react").JSX.Element;
export type ChatDateSeparatorProps = Readonly<{
    /** Product-formatted date or time ("Today", "Oct 18", "3:04 PM"). */
    label: string;
    /** Machine-readable value for the Web `<time>` element; Native ignores it. */
    dateTime?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Centered date (or time) row between ChatScreen timeline groups (2026-10-18 Utilverse chat drew a caption). Grouping
 * rules stay with the product; the next message keeps its own group gap, so this row adds only the space before it.
 */
export declare function ChatDateSeparator({ label, layoutStyle }: ChatDateSeparatorProps): import("react").JSX.Element;
//# sourceMappingURL=screens.d.ts.map