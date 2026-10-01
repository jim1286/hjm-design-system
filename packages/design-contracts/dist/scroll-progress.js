export function resolveScrollProgress({ offset, contentSize, viewportSize }) {
    if (![offset, contentSize, viewportSize].every(Number.isFinite) || contentSize < 0 || viewportSize < 0)
        throw new RangeError('Scroll metrics must be finite with nonnegative sizes');
    // Unmeasured hosts are not complete; content that fits a measured viewport is.
    if (viewportSize === 0)
        return 0;
    const extent = contentSize - viewportSize;
    return extent <= 0 ? 1 : Math.min(1, Math.max(0, offset / extent));
}
//# sourceMappingURL=scroll-progress.js.map