import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as designSystem from "../src/index.js";
import {
  ACCENTS,
  THEMES,
  accentFill,
  accentTint,
  brandGradient,
  buttonRecipe,
  control,
  fieldRecipe,
  isThemePreference,
  onAccentFill,
  onBrandGradient,
  overlay,
  radius,
  scrim,
  spacing,
  surfaceRecipe,
  typography,
  withAlpha,
} from "../src/index.js";

function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return (
    0.2126 * (channels[0] ?? 0) +
    0.7152 * (channels[1] ?? 0) +
    0.0722 * (channels[2] ?? 0)
  );
}

function contrast(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function composite(foreground: string, background: string, alpha: number): string {
  const channels = (hex: string) =>
    [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  const fg = channels(foreground);
  const bg = channels(background);
  return `#${fg
    .map((value, index) =>
      Math.round(value * alpha + (bg[index] ?? 0) * (1 - alpha))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

describe("platform-neutral public contract", () => {
  it("keeps platform imports out of runtime source", () => {
    const files = ["colors.ts", "foundations.ts", "recipes.ts", "index.ts"];
    for (const file of files) {
      const path = fileURLToPath(new URL(`../src/${file}`, import.meta.url));
      const source = readFileSync(path, "utf8");
      expect(source).not.toMatch(
        /from\s+["'](?:react|react-native|react-dom|expo|next(?:\/|["']))/,
      );
    }
  });

  it("does not expose application storage or domain names", () => {
    expect(designSystem).not.toHaveProperty("THEME_STORAGE_KEY");
    const publicNamesAndValues = `${Object.keys(designSystem).join("|")}|${JSON.stringify(
      designSystem,
    )}`.toLowerCase();
    expect(publicNamesAndValues).not.toMatch(
      /burntok|yajalal|samsung|hanwha|player_movement/,
    );
    expect(Object.keys(ACCENTS.light)).toEqual([
      "info",
      "success",
      "warning",
      "attention",
    ]);
  });

  it("validates theme preferences without owning persistence", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("sepia")).toBe(false);
  });
});

describe("color and accessibility contracts", () => {
  it("keeps light and dark semantic color keys in sync", () => {
    expect(Object.keys(THEMES.light)).toEqual(Object.keys(THEMES.dark));
  });

  it("keeps action label contrast at WCAG AA", () => {
    for (const theme of Object.values(THEMES)) {
      expect(contrast(theme.onPrimary, theme.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.onDanger, theme.dangerFill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps body text readable on every surface", () => {
    for (const theme of Object.values(THEMES)) {
      for (const foreground of ["text", "textBody", "textMuted"] as const) {
        for (const background of ["bg", "surface", "surfaceAlt"] as const) {
          expect(contrast(theme[foreground], theme[background])).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("keeps the text ramp ordered from strong to weak", () => {
    for (const theme of Object.values(THEMES)) {
      const ramp = ["text", "textBody", "textMuted", "textSub", "textWeak"] as const;
      const ratios = ramp.map((key) => contrast(theme[key], theme.bg));
      expect(ratios).toEqual([...ratios].sort((a, b) => b - a));
    }
  });

  it("keeps generic accent labels readable on tinted badges", () => {
    for (const themeName of ["light", "dark"] as const) {
      for (const tone of Object.values(ACCENTS[themeName])) {
        for (const surface of ["bg", "surface"] as const) {
          const background = THEMES[themeName][surface];
          expect(contrast(tone, background)).toBeGreaterThanOrEqual(4.5);
          expect(
            contrast(tone, composite(tone, background, accentTint.base)),
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("keeps solid accent labels readable", () => {
    expect(Object.keys(accentFill)).toEqual(Object.keys(ACCENTS.light));
    for (const fill of Object.values(accentFill)) {
      expect(contrast(onAccentFill, fill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("pins the cross-platform brand gradient", () => {
    for (const stop of [brandGradient.from, brandGradient.to]) {
      expect(stop).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(contrast(onBrandGradient, brandGradient.to)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(onBrandGradient, brandGradient.from)).toBeGreaterThanOrEqual(4.5);
  });

  it("applies alpha only to valid inputs", () => {
    expect(withAlpha("#0369a1", 0.3)).toBe("rgba(3, 105, 161, 0.3)");
    expect(() => withAlpha("blue", 1)).toThrow(TypeError);
    expect(() => withAlpha("#0369a1", Number.NaN)).toThrow(RangeError);
    expect(() => withAlpha("#0369a1", 1.1)).toThrow(RangeError);
  });
});

describe("foundation and recipe contracts", () => {
  it("uses monotonic spacing, radius, and typography scales", () => {
    expect(Object.values(spacing)).toEqual(
      [...Object.values(spacing)].sort((a, b) => a - b),
    );
    expect(Object.values(radius)).toEqual(
      [...Object.values(radius)].sort((a, b) => a - b),
    );
    const sizes = Object.values(typography).map((value) => value.fontSize);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    for (const variant of Object.values(typography)) {
      expect(variant.lineHeight).toBeGreaterThan(variant.fontSize);
    }
  });

  it("keeps every interactive control at least 44 units tall", () => {
    expect(control.minTouchTarget).toBeGreaterThanOrEqual(44);
    for (const size of Object.keys(control.buttonHeight) as Array<
      keyof typeof control.buttonHeight
    >) {
      expect(control.buttonHeight[size] + control.buttonHitSlop[size] * 2).toBeGreaterThanOrEqual(
        control.minTouchTarget,
      );
    }
    expect(fieldRecipe.minHeight).toBeGreaterThanOrEqual(control.minTouchTarget);
  });

  it("defines the complete button API", () => {
    expect(Object.keys(buttonRecipe.tones)).toEqual([
      "primary",
      "secondary",
      "ghost",
      "danger",
    ]);
    expect(Object.keys(buttonRecipe.sizes)).toEqual(["small", "medium", "large"]);
    for (const size of Object.values(buttonRecipe.sizes)) {
      expect(typography).toHaveProperty(size.textVariant);
    }
  });

  it("points every recipe color key at a semantic color", () => {
    const isColor = (key: string | null) => key === null || key in THEMES.light;
    for (const tone of Object.values(buttonRecipe.tones)) {
      expect(isColor(tone.background)).toBe(true);
      expect(isColor(tone.content)).toBe(true);
      expect(isColor(tone.border)).toBe(true);
    }
    for (const tone of Object.values(surfaceRecipe)) {
      expect(isColor(tone.background)).toBe(true);
      expect(isColor(tone.border)).toBe(true);
      expect(tone.borderAlpha).toBeGreaterThan(0);
      expect(tone.borderAlpha).toBeLessThanOrEqual(1);
    }
    for (const state of Object.values(fieldRecipe.states)) {
      expect(isColor(state.border)).toBe(true);
    }
  });

  it("uses one strong modal scrim contract", () => {
    const alpha = Number(/rgba\([^)]*,\s*([\d.]+)\)$/.exec(scrim)?.[1]);
    expect(alpha).toBe(overlay.scrim);
    expect(alpha).toBeGreaterThanOrEqual(0.5);
    expect(overlay.veil).toBeLessThan(overlay.scrim);
  });
});
