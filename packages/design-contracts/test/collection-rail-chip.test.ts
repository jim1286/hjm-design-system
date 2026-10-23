import { expect, it } from "vitest";
import { spacing } from "../src/foundations.js";
import { collectionRailRecipe, getCollectionRailTargetOffset, resolveCollectionRailLayout } from "../src/collection-rail.js";

it("lays chips out at the narrow step with the closer gap and steps one chip at a time", () => {
  const chips = resolveCollectionRailLayout(10, 390, "chip");
  expect(chips.itemWidth).toBe(collectionRailRecipe.itemMaxWidth.chip);
  expect(chips.itemWidth).toBe(144);
  expect(chips.gap).toBe(spacing.xs);
  expect(getCollectionRailTargetOffset(chips, 0, "next")).toBe(chips.itemWidth + chips.gap);
  // Card densities keep their width and the md gap.
  expect(resolveCollectionRailLayout(10, 390, "compact").gap).toBe(spacing.md);
  expect(() => resolveCollectionRailLayout(10, 390, "tiny" as "chip")).toThrow(TypeError);
});
