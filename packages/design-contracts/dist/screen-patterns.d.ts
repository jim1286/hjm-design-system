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
    disabled?: boolean;
    pending?: boolean;
    attachmentCount?: number;
}>;
export declare function canSubmitMessage({ value, disabled, pending, attachmentCount }: MessageComposerDescriptor): boolean;
/** Bubble alignment expresses authorship, not delivery; delivery text always comes from the product receipt. */
export type ChatMessageDescriptor = Readonly<{
    direction: "incoming" | "outgoing";
    author: string;
    timestamp: string;
    deliveryLabel?: string;
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
    removeLabel: string;
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
//# sourceMappingURL=screen-patterns.d.ts.map