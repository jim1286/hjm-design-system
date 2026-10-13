/** Optional behavior adapter: no React, networking, storage or animation dependency. */
export type ActionSnapshot<T> = Readonly<{
    status: "idle";
    value: T;
}> | Readonly<{
    status: "pending" | "success";
    value: T;
    operationId: number;
}> | Readonly<{
    status: "error";
    value: T;
    operationId: number;
    error: unknown;
}>;
export type ActionTask<T> = (context: Readonly<{
    operationId: number;
}>) => T | Promise<T>;
export type ActionOptions<T> = Readonly<{
    optimisticValue?: T;
    retryable?: boolean;
}>;
export type ActionOutcome<T> = Readonly<{
    status: "success";
    value: T;
    operationId: number;
}> | Readonly<{
    status: "error";
    error: unknown;
    operationId: number;
}> | Readonly<{
    status: "blocked" | "ignored";
}>;
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
export declare function createActionSession<T>(initialValue: T): ActionSession<T>;
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
export declare function resolveSaveFeedback({ phase, dirty, valid, hasSaved, disabled }: SaveFeedbackInput): SaveFeedback;
//# sourceMappingURL=action-session.d.ts.map