/** Optional behavior adapter: no React, networking, storage or animation dependency. */
export type ActionSnapshot<T> =
  | Readonly<{ status: "idle"; value: T }>
  | Readonly<{ status: "pending" | "success"; value: T; operationId: number }>
  | Readonly<{ status: "error"; value: T; operationId: number; error: unknown }>;
export type ActionTask<T> = (context: Readonly<{ operationId: number }>) => T | Promise<T>;
export type ActionOptions<T> = Readonly<{ optimisticValue?: T; retryable?: boolean }>;
export type ActionOutcome<T> =
  | Readonly<{ status: "success"; value: T; operationId: number }>
  | Readonly<{ status: "error"; error: unknown; operationId: number }>
  | Readonly<{ status: "blocked" | "ignored" }>;
export type ActionSession<T> = Readonly<{
  getSnapshot(): ActionSnapshot<T>;
  subscribe(listener: () => void): () => void;
  run(task: ActionTask<T>, options?: ActionOptions<T>): Promise<ActionOutcome<T>>;
  retry(): Promise<ActionOutcome<T>>;
  /** Detach stale results; this does NOT cancel work already accepted by a server. */
  reset(value: T): void;
}>;

/**
 * One session per editable entity/action. Serialize mutations instead of guessing
 * how overlapping server writes should merge; applications own reconciliation.
 * See docs/action-session.md for retry, persistence and ownership boundaries.
 */
export function createActionSession<T>(initialValue: T): ActionSession<T> {
  let snapshot: ActionSnapshot<T> = { status: "idle", value: initialValue };
  let generation = 0;
  let failedAttempt: { task: ActionTask<T>; options: ActionOptions<T> } | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: ActionSnapshot<T>) => {
    snapshot = next;
    for (const listener of [...listeners]) listener();
  };
  const run: ActionSession<T>["run"] = async (task, options = {}) => {
    if (snapshot.status === "pending") return { status: "blocked" };
    const operationId = ++generation;
    const previous = snapshot.value;
    // Capture the proposal now so retry cannot pick up a caller-mutated options object.
    const proposal = { ...options };
    failedAttempt = undefined;
    publish({ status: "pending", value: "optimisticValue" in proposal ? proposal.optimisticValue as T : previous, operationId });
    if (generation !== operationId) return { status: "ignored" };
    let value: T;
    try {
      value = await task({ operationId });
    } catch (error) {
      if (generation !== operationId) return { status: "ignored" };
      // Retrying a mutation must be authorized by the product adapter (idempotency).
      failedAttempt = proposal.retryable ? { task, options: proposal } : undefined;
      publish({ status: "error", value: previous, operationId, error });
      if (generation !== operationId) return { status: "ignored" };
      return { status: "error", error, operationId };
    }
    if (generation !== operationId) return { status: "ignored" };
    publish({ status: "success", value, operationId });
    // Subscribers may synchronously switch entities; their new session must not
    // receive a stale continuation such as closing the editor after this save.
    if (generation !== operationId) return { status: "ignored" };
    return { status: "success", value, operationId };
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    run,
    retry() {
      if (snapshot.status !== "error" || !failedAttempt) return Promise.resolve({ status: "blocked" });
      return run(failedAttempt.task, failedAttempt.options);
    },
    reset(value) {
      ++generation;
      failedAttempt = undefined;
      publish({ status: "idle", value });
    },
  };
}

/** Product-owned comparisons against the last confirmed value, never an optimistic value. */
export type SaveFeedbackInput = Readonly<{
  phase: ActionSnapshot<unknown>["status"];
  dirty: boolean;
  valid: boolean;
  hasSaved: boolean;
  disabled?: boolean;
}>;
export type SaveFeedback = Readonly<{
  feedback: "pending" | "error" | "saved" | "saved-with-changes" | "unsaved" | "unchanged";
  pending: boolean;
  currentSaved: boolean;
  canSubmit: boolean;
}>;

/** Classifies current-draft feedback without owning requests, equality, validation or copy. */
export function resolveSaveFeedback({ phase, dirty, valid, hasSaved, disabled = false }: SaveFeedbackInput): SaveFeedback {
  const pending = phase === "pending";
  const currentSaved = hasSaved && !dirty;
  // A response confirms its submitted snapshot, not edits made after submission.
  // Reverting to the confirmed value also clears an obsolete failure notice.
  const feedback: SaveFeedback["feedback"] = pending ? "pending"
    : !dirty ? phase === "success" && hasSaved ? "saved" : "unchanged"
    : phase === "error" ? "error"
    : phase === "success" && hasSaved ? "saved-with-changes" : "unsaved";
  return { feedback, pending, currentSaved, canSubmit: !pending && !disabled && valid && dirty };
}
