import { describe, expect, it } from "vitest";
import {
  ACCENTS,
  THEMES,
  accentFill,
  componentCatalog,
  resolveColorReference,
  resolveStatisticDescriptor,
  statisticDefaults,
  statisticRecipe,
  statisticTrendMarks,
  validateStatisticDescriptor,
  validateStatisticGroup,
  type StatisticDescriptor,
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

const sample: StatisticDescriptor = {
  id: "home-runs",
  label: "Home runs",
  value: "24",
  suffix: "HR",
  hint: "Season total",
};

describe("Statistic descriptor", () => {
  it("keeps product-formatted value copy and stable identity", () => {
    expect(() => validateStatisticDescriptor(sample)).not.toThrow();
    expect(() => validateStatisticDescriptor({ ...sample, id: " " })).toThrow(/id/);
    expect(() => validateStatisticDescriptor({ ...sample, id: " padded " })).toThrow(
      /whitespace/,
    );
    expect(() => validateStatisticDescriptor({ ...sample, label: "" })).toThrow(
      /label/,
    );
    expect(() => validateStatisticDescriptor({ ...sample, value: "\n" })).toThrow(
      /value/,
    );
  });

  it("requires a visible non-color trend label and separates direction from tone", () => {
    expect(() =>
      validateStatisticDescriptor({
        ...sample,
        trend: { direction: "up", tone: "danger", label: "12% more" },
      }),
    ).not.toThrow();
    expect(() =>
      validateStatisticDescriptor({
        ...sample,
        trend: { direction: "up", tone: "success", label: " " },
      }),
    ).toThrow(/trend.label/);
    expect(new Set(Object.values(statisticTrendMarks)).size).toBe(3);
  });

  it("rejects empty and duplicate groups", () => {
    expect(() => validateStatisticGroup({ items: [] })).toThrow(/at least one/);
    expect(() => validateStatisticGroup({ items: [sample, sample] })).toThrow(
      /Duplicate/,
    );
    expect(() => validateStatisticGroup({ items: [sample], columns: 5 as never })).toThrow(
      /columns/,
    );
  });
});

describe("Statistic visual identity", () => {
  it("keeps values tabular and trend semantics non-color", () => {
    expect(statisticRecipe.value.numericVariant).toBe("tabular");
    expect(statisticRecipe.value.maxLines).toBeNull();
    expect(statisticRecipe.trend.marks).toEqual(statisticTrendMarks);
    expect(statisticRecipe.group.columns).toEqual([1, 2, 3, 4]);
  });

  it("uses one normative neutral trend fallback", () => {
    expect(
      resolveStatisticDescriptor({
        ...sample,
        trend: { direction: "flat", label: "No change" },
      }).trend,
    ).toEqual({ direction: "flat", label: "No change", tone: "neutral" });
    expect(statisticDefaults.trendTone).toBe("neutral");
  });

  it("links the beta renderer contract proven by a product vertical slice", () => {
    expect(componentCatalog.find((entry) => entry.name === "Statistic")).toMatchObject({
      platform: "shared",
      status: "beta",
      recipe: "statisticRecipe",
    });
    expect(componentCatalog.find((entry) => entry.name === "Statistic")).not.toHaveProperty(
      "behavior",
    );
  });

  it("keeps every essential copy role readable on canvas and surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      for (const reference of [
        statisticRecipe.label.color,
        statisticRecipe.value.color,
        statisticRecipe.affix.color,
        statisticRecipe.hint.color,
        ...Object.values(statisticRecipe.trend.tones),
      ]) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
