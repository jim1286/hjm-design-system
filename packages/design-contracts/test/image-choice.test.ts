import { describe, expect, it } from "vitest";
import {
  imageChoiceRecipe, resolveImageChoiceCaptionLines, resolveImageChoiceColumns, resolveImageChoiceOuterSize,
  resolveImageChoiceTileHeight, validateImageChoiceItemLabelLines, validateImageChoiceItems,
} from "../src/image-choice.js";

// 2026-10-18 BurnTok share sheet and creation starters: description line, two-line labels, virtualized rows.
describe("ImageChoiceGroup tile metrics", () => {
  it("reserves label lines plus one description line for the whole group", () => {
    expect(resolveImageChoiceCaptionLines({ showItemLabels: false, itemLabelLines: 1, hasDescription: false })).toBe(0);
    expect(resolveImageChoiceCaptionLines({ showItemLabels: true, itemLabelLines: 2, hasDescription: true })).toBe(3);
    expect(resolveImageChoiceCaptionLines({ showItemLabels: false, itemLabelLines: 2, hasDescription: true })).toBe(imageChoiceRecipe.itemDescriptionLines);
  });

  it("derives tile height and column count from the recipe", () => {
    const outer = resolveImageChoiceOuterSize();
    expect(outer).toBe(80);
    expect(resolveImageChoiceTileHeight(0, 16)).toBe(outer);
    expect(resolveImageChoiceTileHeight(2, 16)).toBe(outer + imageChoiceRecipe.itemLabelGap + 32);
    expect(resolveImageChoiceColumns(0)).toBe(1);
    expect(resolveImageChoiceColumns(344)).toBe(4); // 4 × 80 + 3 × 8
    expect(resolveImageChoiceColumns(343)).toBe(3);
    expect(() => resolveImageChoiceTileHeight(1, 0)).toThrow(TypeError);
  });

  it("accepts one or two label lines and rejects blank descriptions", () => {
    expect(() => validateImageChoiceItemLabelLines(2)).not.toThrow();
    expect(() => validateImageChoiceItemLabelLines(3)).toThrow(RangeError);
    expect(() => validateImageChoiceItems([{ id: "a", label: "서연", description: "보냄" }])).not.toThrow();
    expect(() => validateImageChoiceItems([{ id: "a", label: "서연", description: "  " }])).toThrow(TypeError);
  });
});
