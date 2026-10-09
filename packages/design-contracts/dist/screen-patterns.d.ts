/** Initial load replaces the body; refresh/save errors belong beside retained content. */
export type ScreenContentState = Readonly<{
    kind: "ready";
}> | Readonly<{
    kind: "loading" | "empty" | "error" | "restricted";
    title: string;
    description?: string;
}>;
export declare function resolveScreenContentState(state?: ScreenContentState): {
    readonly kind: "error" | "empty" | "loading" | "ready" | "restricted";
    readonly replacesContent: boolean;
    readonly busy: boolean;
    readonly announcement: "polite" | "assertive";
};
export declare const screenPatternRecipe: {
    readonly maxWidth: 720;
    readonly padding: 16;
    readonly sectionGap: 24;
    readonly itemGap: 12;
    readonly stateGap: 16;
    readonly headerMinWidth: number;
    readonly messageMaxWidth: "84%";
    readonly attachmentSize: 80;
    readonly attachmentRemoveSize: 24;
    readonly reactionHoldMs: 450;
    readonly reactionMoveTolerance: 10;
    readonly reactionMenuWidth: 320;
    readonly replySwipeDistance: 60;
    readonly composerMinLines: 1;
    readonly composerMaxLines: 5;
};
/** Controlled composer: HJM never clears drafts or interprets a fulfilled callback as server delivery. */
export type MessageComposerDescriptor = Readonly<{
    value: string;
    label: string;
    sendLabel: string;
    /** Short visual copy may differ from the complete accessible input name. */
    placeholder?: string;
    description?: string;
    error?: string;
    invalid?: boolean;
    /** Newline remains the compatible default; desktop chat may explicitly opt into send. */
    submitMode?: "newline" | "send";
    disabled?: boolean;
    pending?: boolean;
    attachmentCount?: number;
}>;
/** Safari may report the final IME Enter as keyCode 229 after isComposing becomes false. */
export declare function shouldSubmitMessageKey(event: Readonly<{
    key: string;
    shiftKey?: boolean;
    isComposing?: boolean;
    keyCode?: number;
}>, mode?: "newline" | "send"): boolean;
export declare function canSubmitMessage({ value, disabled, pending, attachmentCount }: MessageComposerDescriptor): boolean;
/** Bubble alignment expresses authorship, not delivery; delivery text always comes from the product receipt. */
export type ChatMessageDescriptor = Readonly<{
    direction: "incoming" | "outgoing";
    author: string;
    timestamp: string;
    deliveryLabel?: string;
    /** Rightward drag reveals time while delivery state remains visible; default preserves existing captions. */
    timestampPresentation?: "always" | "swipe";
}>;
/** A denied permission goes to settings; rendering never requests OS access automatically. */
export type PermissionScreenStatus = "prompt" | "denied" | "granted" | "unavailable";
export declare function resolvePermissionAction(status: PermissionScreenStatus): "settings" | "request" | "continue" | null;
export declare function resolveOnboardingStep(total: number, index: number): {
    first: boolean;
    last: boolean;
};
/** Replies are one level deep; reject orphaned/duplicate records instead of silently losing them. */
export declare function validateCommentThread(items: readonly {
    id: string;
    parentId: string | null;
}[]): void;
/** Source bytes, permission requests, ordering and upload limits remain product-owned. */
export type MessageAttachmentDescriptor = Readonly<{
    id: string;
    removeLabel: string; /** Local preparation can lock removal without locking text entry. */
    disabled?: boolean;
}>;
export declare function validateMessageAttachments(attachments: readonly MessageAttachmentDescriptor[]): void;
/** Require horizontal intent so a timeline scroll cannot accidentally start a reply. */
export declare function isReplySwipe(dx: number, dy: number): boolean;
/** The UI never infers permission or camera availability; product adapters own both. */
export type PhotoSource = "library" | "camera";
export type PhotoSourceLabels = Readonly<{
    title: string;
    library: string;
    camera: string;
    cancel: string;
}>;
export type SavedItem = Readonly<{
    id: string;
    title: string;
}>;
export type SavedCollection = Readonly<{
    id: string;
    title: string;
    itemIds: readonly string[];
}>;
export type SavedItemsLabels = Readonly<{
    allItems: string;
    privateNotice: string;
    back: string;
    empty: string;
    createCollection: string;
}>;
/** Unsave removes an item from every collection view without rewriting product-owned membership. */
export declare function resolveSavedItems<T extends SavedItem>(items: readonly T[], collections: readonly SavedCollection[], collectionId: string | null | undefined, selectedItemId: string | null | undefined): {
    home: boolean;
    collection: Readonly<{
        id: string;
        title: string;
        itemIds: readonly string[];
    }> | undefined;
    visible: readonly T[];
    selected: T | undefined;
};
/**
 * SearchScreen phases (2026-10-06 search redesign, docs/screen-patterns.md#searchscreen-두-단계-검색).
 * Without a committed query (one-step search, the pre-1.13 behavior) any nonblank query is already
 * `results`. With one, typing a different query is `typing`: suggestions replace the results until the
 * user commits (Enter, a suggestion, a recent or suggested query). Comparing trimmed values keeps a
 * trailing space from flipping committed results back into suggestions.
 */
export type SearchScreenPhase = "idle" | "typing" | "results";
export declare function resolveSearchScreenPhase(query: string, committedQuery?: string): SearchScreenPhase;
/**
 * The value a commit records, or `null` when there is nothing to commit. Blank commits are dropped
 * so a stray Enter never writes an empty recent search or fetches "everything".
 */
export declare function resolveSearchCommit(value: string): string | null;
/**
 * Why a committed search shows nothing. `filters` keeps the filter rail and offers "clear all";
 * `query` hides the rail (no filter can fix it) and offers suggested queries instead. Reference
 * services hide the rail on every zero result, which removes the only way to undo a filter.
 * `null` count means the result is still loading, so no cause is reported yet.
 */
export type SearchEmptyCause = "none" | "filters" | "query";
export declare function resolveSearchEmptyCause(count: number | null, appliedFilterCount: number): SearchEmptyCause;
/**
 * Index to focus after removing item `removedIndex` from a list that now has `remaining` items:
 * the item that slid into its place, else the new last item, else -1 (move to the fallback target).
 * Removing a focused chip or row would otherwise drop focus to <body>.
 */
export declare function resolveFocusAfterRemoval(removedIndex: number, remaining: number): number;
/** Recipe for the SearchScreen phase sections; geometry stays on shared spacing tokens. */
export declare const searchScreenRecipe: {
    /** Recent searches shown before the user types; reference services show 5–10 and let the rest scroll away. */
    readonly recentVisible: 5;
    /** Suggestions under the "search for ‘q’" row. */
    readonly suggestionVisible: 6;
    /** Skeleton rows while the first page of results loads. */
    readonly loadingRows: 4;
    /** Between idle sections (recent, suggested). */
    readonly sectionGap: 24;
    /** Section title to its list, and results header to applied filters. */
    readonly headerGap: 12;
    /** Between chips in applied filters and suggested queries. */
    readonly chipGap: 8;
};
/** Horizontal intent preserves vertical scrolling and uses one reveal distance across renderers. */
export declare function timestampRevealOffset(dx: number, dy: number): number;
//# sourceMappingURL=screen-patterns.d.ts.map