import { expect, it } from "vitest";
import { listRowRecipe } from "../src/component-recipes.js";
import { semanticColors } from "../src/semantic-colors.js";

it("keeps ordinary rows neutral and exposes destructive destination emphasis", () => {
  expect(listRowRecipe.defaults.tone).toBe("default");
  expect(listRowRecipe.tones.default.titleColor).toEqual(listRowRecipe.title.color);
  expect(listRowRecipe.tones.danger.titleColor).toEqual(semanticColors.content.danger);
});
