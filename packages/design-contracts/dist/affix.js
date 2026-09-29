export const affixRecipe = { edge: "top", offset: 0, position: "sticky", oversize: "flow" };
export function validateAffixOffset(offset) {
    if (!Number.isFinite(offset) || offset < 0)
        throw new TypeError("Affix offset must be finite and nonnegative");
    return offset;
}
//# sourceMappingURL=affix.js.map