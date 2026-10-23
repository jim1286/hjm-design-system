export const affixRecipe = {
    edge: "top",
    offset: 0,
    position: "sticky",
    oversize: "flow",
    defaults: { layer: "sticky", fill: "canvas" },
};
export function validateAffixPresentation(layerStep, fill) {
    if (layerStep !== "base" && layerStep !== "sticky")
        throw new TypeError(`Unsupported Affix layer: ${String(layerStep)}`);
    if (fill !== "canvas" && fill !== "none")
        throw new TypeError(`Unsupported Affix fill: ${String(fill)}`);
}
export function validateAffixOffset(offset) {
    if (!Number.isFinite(offset) || offset < 0)
        throw new TypeError("Affix offset must be finite and nonnegative");
    return offset;
}
//# sourceMappingURL=affix.js.map