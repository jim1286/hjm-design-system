import { layout, spacing } from "./foundations.js";
export function resolveScreenContentState(state = { kind: "ready" }) {
    if (!["ready", "loading", "empty", "error", "restricted"].includes(state.kind)) {
        throw new TypeError("Unknown screen content state");
    }
    if (state.kind !== "ready" && !state.title.trim()) {
        throw new TypeError("Screen state requires a localized title");
    }
    return {
        kind: state.kind,
        replacesContent: state.kind !== "ready",
        busy: state.kind === "loading",
        announcement: state.kind === "error" ? "assertive" : "polite",
    };
}
// Reuse reading-width and spacing tokens; do not derive geometry from a product's device or artwork.
export const screenPatternRecipe = {
    maxWidth: layout.readingMaxWidth,
    padding: spacing.md,
    sectionGap: spacing.xl,
    itemGap: spacing.sm,
    stateGap: spacing.md,
    // Compact screens must keep back/title/save on one row; scale this floor for large text instead of reserving a desktop-width title.
    headerMinWidth: layout.readingMaxWidth / 6,
    // Reserve the opposite edge for authorship and cap the composer so history remains visible.
    messageMaxWidth: "84%",
    // Social thumbnails stay compact; selection order and removal replace a second toolbar.
    attachmentSize: 80,
    attachmentRemoveSize: 24,
    reactionHoldMs: 450,
    reactionMoveTolerance: 10,
    reactionMenuWidth: 320,
    replySwipeDistance: 60,
    composerMinLines: 1,
    composerMaxLines: 5,
};
export function canSubmitMessage({ value, disabled = false, pending = false, attachmentCount = 0 }) {
    if (!Number.isSafeInteger(attachmentCount) || attachmentCount < 0)
        throw new RangeError("Attachment count must be a nonnegative integer");
    return !disabled && !pending && (value.trim().length > 0 || attachmentCount > 0);
}
export function resolvePermissionAction(status) {
    switch (status) {
        case "prompt": return "request";
        case "denied": return "settings";
        case "granted": return "continue";
        case "unavailable": return null;
        default: throw new TypeError("Unknown permission state");
    }
}
export function resolveOnboardingStep(total, index) {
    if (!Number.isInteger(total) || total < 1 || !Number.isInteger(index) || index < 0 || index >= total)
        throw new RangeError("Onboarding requires a valid step index");
    return { first: index === 0, last: index === total - 1 };
}
/** Replies are one level deep; reject orphaned/duplicate records instead of silently losing them. */
export function validateCommentThread(items) {
    const roots = new Set(items.filter(item => item.parentId === null).map(item => item.id));
    const ids = new Set();
    for (const item of items) {
        if (!item.id.trim() || ids.has(item.id))
            throw new TypeError("Comment ids must be unique and nonempty");
        ids.add(item.id);
        if (item.parentId !== null && (!roots.has(item.parentId) || item.parentId === item.id))
            throw new TypeError("Replies require an existing root comment");
    }
}
export function validateMessageAttachments(attachments) {
    const ids = new Set();
    for (const item of attachments) {
        if (!item.id.trim() || ids.has(item.id) || !item.removeLabel.trim())
            throw new TypeError("Attachments require unique ids and localized removal labels");
        ids.add(item.id);
    }
}
/** Require horizontal intent so a timeline scroll cannot accidentally start a reply. */
export function isReplySwipe(dx, dy) {
    return Math.abs(dx) >= screenPatternRecipe.replySwipeDistance && Math.abs(dx) > Math.abs(dy) * 2;
}
/** Unsave removes an item from every collection view without rewriting product-owned membership. */
export function resolveSavedItems(items, collections, collectionId, selectedItemId) {
    const ids = new Set(), groups = new Set();
    for (const item of items) {
        if (!item.id.trim() || ids.has(item.id) || !item.title.trim())
            throw new TypeError("Saved items require unique ids and nonempty titles");
        ids.add(item.id);
    }
    for (const group of collections) {
        if (!group.id.trim() || groups.has(group.id) || !group.title.trim())
            throw new TypeError("Saved collections require unique ids and nonempty titles");
        groups.add(group.id);
    }
    const collection = collections.find(item => item.id === collectionId);
    // A deleted collection returns to the overview instead of showing a mislabeled all-posts view.
    const home = collectionId === undefined || (collectionId !== null && !collection);
    const visible = home || collectionId === null ? items : items.filter(item => collection?.itemIds.includes(item.id));
    return { home, collection, visible, selected: home ? undefined : visible.find(item => item.id === selectedItemId) };
}
export function resolveSearchScreenPhase(query, committedQuery) {
    const typed = query.trim();
    if (!typed)
        return "idle";
    if (committedQuery === undefined)
        return "results";
    return typed === committedQuery.trim() ? "results" : "typing";
}
/**
 * The value a commit records, or `null` when there is nothing to commit. Blank commits are dropped
 * so a stray Enter never writes an empty recent search or fetches "everything".
 */
export function resolveSearchCommit(value) {
    const next = value.trim();
    return next ? next : null;
}
export function resolveSearchEmptyCause(count, appliedFilterCount) {
    if (count === null || count > 0)
        return "none";
    if (count < 0 || !Number.isSafeInteger(count) || !Number.isSafeInteger(appliedFilterCount) || appliedFilterCount < 0) {
        throw new RangeError("Search counts must be nonnegative integers");
    }
    return appliedFilterCount > 0 ? "filters" : "query";
}
/**
 * Index to focus after removing item `removedIndex` from a list that now has `remaining` items:
 * the item that slid into its place, else the new last item, else -1 (move to the fallback target).
 * Removing a focused chip or row would otherwise drop focus to <body>.
 */
export function resolveFocusAfterRemoval(removedIndex, remaining) {
    if (!Number.isInteger(removedIndex) || removedIndex < 0 || !Number.isInteger(remaining) || remaining < 0) {
        throw new RangeError("Removal indexes must be nonnegative integers");
    }
    return remaining === 0 ? -1 : Math.min(removedIndex, remaining - 1);
}
/** Recipe for the SearchScreen phase sections; geometry stays on shared spacing tokens. */
export const searchScreenRecipe = {
    /** Recent searches shown before the user types; reference services show 5–10 and let the rest scroll away. */
    recentVisible: 5,
    /** Suggestions under the "search for ‘q’" row. */
    suggestionVisible: 6,
    /** Skeleton rows while the first page of results loads. */
    loadingRows: 4,
    /** Between idle sections (recent, suggested). */
    sectionGap: spacing.xl,
    /** Section title to its list, and results header to applied filters. */
    headerGap: spacing.sm,
    /** Between chips in applied filters and suggested queries. */
    chipGap: spacing.xs,
};
//# sourceMappingURL=screen-patterns.js.map