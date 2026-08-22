import { describe, expect, it } from "vitest";
import {
  componentCatalog,
  getIconDirectionality,
  getIconTransform,
  iconRecipe,
  resolveIconDescriptor,
  semanticIconNames,
  statisticRecipe,
  toastRecipe,
  menuRecipe,
  validateIconDescriptor,
} from "../src/index.js";

describe("Icon semantic contract", () => {
  it("resolves a quiet decorative default without an accessibility name", () => {
    const resolved = resolveIconDescriptor({ name: "search" });
    expect(resolved).toEqual({
      name: "search",
      size: "md",
      tone: "secondary",
      weight: "regular",
      directionality: "fixed",
      decorative: true,
    });
    expect(resolved).toMatchObject(iconRecipe.defaults);
  });

  it("requires visible meaning to have a concise accessible label", () => {
    expect(() =>
      validateIconDescriptor({
        name: "warning",
        decorative: false,
        accessibilityLabel: " ",
      }),
    ).toThrow(/accessibilityLabel/);
    expect(() =>
      validateIconDescriptor({
        name: "warning",
        decorative: false,
        accessibilityLabel: "Warning",
        tone: "decorative" as never,
      }),
    ).toThrow(/decorative tone/);
    expect(
      resolveIconDescriptor({
        name: "warning",
        decorative: false,
        accessibilityLabel: "Warning",
        tone: "warning",
      }),
    ).toMatchObject({ decorative: false, accessibilityLabel: "Warning" });
  });

  it("mirrors only logical navigation marks in RTL", () => {
    for (const name of ["back", "forward", "chevronStart", "chevronEnd"]) {
      expect(getIconDirectionality(name)).toBe("mirror-in-rtl");
    }
    expect(getIconDirectionality("chevronDown")).toBe("fixed");
    expect(getIconTransform("mirror-in-rtl", "rtl")).toBe("mirror-inline");
    expect(getIconTransform("mirror-in-rtl", "ltr")).toBe("none");
    expect(getIconTransform("fixed", "rtl")).toBe("none");
  });

  it("links the beta renderer contract proven across product slices", () => {
    expect(new Set(semanticIconNames).size).toBe(semanticIconNames.length);
    expect(iconRecipe.stroke).toEqual({
      lineCap: "round",
      lineJoin: "round",
      scaling: "proportional",
    });
    expect(iconRecipe.weights).toEqual({ regular: 2, strong: 2.5 });
    expect(componentCatalog.find((entry) => entry.name === "Icon")).toMatchObject({
      platform: "shared",
      status: "beta",
      recipe: "iconRecipe",
    });
  });

  it("keeps every shared recipe mark inside the semantic registry", () => {
    const names = new Set<string>(semanticIconNames);
    const recipeMarks = [
      menuRecipe.dangerIndicator.mark,
      ...Object.values(statisticRecipe.trend.marks),
      ...Object.values(toastRecipe.tones).map((tone) => tone.mark),
    ];
    for (const mark of recipeMarks) expect(names.has(mark)).toBe(true);
  });

  it("rejects malformed product extension names and unsupported runtime axes", () => {
    expect(() => validateIconDescriptor({ name: " " })).toThrow(/name/);
    expect(() => validateIconDescriptor({ name: " product " })).toThrow(/whitespace/);
    expect(() => validateIconDescriptor({ name: "product", size: "huge" as never })).toThrow(
      /size/,
    );
    expect(() =>
      validateIconDescriptor({ name: "product", directionality: "rotate" as never }),
    ).toThrow(/directionality/);
    expect(() =>
      validateIconDescriptor({
        name: "warning",
        decorative: "false",
        accessibilityLabel: "Warning",
      } as never),
    ).toThrow(/decorative/);
    expect(() =>
      validateIconDescriptor({
        name: "warning",
        decorative: true,
        accessibilityLabel: "Warning",
      } as never),
    ).toThrow(/must not provide/);
  });
});
