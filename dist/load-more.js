export const loadMoreBehaviorDefaults = {
    mode: "automatic",
};
function assertNonEmpty(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`LoadMore ${field} must not be empty`);
    }
}
export function validateLoadMoreState(state) {
    const runtimeStatus = state.status;
    if (runtimeStatus !== "ready" &&
        runtimeStatus !== "loading" &&
        runtimeStatus !== "error" &&
        runtimeStatus !== "complete") {
        throw new TypeError(`Unsupported LoadMore status: ${String(runtimeStatus)}`);
    }
    if (state.status === "complete")
        return;
    assertNonEmpty(state.requestKey, "requestKey");
    if (state.requestKey !== state.requestKey.trim()) {
        throw new TypeError("LoadMore requestKey must not start or end with whitespace");
    }
    if (state.status === "error")
        assertNonEmpty(state.message, "message");
}
export function validateLoadMoreLabels(labels) {
    if (labels === null || typeof labels !== "object") {
        throw new TypeError("LoadMore labels must be an object");
    }
    for (const field of ["loadMore", "loading", "retry", "complete"]) {
        const value = labels[field];
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new TypeError(`LoadMore labels.${field} must not be empty`);
        }
    }
}
export function validateLoadMoreDescriptor(descriptor) {
    validateLoadMoreState(descriptor.state);
    validateLoadMoreLabels(descriptor.labels);
}
export function canRequestLoadMore(state, mode, reason) {
    validateLoadMoreState(state);
    if (mode !== "automatic" && mode !== "manual") {
        throw new TypeError(`Unsupported LoadMore mode: ${String(mode)}`);
    }
    if (reason !== "viewport" && reason !== "manual" && reason !== "retry") {
        throw new TypeError(`Unsupported LoadMore request reason: ${String(reason)}`);
    }
    if (reason === "viewport") {
        return mode === "automatic" && state.status === "ready";
    }
    if (reason === "manual")
        return state.status === "ready";
    return state.status === "error";
}
/**
 * Prevents duplicate and out-of-order page requests without owning collection
 * data. Query state remains product-owned; this controller only gates events.
 */
export function createLoadMoreController(options) {
    const mode = options.mode ?? loadMoreBehaviorDefaults.mode;
    if (mode !== "automatic" && mode !== "manual") {
        throw new TypeError(`Unsupported LoadMore mode: ${String(mode)}`);
    }
    if (typeof options.onLoadMore !== "function") {
        throw new TypeError("LoadMore onLoadMore must be a function");
    }
    let inFlightRequestKey = null;
    let disposed = false;
    let cachedSnapshot = null;
    const snapshot = () => {
        cachedSnapshot ??= { mode, inFlightRequestKey, disposed };
        return cachedSnapshot;
    };
    const invalidate = () => {
        cachedSnapshot = null;
    };
    return {
        getSnapshot: snapshot,
        async request(state, reason) {
            if (disposed)
                throw new Error("Cannot use a disposed LoadMore controller");
            if (!canRequestLoadMore(state, mode, reason)) {
                return reason === "viewport" && mode === "manual"
                    ? "blocked-by-mode"
                    : "blocked-by-state";
            }
            // `canRequestLoadMore` rejects complete, but keep the discriminant local
            // so emitted types never treat its absent requestKey as a valid cursor.
            if (state.status === "complete")
                return "blocked-by-state";
            if (inFlightRequestKey !== null)
                return "already-requesting";
            const requestKey = state.requestKey;
            inFlightRequestKey = requestKey;
            invalidate();
            try {
                const pending = options.onLoadMore({ requestKey, reason });
                if (pending === null ||
                    typeof pending !== "object" ||
                    typeof pending.then !== "function") {
                    throw new TypeError("LoadMore onLoadMore must return a Promise that settles with the page request");
                }
                await pending;
                return "started";
            }
            finally {
                if (inFlightRequestKey === requestKey) {
                    inFlightRequestKey = null;
                    invalidate();
                }
            }
        },
        dispose() {
            if (disposed)
                return false;
            disposed = true;
            inFlightRequestKey = null;
            invalidate();
            return true;
        },
    };
}
//# sourceMappingURL=load-more.js.map