import { expect, it } from "vitest";
import { listRowRecipe, validateListRowTrailingAccessory } from "../src/component-recipes.js";

it("declares the disclosure accessory and rejects undeclared ones", () => {
  expect(listRowRecipe.defaults.trailingAccessory).toBe("none");
  expect(listRowRecipe.accessories.disclosure).toMatchObject({ icon: "chevronEnd", glyph: "sm" });
  expect(() => validateListRowTrailingAccessory("disclosure")).not.toThrow();
  expect(() => validateListRowTrailingAccessory("chevron")).toThrow(TypeError);
});
