import type { ToastTone } from "./component-recipes.js";

export type ToastId = string;
export type ToastAnnouncementPriority = "normal" | "high";
export type ToastPauseReason =
  | "pointer"
  | "focus"
  | "window"
  | "gesture"
  | "programmatic";
export type ToastDismissReason =
  | "timeout"
  | "action"
  | "close-action"
  | "escape"
  | "swipe"
  | "programmatic"
  | "queue-overflow"
  | "interrupted";
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

export const toastBehaviorDefaults = {
  durationMs: 5000,
  minimumDurationMs: 5000,
  priority: "normal",
  dismissOnAction: true,
  maxVisible: 1,
  maxQueued: 20,
  duplicatePolicy: "update",
  timerUpdatePolicy: "preserve",
  overflowPolicy: "discard-oldest",
} as const satisfies Readonly<{
  durationMs: number;
  minimumDurationMs: number;
  priority: ToastAnnouncementPriority;
  dismissOnAction: boolean;
  maxVisible: number;
  maxQueued: number;
  duplicatePolicy: ToastDuplicatePolicy;
  timerUpdatePolicy: ToastTimerUpdatePolicy;
  overflowPolicy: ToastOverflowPolicy;
}>;

const toastTones: readonly ToastTone[] = [
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
];

function assertCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Toast ${field} must not be empty`);
  }
}

/** Rejects ambiguous identity and inaccessible copy before anything is queued. */
export function validateToastDescriptor(descriptor: ToastDescriptor): void {
  assertCopy(descriptor.id, "id");
  if (descriptor.id !== descriptor.id.trim()) {
    throw new TypeError("Toast id must not start or end with whitespace");
  }
  assertCopy(descriptor.description, "description");
  assertCopy(descriptor.closeLabel, "closeLabel");
  if (descriptor.title !== undefined) assertCopy(descriptor.title, "title");
  if (descriptor.announcement !== undefined) {
    assertCopy(descriptor.announcement, "announcement");
  }
  if (descriptor.tone !== undefined && !toastTones.includes(descriptor.tone)) {
    throw new TypeError(`Unsupported Toast tone: ${String(descriptor.tone)}`);
  }
  if (
    descriptor.priority !== undefined &&
    descriptor.priority !== "normal" &&
    descriptor.priority !== "high"
  ) {
    throw new TypeError(`Unsupported Toast priority: ${String(descriptor.priority)}`);
  }
  if (descriptor.durationMs !== undefined && descriptor.durationMs !== null) {
    if (!Number.isFinite(descriptor.durationMs) || descriptor.durationMs <= 0) {
      throw new RangeError("Toast durationMs must be a positive finite number or null");
    }
  }
  if (descriptor.action) {
    assertCopy(descriptor.action.label, "action.label");
    if (descriptor.action.accessibilityLabel !== undefined) {
      assertCopy(descriptor.action.accessibilityLabel, "action.accessibilityLabel");
    }
  }
}

/** Actionable notifications persist by default; every timer has a five-second floor. */
export function resolveToastDuration(descriptor: ToastDescriptor): number | null {
  validateToastDescriptor(descriptor);
  if (descriptor.durationMs === null) return null;
  if (descriptor.durationMs === undefined) {
    return descriptor.action ? null : toastBehaviorDefaults.durationMs;
  }
  return Math.max(descriptor.durationMs, toastBehaviorDefaults.minimumDurationMs);
}

export function resolveToastDescriptor(
  descriptor: ToastDescriptor,
): ResolvedToastDescriptor {
  validateToastDescriptor(descriptor);
  const title = descriptor.title ?? null;
  const announcement =
    descriptor.announcement ??
    (title === null ? descriptor.description : `${title}. ${descriptor.description}`);
  const action = descriptor.action
    ? {
        label: descriptor.action.label,
        accessibilityLabel:
          descriptor.action.accessibilityLabel ?? descriptor.action.label,
        onAction: descriptor.action.onAction,
        dismissOnAction:
          descriptor.action.dismissOnAction ?? toastBehaviorDefaults.dismissOnAction,
      }
    : null;

  return {
    id: descriptor.id,
    title,
    description: descriptor.description,
    tone: descriptor.tone ?? "neutral",
    priority: descriptor.priority ?? toastBehaviorDefaults.priority,
    announcement,
    durationMs: resolveToastDuration(descriptor),
    action,
    closeLabel: descriptor.closeLabel,
    onDismiss: descriptor.onDismiss ?? null,
  };
}

export function resolveToastAnnouncement(
  descriptor: ToastDescriptor,
): ToastAnnouncement {
  const resolved = resolveToastDescriptor(descriptor);
  return { message: resolved.announcement, priority: resolved.priority };
}

export type ToastPhase = "queued" | "visible" | "closing" | "closed";
export type ToastTimerStatus =
  | "waiting"
  | "running"
  | "paused"
  | "persistent"
  | "stopped";

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

function assertElapsedTime(elapsedMs: number): void {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError("Toast elapsed time must be a non-negative finite number");
  }
}

/** Owns one notification's action, timer, and dismiss lifecycle exactly once. */
export function createToastSession(descriptor: ToastDescriptor): ToastSession {
  let resolved = resolveToastDescriptor(descriptor);
  let phase: ToastPhase = "queued";
  let revision = 0;
  let elapsedMs = 0;
  let actionInvoked = false;
  let dismissReason: ToastDismissReason | null = null;
  let dismissNotified = false;
  let cachedSnapshot: ToastSessionSnapshot | null = null;
  const pausedBy = new Set<ToastPauseReason>();
  const listeners = new Set<() => void>();

  const notify = () => {
    cachedSnapshot = null;
    for (const listener of listeners) listener();
  };
  const timerSnapshot = (): ToastTimerSnapshot => {
    if (resolved.durationMs === null) {
      return {
        status: "persistent",
        durationMs: null,
        remainingMs: null,
        pausedBy: [...pausedBy],
      };
    }
    const remainingMs = Math.max(0, resolved.durationMs - elapsedMs);
    const status: ToastTimerStatus =
      phase === "queued"
        ? "waiting"
        : phase !== "visible"
          ? "stopped"
          : pausedBy.size > 0
            ? "paused"
            : "running";
    return {
      status,
      durationMs: resolved.durationMs,
      remainingMs,
      pausedBy: [...pausedBy],
    };
  };
  const snapshot = (): ToastSessionSnapshot => {
    cachedSnapshot ??= {
      revision,
      phase,
      descriptor: resolved,
      timer: timerSnapshot(),
      actionInvoked,
      dismissReason,
    };
    return cachedSnapshot;
  };
  const announceDismiss = (reason: ToastDismissReason) => {
    if (dismissNotified) return;
    dismissNotified = true;
    resolved.onDismiss?.(reason);
  };
  const finishImmediately = (reason: ToastDismissReason): boolean => {
    if (phase === "closed") return false;
    phase = "closed";
    dismissReason = reason;
    pausedBy.clear();
    notify();
    announceDismiss(reason);
    return true;
  };

  const session: ToastSession = {
    getSnapshot: snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    show() {
      if (phase !== "queued") return false;
      phase = "visible";
      notify();
      return true;
    },
    update(nextDescriptor, timerPolicy = toastBehaviorDefaults.timerUpdatePolicy) {
      if (phase === "closing" || phase === "closed") return false;
      if (nextDescriptor.id !== resolved.id) {
        throw new TypeError("A Toast session cannot change its stable id");
      }
      if (timerPolicy !== "preserve" && timerPolicy !== "restart") {
        throw new TypeError(`Unsupported Toast timer update policy: ${String(timerPolicy)}`);
      }
      const next = resolveToastDescriptor(nextDescriptor);
      resolved = next;
      revision += 1;
      actionInvoked = false;
      dismissReason = null;
      dismissNotified = false;
      if (phase === "queued" || timerPolicy === "restart") elapsedMs = 0;

      if (
        phase === "visible" &&
        resolved.durationMs !== null &&
        elapsedMs >= resolved.durationMs
      ) {
        elapsedMs = resolved.durationMs;
        phase = "closing";
        dismissReason = "timeout";
      }
      notify();
      return true;
    },
    pause(reason) {
      if (phase !== "visible" || pausedBy.has(reason)) return false;
      pausedBy.add(reason);
      notify();
      return true;
    },
    resume(reason) {
      if (phase !== "visible" || !pausedBy.delete(reason)) return false;
      notify();
      return true;
    },
    advanceTime(deltaMs) {
      assertElapsedTime(deltaMs);
      if (
        deltaMs === 0 ||
        phase !== "visible" ||
        resolved.durationMs === null ||
        pausedBy.size > 0
      ) {
        return false;
      }
      elapsedMs = Math.min(resolved.durationMs, elapsedMs + deltaMs);
      if (elapsedMs >= resolved.durationMs) {
        phase = "closing";
        dismissReason = "timeout";
      }
      notify();
      return true;
    },
    invokeAction() {
      const action = resolved.action;
      if (phase !== "visible" || action === null || actionInvoked) return false;
      const invokedRevision = revision;
      actionInvoked = true;
      notify();
      try {
        action.onAction();
      } finally {
        if (
          action.dismissOnAction &&
          phase === "visible" &&
          revision === invokedRevision
        ) {
          phase = "closing";
          dismissReason = "action";
          pausedBy.clear();
          notify();
        }
      }
      return true;
    },
    dismiss(reason) {
      if (phase === "closing" || phase === "closed") return false;
      if (phase === "queued") return finishImmediately(reason);
      phase = "closing";
      dismissReason = reason;
      pausedBy.clear();
      notify();
      return true;
    },
    completeExit() {
      if (phase !== "closing" || dismissReason === null) return false;
      return finishImmediately(dismissReason);
    },
    interrupt() {
      if (phase === "closed") return false;
      return finishImmediately("interrupted");
    },
  };

  return session;
}

export type ToastStoreOptions = Readonly<{
  maxVisible?: number;
  maxQueued?: number;
  duplicatePolicy?: ToastDuplicatePolicy;
  timerUpdatePolicy?: ToastTimerUpdatePolicy;
  overflowPolicy?: ToastOverflowPolicy;
}>;

type ResolvedToastStoreOptions = Readonly<{
  maxVisible: number;
  maxQueued: number;
  duplicatePolicy: ToastDuplicatePolicy;
  timerUpdatePolicy: ToastTimerUpdatePolicy;
  overflowPolicy: ToastOverflowPolicy;
}>;

export type ToastPublishOptions = Readonly<{
  duplicatePolicy?: ToastDuplicatePolicy;
  timerUpdatePolicy?: ToastTimerUpdatePolicy;
}>;

export type ToastPublishResult =
  | Readonly<{ outcome: "added"; id: ToastId; position: "visible" | "queued" }>
  | Readonly<{ outcome: "updated"; id: ToastId; position: "visible" | "queued" }>
  | Readonly<{ outcome: "ignored"; id: ToastId; reason: "duplicate" | "closing" }>
  | Readonly<{ outcome: "discarded"; id: ToastId; reason: "queue-overflow" }>;

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

function resolveStoreOptions(options: ToastStoreOptions): ResolvedToastStoreOptions {
  const resolved = {
    maxVisible: options.maxVisible ?? toastBehaviorDefaults.maxVisible,
    maxQueued: options.maxQueued ?? toastBehaviorDefaults.maxQueued,
    duplicatePolicy: options.duplicatePolicy ?? toastBehaviorDefaults.duplicatePolicy,
    timerUpdatePolicy:
      options.timerUpdatePolicy ?? toastBehaviorDefaults.timerUpdatePolicy,
    overflowPolicy: options.overflowPolicy ?? toastBehaviorDefaults.overflowPolicy,
  };
  if (!Number.isInteger(resolved.maxVisible) || resolved.maxVisible < 1) {
    throw new RangeError("Toast maxVisible must be an integer of at least one");
  }
  if (!Number.isInteger(resolved.maxQueued) || resolved.maxQueued < 0) {
    throw new RangeError("Toast maxQueued must be a non-negative integer");
  }
  if (resolved.duplicatePolicy !== "update" && resolved.duplicatePolicy !== "ignore") {
    throw new TypeError(
      `Unsupported Toast duplicate policy: ${String(resolved.duplicatePolicy)}`,
    );
  }
  if (
    resolved.timerUpdatePolicy !== "preserve" &&
    resolved.timerUpdatePolicy !== "restart"
  ) {
    throw new TypeError(
      `Unsupported Toast timer update policy: ${String(resolved.timerUpdatePolicy)}`,
    );
  }
  if (
    resolved.overflowPolicy !== "discard-oldest" &&
    resolved.overflowPolicy !== "discard-newest"
  ) {
    throw new TypeError(
      `Unsupported Toast overflow policy: ${String(resolved.overflowPolicy)}`,
    );
  }
  return resolved;
}

/**
 * Bounded FIFO coordinator. Visible items keep their slot through exit motion;
 * queued items begin timing only after promotion into a vacated slot.
 */
export function createToastStore(options: ToastStoreOptions = {}): ToastStore {
  const configuration = resolveStoreOptions(options);
  const sessions = new Map<ToastId, ToastSession>();
  const unsubscribers = new Map<ToastId, () => void>();
  const visibleIds: ToastId[] = [];
  const queuedIds: ToastId[] = [];
  const listeners = new Set<() => void>();
  const globalPauseReasons = new Set<ToastPauseReason>();
  let disposed = false;
  let cachedSnapshot: ToastStoreSnapshot | null = null;

  const notify = () => {
    cachedSnapshot = null;
    for (const listener of listeners) listener();
  };
  const positionOf = (id: ToastId): "visible" | "queued" =>
    visibleIds.includes(id) ? "visible" : "queued";
  const snapshot = (): ToastStoreSnapshot => {
    cachedSnapshot ??= {
      visible: visibleIds
        .map((id) => sessions.get(id)?.getSnapshot())
        .filter((entry): entry is ToastSessionSnapshot => entry !== undefined),
      queued: queuedIds
        .map((id) => sessions.get(id)?.getSnapshot())
        .filter((entry): entry is ToastSessionSnapshot => entry !== undefined),
    };
    return cachedSnapshot;
  };
  const removeId = (ids: ToastId[], id: ToastId) => {
    const index = ids.indexOf(id);
    if (index >= 0) ids.splice(index, 1);
  };
  const detachWithoutPromotion = (id: ToastId): ToastSession | undefined => {
    const session = sessions.get(id);
    removeId(visibleIds, id);
    removeId(queuedIds, id);
    sessions.delete(id);
    unsubscribers.get(id)?.();
    unsubscribers.delete(id);
    cachedSnapshot = null;
    return session;
  };
  const promote = () => {
    while (!disposed && visibleIds.length < configuration.maxVisible) {
      const id = queuedIds.shift();
      if (id === undefined) return;
      const session = sessions.get(id);
      if (!session) continue;
      visibleIds.push(id);
      session.show();
      for (const reason of globalPauseReasons) session.pause(reason);
    }
  };
  const removeClosed = (id: ToastId) => {
    removeId(visibleIds, id);
    removeId(queuedIds, id);
    sessions.delete(id);
    unsubscribers.get(id)?.();
    unsubscribers.delete(id);
    promote();
  };
  const attach = (session: ToastSession) => {
    const id = session.getSnapshot().descriptor.id;
    sessions.set(id, session);
    const unsubscribe = session.subscribe(() => {
      if (session.getSnapshot().phase === "closed") removeClosed(id);
      notify();
    });
    unsubscribers.set(id, unsubscribe);
  };
  const discard = (descriptor: ToastDescriptor): ToastPublishResult => {
    createToastSession(descriptor).dismiss("queue-overflow");
    return { outcome: "discarded", id: descriptor.id, reason: "queue-overflow" };
  };
  const assertActive = () => {
    if (disposed) throw new Error("Cannot use a disposed Toast store");
  };

  const store: ToastStore = {
    getSnapshot: snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    publish(descriptor, publishOptions = {}) {
      assertActive();
      validateToastDescriptor(descriptor);
      const existing = sessions.get(descriptor.id);
      if (existing) {
        if (existing.getSnapshot().phase === "closing") {
          return { outcome: "ignored", id: descriptor.id, reason: "closing" };
        }
        const duplicatePolicy =
          publishOptions.duplicatePolicy ?? configuration.duplicatePolicy;
        if (duplicatePolicy !== "update" && duplicatePolicy !== "ignore") {
          throw new TypeError(
            `Unsupported Toast duplicate policy: ${String(duplicatePolicy)}`,
          );
        }
        if (duplicatePolicy === "ignore") {
          return { outcome: "ignored", id: descriptor.id, reason: "duplicate" };
        }
        existing.update(
          descriptor,
          publishOptions.timerUpdatePolicy ?? configuration.timerUpdatePolicy,
        );
        return {
          outcome: "updated",
          id: descriptor.id,
          position: positionOf(descriptor.id),
        };
      }

      if (visibleIds.length >= configuration.maxVisible) {
        if (configuration.maxQueued === 0) return discard(descriptor);
        if (queuedIds.length >= configuration.maxQueued) {
          if (configuration.overflowPolicy === "discard-newest") {
            return discard(descriptor);
          }
          const oldestQueuedId = queuedIds[0];
          if (oldestQueuedId !== undefined) {
            const oldestQueued = detachWithoutPromotion(oldestQueuedId);
            let dismissedWithoutError = false;
            try {
              oldestQueued?.dismiss("queue-overflow");
              dismissedWithoutError = true;
            } finally {
              // A throwing onDismiss must not leave external-store consumers
              // with a stale snapshot of the removed queue entry.
              if (!dismissedWithoutError) notify();
            }
            // onDismiss/store subscribers may synchronously publish or dispose.
            // Restart from the public entry point so capacity, duplicates, and
            // disposed state use the actual post-callback store.
            return store.publish(descriptor, publishOptions);
          }
        }
      }

      const session = createToastSession(descriptor);
      attach(session);
      if (visibleIds.length < configuration.maxVisible) {
        visibleIds.push(descriptor.id);
        session.show();
        for (const reason of globalPauseReasons) session.pause(reason);
        return { outcome: "added", id: descriptor.id, position: "visible" };
      }
      queuedIds.push(descriptor.id);
      notify();
      return { outcome: "added", id: descriptor.id, position: "queued" };
    },
    invokeAction(id) {
      assertActive();
      return sessions.get(id)?.invokeAction() ?? false;
    },
    dismiss(id, reason) {
      assertActive();
      return sessions.get(id)?.dismiss(reason) ?? false;
    },
    close(id) {
      assertActive();
      return sessions.get(id)?.dismiss("programmatic") ?? false;
    },
    pause(id, reason) {
      assertActive();
      return sessions.get(id)?.pause(reason) ?? false;
    },
    resume(id, reason) {
      assertActive();
      return sessions.get(id)?.resume(reason) ?? false;
    },
    pauseAll(reason) {
      assertActive();
      globalPauseReasons.add(reason);
      return [...visibleIds].reduce(
        (count, id) => count + (sessions.get(id)?.pause(reason) ? 1 : 0),
        0,
      );
    },
    resumeAll(reason) {
      assertActive();
      globalPauseReasons.delete(reason);
      return [...visibleIds].reduce(
        (count, id) => count + (sessions.get(id)?.resume(reason) ? 1 : 0),
        0,
      );
    },
    advanceTime(deltaMs) {
      assertActive();
      assertElapsedTime(deltaMs);
      return [...visibleIds].reduce(
        (count, id) => count + (sessions.get(id)?.advanceTime(deltaMs) ? 1 : 0),
        0,
      );
    },
    completeExit(id) {
      assertActive();
      return sessions.get(id)?.completeExit() ?? false;
    },
    dispose() {
      if (disposed) return false;
      disposed = true;
      globalPauseReasons.clear();
      let firstError: unknown;
      for (const session of [...sessions.values()]) {
        try {
          session.interrupt();
        } catch (error) {
          firstError ??= error;
        }
      }
      notify();
      listeners.clear();
      if (firstError !== undefined) throw firstError;
      return true;
    },
  };

  return store;
}
