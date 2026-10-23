import { expect, it } from "vitest";
import { spacing } from "../src/foundations.js";
import { selectionGroupRecipe } from "../src/component-recipes.js";
import { resolveScrollRevealOffset } from "../src/behaviors.js";

it("keeps the chip rail inset and scrolls the least distance that shows an item", () => {
  expect(selectionGroupRecipe.overflow).toEqual({ default: "wrap", scrollInset: spacing.xxs });
  // Already visible: no movement.
  expect(resolveScrollRevealOffset(0, 300, 100, 80, 4)).toBe(0);
  // Past the end: the item's end plus the inset meets the viewport end.
  expect(resolveScrollRevealOffset(0, 300, 280, 80, 4)).toBe(64);
  // Before the start: the item's start minus the inset meets the viewport start, never below 0.
  expect(resolveScrollRevealOffset(200, 300, 150, 80, 4)).toBe(146);
  expect(resolveScrollRevealOffset(200, 300, 2, 80, 4)).toBe(0);
  // Without an inset this is SegmentedControl's previous rule.
  expect(resolveScrollRevealOffset(0, 300, 280, 80)).toBe(60);
});
