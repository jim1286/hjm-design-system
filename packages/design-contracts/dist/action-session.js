/**
 * One session per editable entity/action. Serialize mutations instead of guessing
 * how overlapping server writes should merge; applications own reconciliation.
 * See docs/action-session.md for retry, persistence and ownership boundaries.
 */
export function createActionSession(initialValue) {
    let snapshot = { status: "idle", value: initialValue };
    let generation = 0;
    let failedAttempt;
    const listeners = new Set();
    const publish = (next) => {
        snapshot = next;
        for (const listener of [...listeners])
            listener();
    };
    const run = async (task, options = {}) => {
        if (snapshot.status === "pending")
            return { status: "blocked" };
        const operationId = ++generation;
        const previous = snapshot.value;
        // Capture the proposal now so retry cannot pick up a caller-mutated options object.
        const proposal = { ...options };
        failedAttempt = undefined;
        publish({ status: "pending", value: "optimisticValue" in proposal ? proposal.optimisticValue : previous, operationId });
        if (generation !== operationId)
            return { status: "ignored" };
        let value;
        try {
            value = await task({ operationId });
        }
        catch (error) {
            if (generation !== operationId)
                return { status: "ignored" };
            // Retrying a mutation must be authorized by the product adapter (idempotency).
            failedAttempt = proposal.retryable ? { task, options: proposal } : undefined;
            publish({ status: "error", value: previous, operationId, error });
            return { status: "error", error, operationId };
        }
        if (generation !== operationId)
            return { status: "ignored" };
        publish({ status: "success", value, operationId });
        return { status: "success", value, operationId };
    };
    return {
        getSnapshot: () => snapshot,
        subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
        run,
        retry() {
            if (snapshot.status !== "error" || !failedAttempt)
                return Promise.resolve({ status: "blocked" });
            return run(failedAttempt.task, failedAttempt.options);
        },
        reset(value) {
            ++generation;
            failedAttempt = undefined;
            publish({ status: "idle", value });
        },
    };
}
//# sourceMappingURL=action-session.js.map