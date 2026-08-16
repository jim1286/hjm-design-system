import type { ToastTone } from "./component-recipes.js";
export type ToastId = string;
export type ToastAnnouncementPriority = "normal" | "high";
export type ToastPauseReason = "pointer" | "focus" | "window" | "gesture" | "programmatic";
export type ToastDismissReason = "timeout" | "action" | "close-action" | "escape" | "swipe" | "programmatic" | "queue-overflow" | "interrupted";
export type ToastDuplicatePolicy = "update" | "ignore";
export type ToastTimerUpdatePolicy = "preserve" | "restart";
export type ToastOverflowPolicy = "discard-oldest" | "discard-newest";
export type ToastActionDescriptor = Readonly<{
    label: string;
    accessibilityLabel?: string;
    onAction(): void;
    dismissOnAction?: boolean;
}>;
/**
 * Renderer-neutral copy and behavior for one notification. Copy stays plain
 * text so Web and Native can announce the exact same message without accepting
 * renderer nodes in the core package.
 */
export type ToastDescriptor = Readonly<{
    /** Stable product-owned identity used for in-place de-duplication. */
    id: ToastId;
    title?: string;
    description: string;
    tone?: ToastTone;
    /** High priority interrupts; normal priority waits for a graceful announcement. */
    priority?: ToastAnnouncementPriority;
    /** Optional localized announcement when visible copy needs extra context. */
    announcement?: string;
    /** `null` is persistent. Values below the accessible minimum are clamped. */
    durationMs?: number | null;
    action?: ToastActionDescriptor;
    /** Required localized name for the icon-only close affordance. */
    closeLabel: string;
    onDismiss?: (reason: ToastDismissReason) => void;
}>;
export type ResolvedToastActionDescriptor = Readonly<{
    label: string;
    accessibilityLabel: string;
    onAction(): void;
    dismissOnAction: boolean;
}>;
export type ResolvedToastDescriptor = Readonly<{
    id: ToastId;
    title: string | null;
    description: string;
    tone: ToastTone;
    priority: ToastAnnouncementPriority;
    announcement: string;
    durationMs: number | null;
    action: ResolvedToastActionDescriptor | null;
    closeLabel: string;
    onDismiss: ((reason: ToastDismissReason) => void) | null;
}>;
export type ToastAnnouncement = Readonly<{
    message: string;
    priority: ToastAnnouncementPriority;
}>;
export declare const toastBehaviorDefaults: {
    readonly durationMs: 5000;
    readonly minimumDurationMs: 5000;
    readonly priority: "normal";
    readonly dismissOnAction: true;
    readonly maxVisible: 1;
    readonly maxQueued: 20;
    readonly duplicatePolicy: "update";
    readonly timerUpdatePolicy: "preserve";
    readonly overflowPolicy: "discard-oldest";
};
/** Rejects ambiguous identity and inaccessible copy before anything is queued. */
export declare function validateToastDescriptor(descriptor: ToastDescriptor): void;
/** Actionable notifications persist by default; every timer has a five-second floor. */
export declare function resolveToastDuration(descriptor: ToastDescriptor): number | null;
export declare function resolveToastDescriptor(descriptor: ToastDescriptor): ResolvedToastDescriptor;
export declare function resolveToastAnnouncement(descriptor: ToastDescriptor): ToastAnnouncement;
export type ToastPhase = "queued" | "visible" | "closing" | "closed";
export type ToastTimerStatus = "waiting" | "running" | "paused" | "persistent" | "stopped";
export type ToastTimerSnapshot = Readonly<{
    status: ToastTimerStatus;
    durationMs: number | null;
    remainingMs: number | null;
    pausedBy: readonly ToastPauseReason[];
}>;
export type ToastSessionSnapshot = Readonly<{
    revision: number;
    phase: ToastPhase;
    descriptor: ResolvedToastDescriptor;
    timer: ToastTimerSnapshot;
    actionInvoked: boolean;
    dismissReason: ToastDismissReason | null;
}>;
export type ToastSession = Readonly<{
    getSnapshot(): ToastSessionSnapshot;
    subscribe(listener: () => void): () => void;
    /** Starts visibility and the timer. Queued time is never counted. */
    show(): boolean;
    update(descriptor: ToastDescriptor, timerPolicy?: ToastTimerUpdatePolicy): boolean;
    pause(reason: ToastPauseReason): boolean;
    resume(reason: ToastPauseReason): boolean;
    /** Advances a renderer-owned clock; no global timer or Date dependency exists. */
    advanceTime(elapsedMs: number): boolean;
    invokeAction(): boolean;
    dismiss(reason: ToastDismissReason): boolean;
    /** Renderers call this once exit motion or immediate reduced-motion exit finishes. */
    completeExit(): boolean;
    interrupt(): boolean;
}>;
/** Owns one notification's action, timer, and dismiss lifecycle exactly once. */
export declare function createToastSession(descriptor: ToastDescriptor): ToastSession;
export type ToastStoreOptions = Readonly<{
    maxVisible?: number;
    maxQueued?: number;
    duplicatePolicy?: ToastDuplicatePolicy;
    timerUpdatePolicy?: ToastTimerUpdatePolicy;
    overflowPolicy?: ToastOverflowPolicy;
}>;
export type ToastPublishOptions = Readonly<{
    duplicatePolicy?: ToastDuplicatePolicy;
    timerUpdatePolicy?: ToastTimerUpdatePolicy;
}>;
export type ToastPublishResult = Readonly<{
    outcome: "added";
    id: ToastId;
    position: "visible" | "queued";
}> | Readonly<{
    outcome: "updated";
    id: ToastId;
    position: "visible" | "queued";
}> | Readonly<{
    outcome: "ignored";
    id: ToastId;
    reason: "duplicate" | "closing";
}> | Readonly<{
    outcome: "discarded";
    id: ToastId;
    reason: "queue-overflow";
}>;
export type ToastStoreSnapshot = Readonly<{
    visible: readonly ToastSessionSnapshot[];
    queued: readonly ToastSessionSnapshot[];
}>;
export type ToastStore = Readonly<{
    getSnapshot(): ToastStoreSnapshot;
    subscribe(listener: () => void): () => void;
    publish(descriptor: ToastDescriptor, options?: ToastPublishOptions): ToastPublishResult;
    invokeAction(id: ToastId): boolean;
    dismiss(id: ToastId, reason: ToastDismissReason): boolean;
    /** Stable-id programmatic close shortcut. */
    close(id: ToastId): boolean;
    pause(id: ToastId, reason: ToastPauseReason): boolean;
    resume(id: ToastId, reason: ToastPauseReason): boolean;
    pauseAll(reason: ToastPauseReason): number;
    resumeAll(reason: ToastPauseReason): number;
    advanceTime(elapsedMs: number): number;
    completeExit(id: ToastId): boolean;
    /** Provider teardown closes every item exactly once without waiting for motion. */
    dispose(): boolean;
}>;
/**
 * Bounded FIFO coordinator. Visible items keep their slot through exit motion;
 * queued items begin timing only after promotion into a vacated slot.
 */
export declare function createToastStore(options?: ToastStoreOptions): ToastStore;
//# sourceMappingURL=toast.d.ts.map