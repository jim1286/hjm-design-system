import { layout, radius, spacing } from "./foundations.js";
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
/**
 * Native header band heights. Titled centered headers match the iOS navigation bar (44 control + 4 + 4);
 * icon-only centered headers are compact (2026-10-14 야잘알 tab spacing, 2026-10-17 "상단 여백 줄여").
 * Body top padding shrinks only under a compact header without a notice.
 */
export const screenHeaderRecipe = {
    minHeight: 52,
    paddingVertical: spacing.xxs,
    compactMinHeight: 48,
    compactPaddingVertical: 2,
    compactBodyTop: spacing.xxs,
};
export const screenExitRecipe = {
    /** Chevron arm length and stroke; close cross arm length. Drawn, not font glyphs, so every platform matches. */
    chevronSize: 10,
    closeSize: 14,
    stroke: 2,
};
export function validateScreenExit(exit, hasLeading) {
    if (exit.kind !== "back" && exit.kind !== "close")
        throw new TypeError("Screen exit kind must be back or close");
    if (!exit.label.trim())
        throw new TypeError("Screen exit needs a localized accessible label");
    if (hasLeading)
        throw new TypeError("Screen exit owns the leading slot; do not also pass leading");
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
/** Safari may report the final IME Enter as keyCode 229 after isComposing becomes false. */
export function shouldSubmitMessageKey(event, mode = "newline") {
    return mode === "send" && event.key === "Enter" && !event.shiftKey && !event.isComposing && event.keyCode !== 229;
}
export function canSubmitMessage({ value, disabled = false, pending = false, attachmentCount = 0 }) {
    if (!Number.isSafeInteger(attachmentCount) || attachmentCount < 0)
        throw new RangeError("Attachment count must be a nonnegative integer");
    return !disabled && !pending && (value.trim().length > 0 || attachmentCount > 0);
}
/**
 * Shared timeline geometry. 2026-10-16 user decision: the common chat standard follows the measured
 * KakaoTalk iOS chat room (@3x capture: bubble ~35pt tall, radius ~14, run gap ~6, group gap ~12,
 * avatar ~34, avatar gap 8). Brand colors and artwork are not copied; surfaces stay semantic tokens.
 */
export const chatMessageRecipe = {
    avatarSize: 36,
    avatarGap: spacing.xs,
    authorGap: spacing.xxs,
    metaGap: spacing.xxs,
    bubbleRadius: 14,
    bubblePaddingInline: 10,
    bubblePaddingBlock: 6,
    // Bubbles of one run read as a stack; a new author or minute starts a visibly separate group.
    runGap: 6,
    groupGap: spacing.sm,
    // Flat-topped tip continuing the bubble's top edge; the tipped corner tightens to meet it.
    tailWidth: 7,
    tailHeight: 10,
    tailCornerRadius: 4,
    jumpToLatestGap: spacing.xs,
    // Timeline side gutter (measured 10pt); header and composer keep the screen padding.
    timelineInset: 10,
    // Photos render without the bubble surface (measured reference: ~210pt wide, bubble radius).
    mediaWidth: 210,
    mediaGap: 2,
};
/** Column count for a photo set: pairs read as 2-up, other counts as 3-up; one photo spans the width. */
export function resolveChatMediaColumns(count) {
    if (!Number.isSafeInteger(count) || count < 1)
        throw new RangeError("Chat media requires at least one item");
    return count === 1 ? 1 : count === 2 || count === 4 ? 2 : 3;
}
/**
 * Long-press menu geometry measured from the Instagram iOS DM hold menu (2026-10-16 @3x capture):
 * full-width reaction strip ~60pt with ~30pt emoji, the pressed bubble itself as preview, and a ~200pt
 * action card aligned to the bubble's side with ~56pt rows. 12pt between the three blocks.
 */
/** Emoji row above a comment composer (Instagram comment sheet, 2026-10-16): evenly spread 44pt targets. */
export const composerQuickInsertRecipe = { itemSize: 44, emojiSize: 26, gap: spacing.xs };
export const holdMenuRecipe = {
    inset: 10,
    gap: spacing.sm,
    stripHeight: 60,
    stripItemSize: 48,
    emojiSize: 28,
    actionWidth: 200,
    actionRowHeight: 56,
    actionRadius: 18,
    iconSize: 24,
};
/**
 * Runs break when the author or the displayed timestamp changes, so each minute shows its time once
 * and a new minute re-introduces the author (KakaoTalk behavior). Products pass the same localized
 * timestamp string they render; HJM never parses dates.
 */
export function resolveChatMessageGroups(items) {
    const positions = new Map();
    items.forEach((item, index) => {
        if (!item.id.trim() || positions.has(item.id))
            throw new TypeError("Chat messages require unique, nonempty ids");
        const same = (other) => !!other && other.authorId === item.authorId && other.timestamp === item.timestamp;
        const before = same(items[index - 1]), after = same(items[index + 1]);
        positions.set(item.id, before ? (after ? "middle" : "last") : after ? "first" : "single");
    });
    return positions;
}
/** What one bubble shows for its run position; both renderers read this instead of re-deriving rules. */
export function resolveChatMessageGroupDisplay(position = "single") {
    if (!["single", "first", "middle", "last"].includes(position))
        throw new TypeError("Unknown chat message group position");
    const starts = position === "single" || position === "first";
    const ends = position === "single" || position === "last";
    return { showAuthor: starts, showAvatar: starts, showTail: starts, showTimestamp: ends, spacingBefore: starts ? chatMessageRecipe.groupGap : chatMessageRecipe.runGap };
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
/**
 * Shared comment-row geometry. 2026-10-16 user decision: comments follow the measured Instagram iOS
 * comment sheet (@3x capture: avatar 32 / reply 24, avatar gap 8, like count under the heart,
 * "Reply" as quiet text below the body, replies indented to the text column). Artwork is not copied.
 */
export const commentThreadRecipe = {
    avatarSize: 32,
    replyAvatarSize: 24,
    avatarGap: spacing.xs,
    lineGap: 2,
    rowGap: spacing.sm,
    // Replies align with the parent's text column instead of an arbitrary section inset.
    replyIndent: 32 + spacing.xs,
    // The heart keeps the 44pt touch target even though the measured reference draws a smaller glyph.
    likeColumnWidth: 44,
    // Optional photo/sticker under the body; the measured reference keeps it thumbnail-sized.
    mediaMaxWidth: 160,
    mediaRadius: radius.md,
};
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
    // Loading/nonempty results must not bypass the same count contract used by empty results.
    if ((count !== null && (count < 0 || !Number.isSafeInteger(count))) || !Number.isSafeInteger(appliedFilterCount) || appliedFilterCount < 0) {
        throw new RangeError("Search counts must be nonnegative integers");
    }
    if (count === null || count > 0)
        return "none";
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
    /** Debounced typing delay; explicit submit remains a separate host action. */
    debounceMs: 300,
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
/** Keep finite negative delays at zero; reject values whose timer behavior varies by host. */
export function resolveSearchDebounceMs(value = searchScreenRecipe.debounceMs) {
    if (!Number.isFinite(value))
        throw new RangeError("Search debounceMs must be finite");
    return Math.max(0, value);
}
/** Horizontal intent preserves vertical scrolling and uses one reveal distance across renderers. */
export function timestampRevealOffset(dx, dy) {
    // A 12px dead zone and 2:1 direction bias avoid turning taps/list scrolling into a time gesture.
    return dx > 12 && dx > Math.abs(dy) * 2 ? Math.min(dx, 88) : 0;
}
/** Notification previews need an actor/type badge and a separate subject thumbnail.
 * Keep this geometry shared so inboxes do not recreate the same row per product. */
export const notificationRowRecipe = {
    gap: 12, contentGap: 4, avatarSize: 44, avatarBadgeSize: 20,
    thumbnailSize: 44, unreadSize: 6, previewLines: 2, paddingBlock: 12, paddingInline: 16,
};
/** Shared profile identity geometry; product owns the avatar content. */
export const profileSummaryRecipe = Object.freeze({ avatarSize: 72 });
/** Launcher artwork stays above its caption; product overlays may extend beyond the icon frame. */
export const iconTileRecipe = Object.freeze({ iconSize: 64, labelMaxWidth: 72, multilineLabelMaxWidth: 84, multilineLabelMinHeight: 44, ghostOpacity: 0.55, gap: 6, iconRadius: "22%" });
//# sourceMappingURL=screen-patterns.js.map