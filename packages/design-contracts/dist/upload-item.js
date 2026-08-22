import { focusIndicatorContract } from "./component-contracts.js";
import { progressRecipe, } from "./progress-recipe.js";
import { control, layout, opacity, radius, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`UploadItem ${field} must not be empty`);
    }
}
export function validateUploadItemState(state) {
    const status = state.status;
    if (status !== "pending" &&
        status !== "uploading" &&
        status !== "success" &&
        status !== "error") {
        throw new TypeError(`Unsupported UploadItem status: ${String(status)}`);
    }
    if (status === "uploading") {
        const { progress, progressLabel } = state;
        if (progress !== null && (!Number.isFinite(progress) || progress < 0 || progress > 1)) {
            throw new RangeError("UploadItem progress must be null or a number between 0 and 1");
        }
        if (progressLabel !== undefined)
            assertNonEmpty(progressLabel, "progressLabel");
    }
    if (status === "error") {
        assertNonEmpty(state.message, "error state message");
    }
}
export function validateUploadItemDescriptor(descriptor) {
    assertNonEmpty(descriptor.id, "id");
    assertNonEmpty(descriptor.name, "name");
    if (descriptor.sizeLabel !== undefined)
        assertNonEmpty(descriptor.sizeLabel, "sizeLabel");
    validateUploadItemState(descriptor.state);
}
export function validateUploadItemLabels(labels) {
    for (const field of ["pending", "uploading", "success", "cancel", "retry"]) {
        assertNonEmpty(labels[field], `labels.${field}`);
    }
}
/** Rejects duplicate stable ids so a rendered list never desyncs a row's identity. */
export function validateUploadItemList(items) {
    const ids = new Set();
    for (const item of items) {
        validateUploadItemDescriptor(item);
        if (ids.has(item.id)) {
            throw new TypeError(`Duplicate UploadItem id: ${item.id}`);
        }
        ids.add(item.id);
    }
}
/**
 * The only place cancel/retry availability is computed. Renderers must not
 * keep their own copy of this rule — it would drift from `status` the first
 * time a new state is added.
 */
export function getUploadItemAvailableAction(state) {
    if (state.status === "uploading")
        return "cancel";
    if (state.status === "error")
        return "retry";
    return null;
}
/**
 * Falls back to a rounded percent when a product supplies numeric `progress`
 * but no `progressLabel` — the one place this module computes visible copy
 * itself, mirroring Slider's raw-value fallback rather than Statistic's
 * strict "product always formats" rule, because an uploading row with no
 * numeric feedback at all is a worse default than a plain percentage.
 */
export function resolveUploadItemAnnouncement(descriptor, labels) {
    validateUploadItemDescriptor(descriptor);
    validateUploadItemLabels(labels);
    const { state } = descriptor;
    if (state.status === "pending") {
        return { label: descriptor.name, description: labels.pending };
    }
    if (state.status === "uploading") {
        if (state.progressLabel) {
            return { label: descriptor.name, description: state.progressLabel };
        }
        const description = state.progress === null ? labels.uploading : `${Math.round(state.progress * 100)}%`;
        return { label: descriptor.name, description };
    }
    if (state.status === "success") {
        return { label: descriptor.name, description: labels.success };
    }
    return { label: descriptor.name, description: state.message };
}
export const uploadItemRecipe = {
    slots: ["root", "icon", "name", "meta", "progress", "statusText", "cancel", "retry"],
    defaults: { size: "medium" },
    row: {
        minHeight: layout.rowHeight.twoLine,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        radius: "md",
    },
    name: { color: semanticColors.content.body, textVariant: "body" },
    meta: { color: semanticColors.content.secondary, textVariant: "label" },
    statusTones: {
        pending: semanticColors.content.secondary,
        uploading: semanticColors.content.brand,
        success: semanticColors.feedback.success.foreground,
        error: semanticColors.content.danger,
    },
    /** Reuses `progressRecipe` verbatim — no second progress bar. */
    progress: {
        size: progressRecipe.defaults.size,
        tone: progressRecipe.defaults.tone,
        errorTone: "danger",
    },
    action: {
        minTarget: control.minTouchTarget,
        color: semanticColors.content.brand,
        dangerColor: semanticColors.content.danger,
    },
    states: {
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
    },
};
/**
 * `stateAxes.content` maps status onto the common axis
 * (pending→idle, uploading→loading, success→complete, error→error).
 * `loadingMore`/`empty` do not apply — one row is never paginated.
 */
export const uploadItemBehavior = {
    controlled: [],
    inputs: ["descriptor", "labels"],
    events: ["onCancel", "onRetry"],
    stateAxes: {
        content: ["idle", "loading", "complete", "error"],
    },
    web: {
        roles: ["group", "progressbar", "button"],
        keyboard: ["Tab", "Enter", "Space"],
        focus: "native",
    },
    native: {
        roles: ["progressbar", "button"],
        states: ["busy"],
        actions: ["cancel", "retry"],
    },
    scenarios: [
        "progress-is-announced-as-a-sentence-not-only-a-filled-bar",
        "cancel-is-reachable-only-while-uploading",
        "retry-is-reachable-only-while-error",
        "pending-and-success-expose-no-destructive-or-retry-action",
        "indeterminate-progress-falls-back-to-a-static-uploading-label",
        "reuses-the-shared-progress-recipe-instead-of-a-new-bar",
        "duplicate-ids-in-a-rendered-list-are-rejected",
    ],
};
//# sourceMappingURL=upload-item.js.map