export const aspectRatioDefaults = {
    ratio: "wide",
};
export const aspectRatioRecipe = {
    slots: ["root", "content"],
    defaults: aspectRatioDefaults,
    ratios: {
        square: 1,
        portrait: 3 / 4,
        landscape: 4 / 3,
        wide: 16 / 9,
    },
    sizing: {
        inline: "fill",
        block: "derive-from-ratio",
    },
};
const presets = new Set([
    "square",
    "portrait",
    "landscape",
    "wide",
]);
export function validateAspectRatioValue(value) {
    if (typeof value === "number") {
        if (!Number.isFinite(value) || value <= 0) {
            throw new RangeError("AspectRatio ratio must be a positive finite number");
        }
        return;
    }
    if (!presets.has(value)) {
        throw new TypeError(`Unsupported AspectRatio preset: ${String(value)}`);
    }
}
export function resolveAspectRatioDescriptor(descriptor = {}) {
    const value = descriptor.ratio ?? aspectRatioDefaults.ratio;
    validateAspectRatioValue(value);
    if (typeof value === "number")
        return { ratio: value, source: "custom" };
    return { ratio: aspectRatioRecipe.ratios[value], source: value };
}
//# sourceMappingURL=aspect-ratio.js.map