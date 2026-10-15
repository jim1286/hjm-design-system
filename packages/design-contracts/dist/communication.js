/** Match the controlled text/maxLength UTF-16 unit; do not silently trim a user's draft. */
export function resolveComposerLimit(value, max, threshold = .8) {
    if (!Number.isSafeInteger(max) || max <= 0 || !Number.isFinite(threshold) || threshold < 0 || threshold > 1)
        throw new RangeError("Composer limit must be positive and threshold in [0,1]");
    return { used: value.length, max, near: value.length / max >= threshold, exceeded: value.length > max };
}
export function validateReplyTarget(target) {
    if (target !== null && !target.id.trim())
        throw new TypeError("Reply target requires the actual message ID");
}
//# sourceMappingURL=communication.js.map