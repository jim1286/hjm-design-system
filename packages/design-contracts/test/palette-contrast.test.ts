import { describe, expect, it } from "vitest";
import { THEMES } from "../src/colors.js";
import {
  checkBrandPaletteContrast,
  checkPaletteContrast,
  contrastRatio,
  paletteContrastRules,
} from "../src/palette-contrast.js";

describe("palette contrast checker", () => {
  it("computes the WCAG ratio", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
    expect(() => contrastRatio("#fff", "#ffffff")).toThrow(TypeError);
  });

  it("passes both default HJM palettes", () => {
    expect(checkPaletteContrast(THEMES.light)).toEqual([]);
    expect(checkPaletteContrast(THEMES.dark)).toEqual([]);
  });

  it("covers the text, action label and control boundary pairs", () => {
    const keys = paletteContrastRules.map(({ foreground, background }) => `${foreground}/${background}`);
    for (const pair of [
      "text/bg", "textSub/surface", "contentBrand/bg", "danger/surface",
      "onPrimary/primary", "onDanger/dangerFill", "borderControl/surface", "textWeak/bg",
    ]) expect(keys).toContain(pair);
    // textWeak is the disabled/decorative tier: held to the boundary minimum, never to text AA.
    expect(paletteContrastRules.find(({ foreground }) => foreground === "textWeak")).toMatchObject({
      minimum: 3,
      kind: "non-text",
    });
  });

  it("reports each failing pair with its ratio", () => {
    const findings = checkPaletteContrast({ ...THEMES.light, textMuted: "#b0b8c1", onPrimary: "#9abcde" });
    expect(findings.map(({ foreground, background }) => `${foreground}/${background}`)).toEqual([
      "textMuted/bg",
      "textMuted/surface",
      "onPrimary/primary",
    ]);
    expect(findings[0]!.ratio).toBeLessThan(4.5);
  });

  it("merges a brandPalette over the defaults per theme like the Provider", () => {
    const result = checkBrandPaletteContrast({ light: { primary: "#7dd3fc" } });
    expect(result.light.map(({ foreground, background }) => `${foreground}/${background}`)).toEqual([
      "onPrimary/primary",
      "primary/bg",
      "primary/surface",
    ]);
    expect(result.dark).toEqual([]);
  });
});
