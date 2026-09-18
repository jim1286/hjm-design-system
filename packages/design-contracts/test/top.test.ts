import { describe, expect, it } from "vitest";
import { behaviorRegistry } from "../src/behaviors.js";
import { componentCatalog, recipeRegistry } from "../src/catalog.js";
import { heading, typography } from "../src/foundations.js";
import { topBehavior, topDefaults, topRecipe, validateTopDescriptor } from "../src/top.js";

describe("Top descriptor", () => {
  it("requires a title and rejects empty optional copy", () => {
    expect(() => validateTopDescriptor({ title: "기록 쓰기" })).not.toThrow();
    expect(() => validateTopDescriptor({ title: " " })).toThrow(TypeError);
    expect(() => validateTopDescriptor({ title: "제목", eyebrow: "" })).toThrow(TypeError);
    expect(() => validateTopDescriptor({ title: "제목", description: " " })).toThrow(TypeError);
  });

  it("rejects sizes and heading levels outside the contract", () => {
    expect(() => validateTopDescriptor({ title: "제목", size: "huge" as never })).toThrow(/Unsupported Top size/);
    expect(() => validateTopDescriptor({ title: "제목", headingLevel: 4 as never })).toThrow(/headingLevel/);
  });

  it("defaults to the screen's own first heading", () => {
    expect(topDefaults).toEqual({ size: "large", headingLevel: 1 });
  });
});

describe("Top recipe", () => {
  it("reuses the shared type scale instead of new sizes", () => {
    expect(topRecipe.sizes.large.title).toBe(heading.level2);
    expect(topRecipe.sizes.medium.title).toBe(typography.titleLarge);
  });

  it("stays a body block: no fixed chrome, no dismiss, no keyboard", () => {
    expect(topBehavior.web.focus).toBe("none");
    expect(topBehavior.web.keyboard).toEqual([]);
    expect(topBehavior.controlled).toEqual([]);
  });

  it("binds what the catalog declares", () => {
    const entry = componentCatalog.find((item) => item.name === "Top");
    expect(entry).toMatchObject({ category: "layout", platform: "adaptive", recipe: "topRecipe", behavior: "top" });
    expect(recipeRegistry).toHaveProperty("topRecipe");
    expect(behaviorRegistry.top).toBe(topBehavior);
  });
});
