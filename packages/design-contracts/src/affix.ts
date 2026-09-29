export const affixRecipe = { edge: "top", offset: 0, position: "sticky", oversize: "flow" } as const;
export function validateAffixOffset(offset: number): number {
  if (!Number.isFinite(offset) || offset < 0) throw new TypeError("Affix offset must be finite and nonnegative");
  return offset;
}
