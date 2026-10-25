import { fontWeight, spacing, typography } from "./foundations.js";
/** Conversation previews reserve metadata and unread status while truncating the message. */
export const conversationRowRecipe = {
    // Standard member portrait (2026-10-25); message bubbles retain their compact avatar recipe.
    avatarSize: 48,
    unreadSize: 10,
    gap: spacing.sm,
    paddingInline: spacing.md,
    paddingBlock: 10,
    contentGap: 2,
    // Read rows use the title weight; unread rows step up to semibold, the heaviest non-display weight
    // (800/700 before the 2026-10-17 lighter scale, "굵기 좀더 줄여").
    titleWeight: typography.title.fontWeight,
    unreadTitleWeight: fontWeight.semibold,
    unreadPreviewWeight: fontWeight.semibold,
};
//# sourceMappingURL=conversation-row.js.map