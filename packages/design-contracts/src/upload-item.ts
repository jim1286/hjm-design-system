import type { ColorReference } from "./color-references.js";
import type { BehaviorContract } from "./behaviors.js";
import { focusIndicatorContract } from "./component-contracts.js";
import {
  progressRecipe,
  type ProgressSize,
  type ProgressTone,
} from "./progress-recipe.js";
import { control, layout, opacity, radius, spacing, type TextVariant } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

export type UploadItemStatus = "pending" | "uploading" | "success" | "error";

export type UploadItemPendingState = Readonly<{ status: "pending" }>;

export type UploadItemUploadingState = Readonly<{
  status: "uploading";
  /** Product-measured transfer fraction. `null` means indeterminate — size unknown. */
  progress: number | null;
  /** Product-formatted announcement, e.g. "1.6MB / 3.2MB 업로드 중". */
  progressLabel?: string;
}>;

export type UploadItemSuccessState = Readonly<{ status: "success" }>;

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
export type UploadItemState =
  | UploadItemPendingState
  | UploadItemUploadingState
  | UploadItemSuccessState
  | UploadItemErrorState;

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

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`UploadItem ${field} must not be empty`);
  }
}

export function validateUploadItemState(state: UploadItemState): void {
  const status = (state as Readonly<{ status?: unknown }>).status;
  if (
    status !== "pending" &&
    status !== "uploading" &&
    status !== "success" &&
    status !== "error"
  ) {
    throw new TypeError(`Unsupported UploadItem status: ${String(status)}`);
  }
  if (status === "uploading") {
    const { progress, progressLabel } = state as UploadItemUploadingState;
    if (progress !== null && (!Number.isFinite(progress) || progress < 0 || progress > 1)) {
      throw new RangeError("UploadItem progress must be null or a number between 0 and 1");
    }
    if (progressLabel !== undefined) assertNonEmpty(progressLabel, "progressLabel");
  }
  if (status === "error") {
    assertNonEmpty((state as UploadItemErrorState).message, "error state message");
  }
}

export function validateUploadItemDescriptor(descriptor: UploadItemDescriptor): void {
  assertNonEmpty(descriptor.id, "id");
  assertNonEmpty(descriptor.name, "name");
  if (descriptor.sizeLabel !== undefined) assertNonEmpty(descriptor.sizeLabel, "sizeLabel");
  validateUploadItemState(descriptor.state);
}

export function validateUploadItemLabels(labels: UploadItemLabels): void {
  for (const field of ["pending", "uploading", "success", "cancel", "retry"] as const) {
    assertNonEmpty(labels[field], `labels.${field}`);
  }
}

/** Rejects duplicate stable ids so a rendered list never desyncs a row's identity. */
export function validateUploadItemList(items: readonly UploadItemDescriptor[]): void {
  const ids = new Set<string>();
  for (const item of items) {
    validateUploadItemDescriptor(item);
    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate UploadItem id: ${item.id}`);
    }
    ids.add(item.id);
  }
}

export type UploadItemAction = "cancel" | "retry";

/**
 * The only place cancel/retry availability is computed. Renderers must not
 * keep their own copy of this rule — it would drift from `status` the first
 * time a new state is added.
 */
export function getUploadItemAvailableAction(state: UploadItemState): UploadItemAction | null {
  if (state.status === "uploading") return "cancel";
  if (state.status === "error") return "retry";
  return null;
}

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
export function resolveUploadItemAnnouncement(
  descriptor: UploadItemDescriptor,
  labels: UploadItemLabels,
): UploadItemAnnouncement {
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
    const description =
      state.progress === null ? labels.uploading : `${Math.round(state.progress * 100)}%`;
    return { label: descriptor.name, description };
  }
  if (state.status === "success") {
    return { label: descriptor.name, description: labels.success };
  }
  return { label: descriptor.name, description: state.message };
}

export const uploadItemRecipe = {
  slots: ["root", "icon", "name", "meta", "progress", "statusText", "cancel", "retry"] as const,
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
} as const satisfies {
  slots: readonly [
    "root",
    "icon",
    "name",
    "meta",
    "progress",
    "statusText",
    "cancel",
    "retry",
  ];
  defaults: { size: "medium" };
  row: { minHeight: number; paddingHorizontal: number; gap: number; radius: keyof typeof radius };
  name: { color: ColorReference; textVariant: TextVariant };
  meta: { color: ColorReference; textVariant: TextVariant };
  statusTones: Record<UploadItemStatus, ColorReference>;
  progress: { size: ProgressSize; tone: ProgressTone; errorTone: ProgressTone };
  action: { minTarget: number; color: ColorReference; dangerColor: ColorReference };
  states: { focus: typeof focusIndicatorContract; disabledOpacity: number };
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
} as const satisfies BehaviorContract;
