import { type ReactNode } from "react";
import { type ScreenLayoutProps } from "./screens.js";
import { type MessageMenuAction } from "./internal/message-reactions.js";
import { type MediaAlbum } from "./internal/media-album.js";
export type { MediaAlbum } from "./internal/media-album.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { type SheetProps } from "./overlays.js";
import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import { type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { profileSummaryRecipe, type CommentMenuItemDescriptor, type SearchFiltersRole, type PermissionScreenStatus, type PhotoSource, type PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { type ContainerGutter } from "@hjmds/design-contracts/components/container";
/** Copy, pending state and mutations are controlled by the consuming product. */
/** `icon` renders an icon-only button named by `label`; header actions (top-right) use it so a centered title keeps its width (2026-10-17). */
export type ScreenFlowAction = Readonly<{
    label: string;
    onAction(): void;
    disabled?: boolean;
    pending?: boolean;
    icon?: ReactNode;
}>;
/** Header tool action (refresh, add): icon-only so it never pushes the centered title. A required text `add` made
 * products route exits (a "Cancel" label) through it as a header text button (2026-10-17 screen review); exits use `exit`. */
export type ScreenFlowIconAction = ScreenFlowAction & Readonly<{
    icon: ReactNode;
}>;
type Base = Omit<ScreenLayoutProps, "children" | "footer">;
export type ListDetailScreenProps = Base & {
    footer?: ScreenLayoutProps["footer"];
    list: ReactNode;
    detail?: Pick<ScreenLayoutProps, "title" | "state" | "stateAction" | "notice" | "titleVisibility" | "headerAlignment" | "actions" | "footer"> & {
        content: ReactNode;
    };
    back: ScreenFlowAction;
    refresh?: ScreenFlowIconAction;
    loadMore?: ScreenFlowAction;
};
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state. */
export declare function ListDetailScreen({ list, detail, back, refresh, loadMore, layoutStyle, ...screen }: ListDetailScreenProps): import("react").JSX.Element;
export type EditorScreenProps = Omit<Base, "leading" | "exit"> & {
    children: ReactNode;
    submitPlacement?: "header" | "footer";
    dirty: boolean;
    submit: ScreenFlowAction;
    cancel: ScreenFlowAction;
    discard: Omit<Extract<AlertDialogRequest, {
        mode: "confirm";
    }>, "onConfirm" | "fallbackErrorMessage"> & {
        fallbackErrorMessage: string;
    };
    draftStatus?: ReactNode;
    /** Multi-step editor: while supplied, the header exit is a back chevron that returns to the previous step instead of
     * the cancel ×, and never opens the discard prompt (stepping back keeps the draft). Omit it on the first step so the
     * exit leaves through `cancel` again (2026-10-18: spint compose replaced the header with its own TopBar for this). */
    stepBack?: ScreenFlowAction;
};
export declare function EditorScreen({ children, dirty, submitPlacement, submit, cancel, discard, draftStatus, stepBack, initialFocus, ...screen }: EditorScreenProps): import("react").JSX.Element;
export type ProfileScreenProps = Base & {
    summary: ReactNode;
    /** Optional since 2026-10-25: when the profile photo itself is the edit (portfolio rule "tap my photo to change it"), a
     * separate edit button would duplicate it. Products still pass one for other edits or a guest sign-in action. */
    edit?: ScreenFlowAction;
    children?: ReactNode;
    accountActions?: ReactNode;
    /** `below-summary` (default): ghost button under the summary. `summary`: the edit action goes first in the action row
     * of the ProfileSummary inside `summary` (2026-10-15 utilverse account decision: the edit action belongs inside the
     * profile card). With `summary`, the slot must contain a ProfileSummary, or the edit action is not drawn. */
    editPlacement?: "below-summary" | "summary";
};
export declare function ProfileScreen({ summary, edit, children, accountActions, editPlacement, ...screen }: ProfileScreenProps): import("react").JSX.Element;
/** Operator decision on a report (dismiss, hide, uphold, overturn…). Labels are product copy; ids are product keys.
 * With `confirmation`, pressing opens that AlertDialog and only its `onConfirm` acts (same rule as `block`). */
export type ModerationDecision = ScreenFlowAction & Readonly<{
    id: string;
    tone?: "primary" | "secondary" | "danger";
    confirmation?: Extract<AlertDialogRequest, {
        mode: "confirm";
    }>;
}>;
/** Free-text decision reason. `required` (default true) keeps every decision locked until it has non-blank text. */
export type ModerationDecisionReason = Readonly<{
    label: string;
    value: string;
    onValueChange(value: string): void;
    description?: string;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
}>;
type ModerationReportFields = {
    variant?: "report";
    reasonPicker?: ReactNode;
    reasons: readonly {
        value: string;
        label: string;
    }[];
    reason: string | null;
    onReasonChange(value: string): void;
    reasonLabel: string;
    children?: ReactNode;
    submit: ScreenFlowAction;
    block?: {
        action: ScreenFlowAction;
        confirmation: Extract<AlertDialogRequest, {
            mode: "confirm";
        }>;
    };
};
/** Operator review (2026-10-18: utilverse review and appeal queues hand-built this with TextArea, buttons and Alert):
 * `children` shows the reported content, then the reason field and the decisions; `resolution` replaces both once decided. */
type ModerationReviewFields = {
    variant: "review";
    children?: ReactNode;
    decisionReason: ModerationDecisionReason;
    decisions: readonly ModerationDecision[];
    resolution?: ReactNode;
};
export type ModerationFields = ModerationReportFields | ModerationReviewFields;
export type ModerationScreenProps = Base & ModerationFields;
export declare function ModerationScreen(props: ModerationScreenProps): import("react").JSX.Element;
/** The moderation fields and actions without screen chrome, for a report opened inside a letter, card or Sheet
 * (2026-10-18: diairy turned ModerationScreen's header and padding off to place it in a letter). The host owns the
 * surrounding surface and placement; `title` is an optional section heading (omit it inside a titled Sheet) and
 * `cancel` adds a ghost "collapse" action after the others.
 * `description` and `actions` fill the same CompositionLayout header (2026-10-18: utilverse review queues wrapped the
 * form in a second CompositionLayout only to show the report time and a refresh button beside the title). */
export type ModerationFormProps = ModerationFields & Readonly<{
    title?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    description?: string;
    actions?: ReactNode;
    cancel?: ScreenFlowAction;
    layoutStyle?: ScreenLayoutProps["layoutStyle"];
}>;
export declare function ModerationForm(props: ModerationFormProps): import("react").JSX.Element;
/** Source choice only: permission, capture, decoding and draft persistence belong to the host. */
export type PhotoSourceSheetProps = Readonly<{
    open: boolean;
    onOpenChange(open: boolean): void;
    onSelect(source: PhotoSource): void;
    labels: PhotoSourceLabels;
    disabled?: boolean;
    cameraAvailable?: boolean;
}>;
export declare function PhotoSourceSheet({ open, onOpenChange, onSelect, labels, disabled, cameraAvailable }: PhotoSourceSheetProps): import("react").JSX.Element;
export type MediaSelectionItem = {
    descriptor: UploadItemDescriptor;
    preview?: ReactNode;
};
/**
 * Quarter-turn action for a picked photo (2026-10-18, Utilverse photo-to-PDF). The product stores the rotation and
 * applies it to `preview` and its output; HJM only places the button with the other item actions.
 */
export type MediaSelectionRotate = Readonly<{
    label: string;
    itemLabel(item: MediaSelectionItem): string;
    onRotate(id: string): void;
}>;
/**
 * Copy and callbacks of one item's actions, shared by the screen grid and MediaSelectionCell.
 * `disabled` locks move/rotate/remove while the host runs a job over the selection (2026-10-18: Utilverse photo-to-PDF
 * and photo strip kept their own cells so a reorder could not diverge from a running build). Upload retry/cancel stay
 * live: they act on one transfer, not on the order or content the job reads.
 */
export type MediaSelectionItemActions = {
    labels: UploadItemLabels;
    actionLabels: {
        remove: string;
        moveUp: string;
        moveDown: string;
    };
    removeLabel(item: MediaSelectionItem): string;
    moveUpLabel(item: MediaSelectionItem): string;
    moveDownLabel(item: MediaSelectionItem): string;
    onRemove(id: string): void;
    onMove(id: string, direction: -1 | 1): void;
    onRetry(id: string): void;
    onCancel(id: string): void;
    rotate?: MediaSelectionRotate;
    disabled?: boolean;
};
export type MediaSelectionScreenProps = Base & {
    library?: ReactNode;
    selectionSummary?: ReactNode;
    items: readonly MediaSelectionItem[];
    add?: ScreenFlowIconAction;
    done: ScreenFlowAction;
} & MediaSelectionItemActions;
/** `index`/`count` place the item in the product's full list so the first/last move buttons disable correctly. */
export type MediaSelectionCellProps = MediaSelectionItemActions & Readonly<{
    item: MediaSelectionItem;
    index: number;
    count: number;
}>;
/**
 * One picked item: preview, upload status, then move/rotate/remove. Exported (2026-10-18, Utilverse photo tools) so a
 * virtualized host (VirtualList, FlatList renderItem) renders the same cell as the screen grid instead of a copy.
 * Web keyboard focus recovery after removal belongs to the screen grid; a virtualized host owns its own.
 */
export declare function MediaSelectionCell({ item, index, count, labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, rotate, disabled }: MediaSelectionCellProps): import("react").JSX.Element;
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export declare function MediaSelectionScreen({ library, selectionSummary, items, add, done, labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, rotate, disabled, ...screen }: MediaSelectionScreenProps): import("react").JSX.Element;
/** Recent searches before typing. Rows commit; the trailing button removes one. */
export type SearchRecentQueries = Readonly<{
    items: readonly string[];
    title: string;
    clearAllLabel: string;
    onClearAll(): void;
    removeLabel(query: string): string;
    onRemove(query: string): void;
    /** Decorative leading glyph (for example a history icon). */
    icon?: ReactNode;
    /** Glyph inside the remove button; defaults to "×". */
    removeIcon?: ReactNode;
    /** Rows shown; default `searchScreenRecipe.recentVisible` (5). */
    maxVisible?: number;
}>;
/** Product-chosen queries shown before typing and after a query-caused zero result. */
export type SearchSuggestedQueries = Readonly<{
    title: string;
    items: readonly string[];
}>;
/** A typed-ahead completion. `match` bolds the matched range (weight, not color, so it survives dark mode). */
export type SearchSuggestion = Readonly<{
    query: string;
    match?: Readonly<{
        start: number;
        end: number;
    }>;
}>;
export type SearchSuggestions = Readonly<{
    items: readonly SearchSuggestion[];
    /** First row that commits the typed text as is, e.g. "Search ‘q’". */
    commitLabel(query: string): string;
    /** Polite announcement of the suggestion count. */
    countLabel(count: number): string;
    icon?: ReactNode;
    /** Rows shown under the commit row; default `searchScreenRecipe.suggestionVisible` (6). */
    maxVisible?: number;
}>;
export type SearchSortOption = Readonly<{
    id: string;
    label: string;
}>;
export type SearchSort = Readonly<{
    /** Accessible name of the sort menu. */
    label: string;
    /** Visible trigger text, usually the current option ("Sort: Newest"). */
    triggerLabel: string;
    value: string;
    options: readonly SearchSortOption[];
    onChange(id: string): void;
    /** Trailing glyph of the trigger (for example a chevron). */
    icon?: ReactNode;
}>;
export type SearchResultSummary = Readonly<{
    /** Result total for the committed query; `null` while it loads (skeleton rows replace `children`). */
    count: number | null;
    /** Hide the visual total without losing loading, empty-state or announcement behavior. */
    countVisibility?: "visible" | "hidden";
    countLabel(count: number): string;
    /** Announced while loading. */
    loadingLabel: string;
    sort?: SearchSort;
    /** Above the count, e.g. a retained-results error Notice with retry. */
    notice?: ReactNode;
    /** Zero-result copy. Filters as the cause add "clear all"; the query as the cause adds suggested queries. */
    empty?: Readonly<{
        title: string;
        description?: string;
    }>;
}>;
export type SearchAppliedFilter = Readonly<{
    key: string;
    label: string;
}>;
export type SearchAppliedFilters = Readonly<{
    items: readonly SearchAppliedFilter[];
    removeLabel(label: string): string;
    onRemove(key: string): void;
    clearAllLabel: string;
    onClearAll(): void;
    removeIcon?: ReactNode;
}>;
export type SearchFilterSheetLabels = Readonly<{
    close: string;
    reset: string;
    /** Primary action text for a live draft count, e.g. "Show 12 results"; `null` while counting. */
    apply(count: number | null): string;
}>;
/**
 * Draft/applied filter sheet. HJM copies `value` into a draft when the sheet opens, discards the draft
 * on any dismissal, and calls `onApply(draft)` only from the primary action.
 */
export type SearchFilterSheet<F> = Readonly<{
    open: boolean;
    onOpenChange(open: boolean): void;
    /** Sheet title; products that open one section from a facet chip pass that section's name. */
    title: string;
    /** Applied filters. */
    value: F;
    onApply(next: F): void;
    /** Live count for a draft. Return `null` while an async count is pending; `0` disables apply. */
    count(draft: F): number | null;
    /** Draft after "reset" (the open section, or everything). */
    reset(draft: F): F;
    /** Disables "reset" when the draft already equals its reset value. */
    isDefault(draft: F): boolean;
    renderContent(draft: F, setDraft: (next: F) => void): ReactNode;
    labels: SearchFilterSheetLabels;
    /** Default `large`; section sheets usually pass `auto`. */
    size?: SheetProps["size"];
    /** First item of the filter rail that opens the sheet, named with the applied count. */
    trigger?: Readonly<{
        label(appliedCount: number): string;
        accessibilityLabel(appliedCount: number): string;
        icon?: ReactNode;
    }>;
}>;
type SearchInputSlot = {
    queryField: ReactNode;
    queryClearLabel?: string;
} | {
    queryField?: never;
    queryClearLabel: string;
};
/** `committedQuery` turns on two-step search; every commit (Enter, suggestion, recent, suggested query) then goes through `onSubmit`. */
/** One name for the default field's progress on both platforms (Web SearchField `loading`, Native `busy`+`busyLabel`). */
type SearchProgressSlot = {
    searching?: never;
    searchingLabel?: never;
} | {
    searching: boolean;
    searchingLabel: string;
};
type SearchCommitSlot = {
    committedQuery?: never;
    onSubmit?: (query: string) => void;
} | {
    committedQuery: string;
    onSubmit: (query: string) => void;
};
export type SearchScreenProps<F = unknown> = Base & SearchInputSlot & SearchCommitSlot & SearchProgressSlot & {
    embedded?: boolean;
    query: string;
    queryLabel: string;
    onQueryChange(value: string): void;
    onSearch(query: string, context: {
        signal: AbortSignal;
    }): void;
    debounceMs?: number;
    filters?: ReactNode;
    recentSearches?: ReactNode;
    children: ReactNode;
    /** ScreenLayout footer (bottom action or ad bar) under the results; it owns the bottom inset, as on every screen (unairplane rendered it outside the screen, 2026-10-17). */
    footer?: ScreenLayoutProps["footer"];
    /** `scroll` keeps `filters` on one horizontally scrolling line that bleeds to the screen edges. */
    filtersOverflow?: "wrap" | "scroll";
    /** `scope` marks filters that choose what is searched (kind, region, map area), so they stay on a query-caused zero as its recovery; `narrow` (default) hides them there. */
    filtersRole?: SearchFiltersRole;
    /** Gutter the host (Container `gutter`, Sheet = `regular`) already applies around this screen; the scroll rail bleeds over it too. */
    hostGutter?: ContainerGutter;
    /** Placeholder by default (2026-10-18 header-input rule); the accessible name remains queryLabel after typing. */
    queryLabelVisibility?: "visible" | "hidden";
    recentQueries?: SearchRecentQueries;
    suggestedQueries?: SearchSuggestedQueries;
    suggestions?: SearchSuggestions;
    resultSummary?: SearchResultSummary;
    appliedFilters?: SearchAppliedFilters;
    filterSheet?: SearchFilterSheet<F>;
};
/** Abort is supplied to the host request; the host must ignore aborted responses before committing results. */
export declare function SearchScreen<F = unknown>({ embedded, query, queryLabel, queryField, queryClearLabel, onQueryChange, onSearch, debounceMs, filters, recentSearches, children, onSubmit, committedQuery, filtersOverflow, filtersRole, hostGutter, queryLabelVisibility, searching, searchingLabel, recentQueries, suggestedQueries, suggestions, resultSummary, appliedFilters, filterSheet, initialFocus, ...screen }: SearchScreenProps<F>): import("react").JSX.Element;
export type PermissionScreenProps = Base & {
    status: PermissionScreenStatus;
    illustration?: ReactNode;
    explanation: ReactNode;
    request: ScreenFlowAction;
    settings: ScreenFlowAction;
    continueAction: ScreenFlowAction;
    /** Re-read the OS permission after returning from settings. Shown only while `denied`, under the settings action. */
    recheck?: ScreenFlowAction;
    /** A path that works without the permission (pick a photo, enter it by hand). Shown until `granted`, above skip. */
    alternative?: ScreenFlowAction;
    skip?: ScreenFlowAction;
};
export declare function PermissionScreen({ status, illustration, explanation, request, settings, continueAction, recheck, alternative, skip, ...screen }: PermissionScreenProps): import("react").JSX.Element;
export type OnboardingStep = {
    id: string;
    title: string;
    description: string;
    content: ReactNode;
};
export type OnboardingScreenProps = {
    steps: readonly OnboardingStep[];
    index: number;
    onIndexChange(index: number): void;
    nextLabel: string;
    backLabel: string;
    complete: ScreenFlowAction;
    skip?: ScreenFlowAction;
    progressLabel(index: number, total: number): string;
    exit?: ScreenLayoutProps["exit"];
    layoutStyle?: ScreenLayoutProps["layoutStyle"];
};
export declare function OnboardingScreen({ steps, index, onIndexChange, nextLabel, backLabel, complete, skip, progressLabel, exit, layoutStyle }: OnboardingScreenProps): import("react").JSX.Element;
export type CommentThreadItem = Readonly<{
    /** Root-only reply branch. Total can exceed the loaded preview; HJM owns its indentation and expansion. */
    repliesCount?: number;
    repliesNotice?: ReactNode;
    repliesFooter?: ReactNode;
    /**
     * Root-only next server page of replies (2026-10-25 five-at-a-time policy). HJM calls `onLoadMore` from the branch's
     * "more" action once every loaded reply is shown; the product fetches `commentThreadRecipe.replyPageSize` more and
     * reports `pending` so the action cannot double-request. Omit it when every reply is already in `items`.
     */
    repliesPage?: Readonly<{
        onLoadMore(): void;
        pending?: boolean;
    }>;
    id: string;
    parentId: string | null;
    author: string;
    authorBadge?: ReactNode;
    body: ReactNode;
    bodyText?: string;
    timeLabel: string;
    timeDateTime?: string;
    likeCountLabel: string;
    avatar?: ReactNode;
    avatarAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    likeIcon: ReactNode;
    likeLabel: string;
    likeAction?: ReactNode;
    actions?: ReactNode;
    canReply?: boolean;
    replyDisabled?: boolean;
    /** Long-press the comment (author and body) to react; the product owns the stored value and summary. */
    reactions?: CommentReactions;
    reactionSummary?: ReactNode;
    /** Optional photo or sticker under the body; HJM bounds its width and corners, the product sizes the image. */
    media?: ReactNode;
    /**
     * Where the time label sits. "auto" keeps it beside the author unless `bodyText` inlines the author; "actions" moves it
     * into the line under the body with reactions and Reply, for rich (non-text) bodies such as Spint's flower stamp
     * (2026-10-18). Default "auto".
     */
    timePlacement?: "auto" | "actions";
    /**
     * Text actions in the Reply line, after Reply, styled like Reply (2026-10-29 Spint comment translation: Instagram puts
     * "See original"/"See translation" beside Reply). The product owns labels and state; HJM owns placement and order.
     */
    textActions?: readonly CommentTextActionDescriptor[];
    /**
     * Inline per-comment panel (edit, report or block form) under the Reply line, outside the long-press target
     * (2026-10-18, Utilverse). The product owns its open state, focus, submit and close; HJM owns its place in the row.
     */
    panel?: ReactNode;
    /**
     * Paged photo set under the body (2026-10-18, Utilverse): HJM mounts only the shown page so the product can fetch one
     * authorized image at a time. Exclusive with `media` (validated at render); it sits outside the long-press target because it has its own buttons.
     */
    mediaAlbum?: MediaAlbum;
}>;
export type CommentReactions = ReactionPickerProps & Readonly<{
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
    interactiveContent?: boolean; /** Icon for the automatic "reply" row of the hold menu. */
    replyIcon?: ReactNode;
}>;
/**
 * HJM-owned "more" menu per comment (2026-10-17: common comment structure belongs to HJM, review S4#7). HJM draws the
 * vertical-dots button at the row's trailing edge and opens the shared Menu with danger items last; the product supplies
 * only the localized button name, the items allowed for that comment and the action callback.
 */
export type CommentMenu = Readonly<{
    /** Context belongs to the row: anchored by default; override only for a product interaction reason. */
    presentation?: "grouped" | "anchored" | "bottom";
    /** Required when presentation is grouped or bottom. */
    dismissLabel?: string;
    /** Localized accessible name of the button, e.g. "More options for seoyeon's comment". */
    label(item: CommentThreadItem): string;
    /** Items allowed for this comment (permission is product-owned). An empty list omits the button for that row. */
    items(item: CommentThreadItem): readonly CommentMenuItemDescriptor[];
    /** Runs after the menu closes, so a confirmation dialog can open without competing with the menu for focus. */
    onAction(item: CommentThreadItem, id: string): void;
}>;
export type CommentThreadScreenProps = Base & {
    items: readonly CommentThreadItem[];
    expandedIds: readonly string[];
    onExpandedChange(id: string): void;
    onLike(id: string): void;
    onReply(id: string): void;
    replyLabel: string;
    repliesLabel(count: number, expanded: boolean): string;
    composer?: ReactNode;
    threadHeader?: ReactNode;
    threadFooter?: ReactNode;
    commentMenu?: CommentMenu;
    /**
     * Label of an open branch's "more" action for the replies not shown yet (2026-10-25 policy: branches open and extend
     * `commentThreadRecipe.replyPageSize` at a time). Without it the branch keeps the earlier show-all behaviour.
     */
    moreRepliesLabel?(remaining: number): string;
    /** A reply that must stay shown even past the opened page (just sent, opened from a notification); expansion stays product-controlled. */
    revealedReplyId?: string;
};
export type CommentThreadRowProps = Readonly<{
    layoutStyle?: ScreenLayoutProps["layoutStyle"];
    item: CommentThreadItem;
    onLike(id: string): void;
    onReply(id: string): void;
    replyLabel: string;
    commentMenu?: CommentMenu;
}>;
/** Quiet secondary actions (reply, expand) read as muted copy beside the body, not as filled buttons. */
export type CommentTextActionDescriptor = Readonly<{
    id: string;
    label: string;
    onPress(): void;
    disabled?: boolean;
}>;
/** Virtualized hosts reuse the same row as CommentThreadScreen; product slots add content, not a second layout. */
export declare function CommentThreadRow({ item, onLike, onReply, replyLabel, layoutStyle, commentMenu }: CommentThreadRowProps): import("react").JSX.Element;
/** Controlled thread: server ordering, permission checks and receipt-based draft clearing belong to the product. */
export declare function CommentThreadScreen({ items, expandedIds, onExpandedChange, onLike, onReply, replyLabel, repliesLabel, composer, threadHeader, threadFooter, commentMenu, moreRepliesLabel, revealedReplyId, ...screen }: CommentThreadScreenProps): import("react").JSX.Element;
export type ProfileSummaryProps = Readonly<{
    name: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    avatar: ReactNode;
    badge?: ReactNode;
    nameActions?: ReactNode;
    /**
     * Edit beside the name (2026-10-25 user rule): on one's own profile the name carries a pencil IconButton that opens the
     * nickname change, while tapping the photo (`Avatar.action`) changes the photo. HJM owns the icon, size and placement
     * (before `nameActions`); the product supplies the label and the route. Pass `icon` with the product's own pencil
     * glyph so it matches the other name-row icons (2026-10-25: BurnTok's lucide gear sat beside HJM's drawn pencil).
     */
    nameEdit?: ScreenFlowAction;
    /**
     * Another member's profile: tapping the picture opens it large (2026-10-29 user rule). HJM makes the avatar frame an
     * image button with this localized label (e.g. "Show photo large"); the product opens `ImageViewer` from the
     * image-viewer subpath, which also carries the photo report action. Omit it when there is no photo (initials only)
     * and on one's own profile, where the picture is `Avatar.action` (change photo). Never combine the two.
     */
    avatarView?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    stats?: readonly Readonly<{
        id: string;
        value: string;
        label: string;
        onPress?(): void;
        disabled?: boolean;
    }>[];
    actions?: ReactNode;
    actionsLayout?: keyof typeof profileSummaryRecipe.actionsLayouts;
    children?: ReactNode;
    layoutStyle?: ScreenLayoutProps["layoutStyle"];
}>;
export declare function ProfileSummary({ name, headingLevel, avatar, badge, nameActions, nameEdit, avatarView, stats, actions, actionsLayout, children, layoutStyle }: ProfileSummaryProps): import("react").JSX.Element;
//# sourceMappingURL=screen-flows.d.ts.map