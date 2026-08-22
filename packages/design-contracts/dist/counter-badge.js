/** Shared defaults usable without importing the visual recipe barrel. */
export const counterBadgeDefaults = {
    tone: "danger",
    size: "medium",
    variant: "inline",
    max: 99,
};
export function formatCounterBadgeCount(count, max = counterBadgeDefaults.max) {
    const normalizedCount = Number.isFinite(count)
        ? Math.max(0, Math.trunc(count))
        : 0;
    if (normalizedCount === 0)
        return null;
    const normalizedMax = Number.isFinite(max)
        ? Math.max(1, Math.trunc(max))
        : counterBadgeDefaults.max;
    return normalizedCount > normalizedMax
        ? `${normalizedMax}+`
        : String(normalizedCount);
}
//# sourceMappingURL=counter-badge.js.map