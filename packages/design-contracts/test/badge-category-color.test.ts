import { describe, expect, it } from "vitest";
import { THEMES } from "../src/colors.js";
import { contrastRatio } from "../src/palette-contrast.js";
import { badgeRecipe, resolveBadgeCategoryColor } from "../src/component-recipes.js";

describe("Badge categoryColor", () => {
  it("picks the label ink that reaches AA on a product fill", () => {
    const series = resolveBadgeCategoryColor({ light: "#C2185B", dark: "#C2185B" }, { theme: "light", variant: "filled", palette: THEMES.light });
    expect(series).toEqual({ background: "#C2185B", content: THEMES.light.onStatusFill, border: null });
    // A light gold plate keeps a dark label instead of the white status ink.
    const gold = resolveBadgeCategoryColor({ light: "#F2C94C", dark: "#F2C94C" }, { theme: "dark", variant: "filled", palette: THEMES.dark });
    expect(gold.content).toBe(badgeRecipe.category.darkInk);
    expect(contrastRatio(gold.content, gold.background!)).toBeGreaterThanOrEqual(4.5);
  });

  it("uses the theme's own value for outline labels and rejects unreadable colors", () => {
    expect(resolveBadgeCategoryColor({ light: "#1762A0", dark: "#7FB8F0" }, { theme: "dark", variant: "outline", palette: THEMES.dark }))
      .toEqual({ background: null, content: "#7FB8F0", border: "#7FB8F0" });
    expect(() => resolveBadgeCategoryColor({ light: "#1762A0", dark: "#1762A0" }, { theme: "dark", variant: "outline", palette: THEMES.dark })).toThrow(RangeError);
    expect(() => resolveBadgeCategoryColor({ light: "#7a7a7a", dark: "#7a7a7a" }, { theme: "light", variant: "filled", palette: THEMES.light })).toThrow(RangeError);
    expect(() => resolveBadgeCategoryColor({ light: "red", dark: "#000000" }, { theme: "light", variant: "filled", palette: THEMES.light })).toThrow(TypeError);
  });

  it("hands adornment callbacks the regular Icon stroke", () => {
    expect(badgeRecipe.iconStrokeWidth).toBe(2);
  });
});
