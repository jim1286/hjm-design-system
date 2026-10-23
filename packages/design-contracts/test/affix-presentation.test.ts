import { expect, it } from "vitest";
import { affixRecipe, validateAffixPresentation } from "../src/affix.js";
import { layer } from "../src/foundations.js";

it("defaults to the shared sticky layer on the canvas and rejects other steps", () => {
  expect(affixRecipe.defaults).toEqual({ layer: "sticky", fill: "canvas" });
  expect(layer[affixRecipe.defaults.layer]).toBe(100);
  expect(() => validateAffixPresentation("base", "none")).not.toThrow();
  expect(() => validateAffixPresentation("modal", "canvas")).toThrow(TypeError);
  expect(() => validateAffixPresentation("sticky", "surface")).toThrow(TypeError);
});
