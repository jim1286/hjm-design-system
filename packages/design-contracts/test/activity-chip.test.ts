import { describe, expect, it } from "vitest";
import {
  ACCENTS,
  THEMES,
  accentFill,
  activityChipRecipe,
  control,
  resolveActivityChipDescriptor,
  resolveColorReference,
} from "../src/index.js";
import { contrastRatio } from "../src/palette-contrast.js";

describe("ActivityChip descriptor", () => {
  it("defaults the spoken label, emphasis and collapsed state", () => {
    expect(resolveActivityChipDescriptor({ label: "다듬는 중" })).toEqual({
      label: "다듬는 중",
      accessibilityLabel: "다듬는 중",
      emphasis: "default",
      expanded: false,
    });
    expect(
      resolveActivityChipDescriptor({ label: "완료", accessibilityLabel: "똑쟁이 작업 완료, 결과 보기", emphasis: "emphasis", expanded: true }),
    ).toEqual({ label: "완료", accessibilityLabel: "똑쟁이 작업 완료, 결과 보기", emphasis: "emphasis", expanded: true });
  });

  it("rejects empty copy and unknown emphasis", () => {
    expect(() => resolveActivityChipDescriptor({ label: " " })).toThrow(TypeError);
    expect(() => resolveActivityChipDescriptor({ label: "a", accessibilityLabel: "" })).toThrow(TypeError);
    expect(() => resolveActivityChipDescriptor({ label: "a", emphasis: "loud" as never })).toThrow(TypeError);
    expect(() => resolveActivityChipDescriptor({ label: "a", expanded: "yes" as never })).toThrow(TypeError);
  });
});

describe("ActivityChip recipe", () => {
  it("keeps one 44pt touch target with the media inside it", () => {
    expect(activityChipRecipe.root.minHeight).toBeGreaterThanOrEqual(control.minTouchTarget);
    expect(activityChipRecipe.media.size).toBeLessThan(activityChipRecipe.root.minHeight);
    expect(activityChipRecipe.label.maxLines).toBe(1);
  });

  it("keeps label contrast for both emphases in both themes", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = { theme: THEMES[themeName], statusAccents: ACCENTS[themeName], statusAccentFills: accentFill };
      for (const [emphasis, pair] of Object.entries(activityChipRecipe.emphasis)) {
        const foreground = resolveColorReference(pair.foreground, palette);
        const background = resolveColorReference(pair.background, palette);
        expect(contrastRatio(foreground, background), `${themeName}/${emphasis}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
