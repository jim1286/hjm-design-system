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
//# sourceMappingURL=screen-patterns.js.map