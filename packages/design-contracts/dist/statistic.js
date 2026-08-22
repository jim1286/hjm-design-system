export const statisticDefaults = {
    trendTone: "neutral",
};
function assertCopy(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Statistic ${field} must not be empty`);
    }
}
export function validateStatisticDescriptor(descriptor) {
    assertCopy(descriptor.id, "id");
    if (descriptor.id !== descriptor.id.trim()) {
        throw new TypeError("Statistic id must not start or end with whitespace");
    }
    assertCopy(descriptor.label, "label");
    assertCopy(descriptor.value, "value");
    if (descriptor.prefix !== undefined)
        assertCopy(descriptor.prefix, "prefix");
    if (descriptor.suffix !== undefined)
        assertCopy(descriptor.suffix, "suffix");
    if (descriptor.hint !== undefined)
        assertCopy(descriptor.hint, "hint");
    if (descriptor.trend) {
        if (descriptor.trend.direction !== "up" &&
            descriptor.trend.direction !== "down" &&
            descriptor.trend.direction !== "flat") {
            throw new TypeError(`Unsupported Statistic trend direction: ${String(descriptor.trend.direction)}`);
        }
        if (descriptor.trend.tone !== undefined &&
            descriptor.trend.tone !== "neutral" &&
            descriptor.trend.tone !== "success" &&
            descriptor.trend.tone !== "warning" &&
            descriptor.trend.tone !== "danger") {
            throw new TypeError(`Unsupported Statistic trend tone: ${String(descriptor.trend.tone)}`);
        }
        assertCopy(descriptor.trend.label, "trend.label");
    }
}
export function resolveStatisticDescriptor(descriptor) {
    validateStatisticDescriptor(descriptor);
    const { trend, ...copy } = descriptor;
    if (!trend)
        return copy;
    return {
        ...copy,
        trend: {
            ...trend,
            tone: trend.tone ?? statisticDefaults.trendTone,
        },
    };
}
export function validateStatisticGroup(group) {
    if (group.items.length === 0) {
        throw new TypeError("Statistic group must contain at least one item");
    }
    if (group.columns !== undefined &&
        group.columns !== 1 &&
        group.columns !== 2 &&
        group.columns !== 3 &&
        group.columns !== 4) {
        throw new RangeError("Statistic columns must be 1, 2, 3, or 4");
    }
    const ids = new Set();
    for (const item of group.items) {
        validateStatisticDescriptor(item);
        if (ids.has(item.id)) {
            throw new TypeError(`Duplicate Statistic id: ${item.id}`);
        }
        ids.add(item.id);
    }
}
export const statisticTrendMarks = {
    up: "trendUp",
    down: "trendDown",
    flat: "trendFlat",
};
//# sourceMappingURL=statistic.js.map