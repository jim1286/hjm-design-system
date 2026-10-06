function validateScrollMetrics({ offset, contentSize, viewportSize }) {
    if (![offset, contentSize, viewportSize].every(Number.isFinite) || contentSize < 0 || viewportSize < 0) {
        throw new RangeError('Scroll metrics must be finite with nonnegative sizes');
    }
}
export function resolveScrollProgress(metrics) {
    validateScrollMetrics(metrics);
    const { offset, contentSize, viewportSize } = metrics;
    // Unmeasured hosts are not complete; content that fits a measured viewport is.
    if (viewportSize === 0)
        return 0;
    const extent = contentSize - viewportSize;
    return extent <= 0 ? 1 : Math.min(1, Math.max(0, offset / extent));
}
/** Whether more content exists in either logical direction; not a scroll action. */
export function resolveScrollEdges(metrics) {
    validateScrollMetrics(metrics);
    const { offset, contentSize, viewportSize } = metrics;
    // The reference blur obscured the last row even at the end. One logical pixel
    // tolerates integer content/client dimensions paired with fractional offsets;
    // exact equality would leave that edge covered. See progressive-blur adoption.
    const tolerance = 1;
    const extent = contentSize - viewportSize;
    if (viewportSize === 0 || extent <= tolerance)
        return { before: false, after: false };
    const boundedOffset = Math.min(extent, Math.max(0, offset));
    return { before: boundedOffset > tolerance, after: extent - boundedOffset > tolerance };
}
//# sourceMappingURL=scroll-progress.js.map