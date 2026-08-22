import { describe, expect, it } from "vitest";
import { ACCENTS, THEMES, accentFill } from "../src/colors.js";
import {
  surfaceDefaults,
  surfaceGeometry,
  surfaceRecipe,
} from "../src/base-recipes.js";
import { cardRecipe } from "../src/card.js";
import { stackRecipe, textRecipe } from "../src/component-recipes.js";
import {
  iconButtonRecipe,
  resolveIconButtonPresentation,
} from "../src/icon-button-recipe.js";
import {
  resolveTagPresentation,
  tagRecipe,
} from "../src/tag.js";

describe("cross-platform core normalization", () => {
  it("publishes one set of Text and Stack defaults", () => {
    expect(textRecipe.defaults).toEqual({
      variant: "body",
      tone: "primary",
      emphasis: "regular",
    });
    expect(stackRecipe.defaults).toEqual({
      axis: "block",
      gap: "md",
      align: "stretch",
      justify: "start",
      wrap: false,
    });
    expect(stackRecipe.axes).toEqual({ block: "column", inline: "row" });
  });

  it("makes Surface geometry and optional borders renderer-neutral", () => {
    expect(surfaceDefaults).toEqual({
      tone: "default",
      padding: "none",
      radius: "lg",
      bordered: false,
    });
    expect(surfaceGeometry.paddings.none).toBe(0);
    expect(surfaceGeometry.paddings.md).toBe(16);
    expect(surfaceGeometry.radii.lg).toBe(16);
    expect(surfaceRecipe.accent).toMatchObject({
      border: "primary",
      borderAlpha: 0.3,
      borderAlways: false,
    });
    expect(surfaceRecipe.subtle.borderAlways).toBe(true);
  });

  it("defines one Card anatomy above Surface", () => {
    expect(cardRecipe.slots).toEqual([
      "root",
      "media",
      "body",
      "title",
      "description",
      "content",
      "actions",
    ]);
    expect(cardRecipe.defaults).toEqual({
      tone: "default",
      selected: false,
      bordered: true,
      headingLevel: 3,
      padding: "md",
    });
    expect(cardRecipe.selectedTone).toBe("accent");
  });

  it("resolves Tag recipe colors for Native without a second tone table", () => {
    const palette = {
      theme: THEMES.light,
      statusAccents: ACCENTS.light,
      statusAccentFills: accentFill,
    };
    expect(resolveTagPresentation("success", palette)).toEqual({
      background: "rgba(6, 95, 70, 0.1)",
      content: ACCENTS.light.success,
      border: "rgba(6, 95, 70, 0.3)",
    });
    expect(resolveTagPresentation("neutral", palette).border).toBeNull();
    expect(tagRecipe.radius).toBe("sm");
  });

  it("defines shared IconButton axes and resolves renderer-neutral colors", () => {
    const palette = {
      theme: THEMES.light,
      statusAccents: ACCENTS.light,
      statusAccentFills: accentFill,
    };
    expect(iconButtonRecipe.defaults).toEqual({
      tone: "ghost",
      size: "medium",
      shape: "rounded",
    });
    expect(iconButtonRecipe.sizes.small).toEqual({
      diameter: 36,
      hitSlop: 4,
      glyph: "sm",
    });
    expect(resolveIconButtonPresentation("ghost", palette)).toEqual({
      background: null,
      content: THEMES.light.textMuted,
      border: null,
    });
    expect(resolveIconButtonPresentation("secondary", palette)).toEqual({
      background: THEMES.light.surfaceAlt,
      content: THEMES.light.text,
      border: THEMES.light.border,
    });
  });
});
