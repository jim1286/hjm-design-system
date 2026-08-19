export type UploadItemStatus = "pending" | "uploading" | "success" | "error";
export type UploadItemPendingState = Readonly<{
    status: "pending";
}>;
export type UploadItemUploadingState = Readonly<{
    status: "uploading";
    /** Product-measured transfer fraction. `null` means indeterminate — size unknown. */
    progress: number | null;
    /** Product-formatted announcement, e.g. "1.6MB / 3.2MB 업로드 중". */
    progressLabel?: string;
}>;
export type UploadItemSuccessState = Readonly<{
    status: "success";
}>;
export type UploadItemErrorState = Readonly<{
    status: "error";
    /** States the problem and the next action, e.g. "네트워크 오류입니다. 다시 시도해주세요." */
    message: string;
}>;
/**
 * Cancel and retry are never stored as separate booleans: deriving them from
 * `status` (see `getUploadItemAvailableAction`) makes "cancel while error" or
 * "retry while uploading" unrepresentable, the same way `SheetOpenState` and
 * `LoadMoreState` close off invalid combinations by construction.
 */
export type UploadItemState = UploadItemPendingState | UploadItemUploadingState | UploadItemSuccessState | UploadItemErrorState;
export type UploadItemDescriptor = Readonly<{
    id: string;
    name: string;
    /** Product-formatted size, e.g. "1.2 MB" — HJM does not format bytes. */
    sizeLabel?: string;
    state: UploadItemState;
}>;
export type UploadItemLabels = Readonly<{
    pending: string;
    /** Fallback when `progress` is `null` or `progressLabel` is absent. */
    uploading: string;
    success: string;
    cancel: string;
    retry: string;
}>;
export declare function validateUploadItemState(state: UploadItemState): void;
export declare function validateUploadItemDescriptor(descriptor: UploadItemDescriptor): void;
export declare function validateUploadItemLabels(labels: UploadItemLabels): void;
/** Rejects duplicate stable ids so a rendered list never desyncs a row's identity. */
export declare function validateUploadItemList(items: readonly UploadItemDescriptor[]): void;
export type UploadItemAction = "cancel" | "retry";
/**
 * The only place cancel/retry availability is computed. Renderers must not
 * keep their own copy of this rule — it would drift from `status` the first
 * time a new state is added.
 */
export declare function getUploadItemAvailableAction(state: UploadItemState): UploadItemAction | null;
export type UploadItemAnnouncement = Readonly<{
    /** Accessible name — the file name, kept independent of status (Statistic precedent). */
    label: string;
    /** Accessible description/live-region text. Never color-only. */
    description: string;
}>;
/**
 * Falls back to a rounded percent when a product supplies numeric `progress`
 * but no `progressLabel` — the one place this module computes visible copy
 * itself, mirroring Slider's raw-value fallback rather than Statistic's
 * strict "product always formats" rule, because an uploading row with no
 * numeric feedback at all is a worse default than a plain percentage.
 */
export declare function resolveUploadItemAnnouncement(descriptor: UploadItemDescriptor, labels: UploadItemLabels): UploadItemAnnouncement;
export declare const uploadItemRecipe: {
    readonly slots: readonly ["root", "icon", "name", "meta", "progress", "statusText", "cancel", "retry"];
    readonly defaults: {
        readonly size: "medium";
    };
    readonly row: {
        readonly minHeight: 68;
        readonly paddingHorizontal: 16;
        readonly gap: 12;
        readonly radius: "md";
    };
    readonly name: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
    };
    readonly meta: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
    };
    readonly statusTones: {
        readonly pending: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly uploading: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly success: Readonly<{
            source: "accent";
            key: "success";
            alpha?: number;
        }>;
        readonly error: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    /** Reuses `progressRecipe` verbatim — no second progress bar. */
    readonly progress: {
        readonly size: "medium";
        readonly tone: "brand";
        readonly errorTone: "danger";
    };
    readonly action: {
        readonly minTarget: 44;
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly dangerColor: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly disabledOpacity: 0.5;
    };
};
/**
 * `stateAxes.content` maps status onto the common axis
 * (pending→idle, uploading→loading, success→complete, error→error).
 * `loadingMore`/`empty` do not apply — one row is never paginated.
 */
export declare const uploadItemBehavior: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["descriptor", "labels"];
    readonly events: readonly ["onCancel", "onRetry"];
    readonly stateAxes: {
        readonly content: readonly ["idle", "loading", "complete", "error"];
    };
    readonly web: {
        readonly roles: readonly ["group", "progressbar", "button"];
        readonly keyboard: readonly ["Tab", "Enter", "Space"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["progressbar", "button"];
        readonly states: readonly ["busy"];
        readonly actions: readonly ["cancel", "retry"];
    };
    readonly scenarios: readonly ["progress-is-announced-as-a-sentence-not-only-a-filled-bar", "cancel-is-reachable-only-while-uploading", "retry-is-reachable-only-while-error", "pending-and-success-expose-no-destructive-or-retry-action", "indeterminate-progress-falls-back-to-a-static-uploading-label", "reuses-the-shared-progress-recipe-instead-of-a-new-bar", "duplicate-ids-in-a-rendered-list-are-rejected"];
};
//# sourceMappingURL=upload-item.d.ts.map