import { type ReactNode } from "react";
import { type ScreenLayoutProps } from "./screens.js";
import { type SheetProps } from "./overlays.js";
import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import { type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { type PermissionScreenStatus, type PhotoSource, type PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { type ContainerGutter } from "@hjmds/design-contracts/components/container";
/** Copy, pending state and mutations are controlled by the consuming product. */
export type ScreenFlowAction = Readonly<{
    label: string;
    onAction(): void;
    disabled?: boolean;
    pending?: boolean;
}>;
type Base = Omit<ScreenLayoutProps, "children" | "footer">;
export type ListDetailScreenProps = Base & {
    list: ReactNode;
    detail?: {
        title: string;
        content: ReactNode;
    };
    back: ScreenFlowAction;
    refresh?: ScreenFlowAction;
    loadMore?: ScreenFlowAction;
};
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state. */
export declare function ListDetailScreen({ list, detail, back, refresh, loadMore, layoutStyle, ...screen }: ListDetailScreenProps): import("react").JSX.Element;
export type EditorScreenProps = Base & {
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
};
export declare function EditorScreen({ children, dirty, submitPlacement, submit, cancel, discard, draftStatus, ...screen }: EditorScreenProps): import("react").JSX.Element;
export type ProfileScreenProps = Base & {
    summary: ReactNode;
    edit: ScreenFlowAction;
    children?: ReactNode;
    accountActions?: ReactNode;
};
export declare function ProfileScreen({ summary, edit, children, accountActions, ...screen }: ProfileScreenProps): import("react").JSX.Element;
export type ModerationScreenProps = Base & {
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
export declare function ModerationScreen({ reasonPicker, reasons, reason, onReasonChange, reasonLabel, children, submit, block, ...screen }: ModerationScreenProps): import("react").JSX.Element;
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
export type MediaSelectionScreenProps = Base & {
    library?: ReactNode;
    selectionSummary?: ReactNode;
    items: readonly MediaSelectionItem[];
    add: ScreenFlowAction;
    done: ScreenFlowAction;
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
};
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export declare function MediaSelectionScreen({ library, selectionSummary, items, add, done, labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, ...screen }: MediaSelectionScreenProps): import("react").JSX.Element;
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
    /** `scroll` keeps `filters` on one horizontally scrolling line that bleeds to the screen edges. */
    filtersOverflow?: "wrap" | "scroll";
    /** Gutter the host (Container `gutter`, Sheet = `regular`) already applies around this screen; the scroll rail bleeds over it too. */
    hostGutter?: ContainerGutter;
    /** `hidden` drops the visible label (the field keeps `queryLabel` as its accessible name and placeholder). */
    queryLabelVisibility?: "visible" | "hidden";
    recentQueries?: SearchRecentQueries;
    suggestedQueries?: SearchSuggestedQueries;
    suggestions?: SearchSuggestions;
    resultSummary?: SearchResultSummary;
    appliedFilters?: SearchAppliedFilters;
    filterSheet?: SearchFilterSheet<F>;
};
/** Abort is supplied to the host request; the host must ignore aborted responses before committing results. */
export declare function SearchScreen<F = unknown>({ query, queryLabel, queryField, queryClearLabel, onQueryChange, onSearch, debounceMs, filters, recentSearches, children, onSubmit, committedQuery, filtersOverflow, hostGutter, queryLabelVisibility, searching, searchingLabel, recentQueries, suggestedQueries, suggestions, resultSummary, appliedFilters, filterSheet, ...screen }: SearchScreenProps<F>): import("react").JSX.Element;
export type PermissionScreenProps = Base & {
    status: PermissionScreenStatus;
    illustration?: ReactNode;
    explanation: ReactNode;
    request: ScreenFlowAction;
    settings: ScreenFlowAction;
    continueAction: ScreenFlowAction;
    skip?: ScreenFlowAction;
};
export declare function PermissionScreen({ status, illustration, explanation, request, settings, continueAction, skip, ...screen }: PermissionScreenProps): import("react").JSX.Element;
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
    layoutStyle?: ScreenLayoutProps["layoutStyle"];
};
export declare function OnboardingScreen({ steps, index, onIndexChange, nextLabel, backLabel, complete, skip, progressLabel, layoutStyle }: OnboardingScreenProps): import("react").JSX.Element;
export type CommentThreadItem = Readonly<{
    id: string;
    parentId: string | null;
    author: string;
    body: ReactNode;
    bodyText?: string;
    timeLabel: string;
    likeCountLabel: string;
    avatar?: ReactNode;
    likeIcon: ReactNode;
    likeLabel: string;
    likeAction?: ReactNode;
    actions?: ReactNode;
    canReply?: boolean;
    replyDisabled?: boolean;
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
    threadFooter?: ReactNode;
};
/** Controlled thread: server ordering, permission checks and receipt-based draft clearing belong to the product. */
export declare function CommentThreadScreen({ items, expandedIds, onExpandedChange, onLike, onReply, replyLabel, repliesLabel, composer, threadFooter, ...screen }: CommentThreadScreenProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=screen-flows.d.ts.map