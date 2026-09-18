import { describe, expect, it } from "vitest";
import { behaviorRegistry } from "../src/behaviors.js";
import { componentCatalog, recipeRegistry } from "../src/catalog.js";
import { heading, typography } from "../src/foundations.js";
import {
  headingBehavior,
  headingRecipe,
  resolveHeadingSemanticLevel,
  validateHeadingDescriptor,
} from "../src/heading.js";

describe("Heading", () => {
  it("exposes the existing scale without inventing sizes", () => {
    expect(headingRecipe.levels).toBe(heading);
    // The largest exposed step is well above the Text scale, which is the gap
    // this contract closes.
    expect(headingRecipe.levels.level1.fontSize).toBeGreaterThan(typography.heading.fontSize);
  });

  it("derives the document level from the visual level unless told otherwise", () => {
    expect(resolveHeadingSemanticLevel({ level: "level1" })).toBe(1);
    expect(resolveHeadingSemanticLevel({ level: "level4" })).toBe(4);
    // A big card title that is structurally an h4 is a legitimate combination.
    expect(resolveHeadingSemanticLevel({ level: "level2", semanticLevel: 4 })).toBe(4);
  });

  it("rejects unknown levels on both axes", () => {
    expect(() => validateHeadingDescriptor({ level: "level9" as never })).toThrow(/Unsupported Heading level/);
    expect(() => validateHeadingDescriptor({ level: "level2", semanticLevel: 7 as never })).toThrow(/semanticLevel/);
  });

  it("stays a primitive: no layout, no state", () => {
    expect(headingBehavior.controlled).toEqual([]);
    expect(headingBehavior.web.focus).toBe("none");
    expect(headingRecipe.slots).toEqual(["root"]);
    const entry = componentCatalog.find((item) => item.name === "Heading");
    expect(entry).toMatchObject({ category: "foundation", platform: "shared", recipe: "headingRecipe" });
    expect(recipeRegistry).toHaveProperty("headingRecipe");
    expect(behaviorRegistry.heading).toBe(headingBehavior);
  });
});
