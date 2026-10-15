/** Actual transport counts only. Learning the total never manufactures completed work. */
export function resolveTransferObservation(next, previous = null) {
    if (!Number.isFinite(next.completed) || next.completed < 0 || (next.total !== null && (!Number.isFinite(next.total) || next.total <= 0 || next.completed > next.total)))
        throw new RangeError("Transfer observations require nonnegative completed work and a positive known total");
    if (previous && next.completed < previous.completed)
        throw new RangeError("Transfer progress cannot rewind within one operation");
    return Object.freeze({ completed: next.completed, total: next.total });
}
/** An abort request is not proof of cancellation: the adapter must reject with AbortError. */
export function isConfirmedTransferAbort(error, signal) {
    return signal.aborted && error !== null && typeof error === "object" && "name" in error && error.name === "AbortError";
}
//# sourceMappingURL=transfer-task.js.map