import { describe, expect, it } from "vitest";
import {
  ACCENTS,
  THEMES,
  accentFill,
  componentCatalog,
  resolveColorReference,
  statisticRecipe,
} from "../src/index.js";
import {
  descriptionListDefaults,
  descriptionListRecipe,
  resolveDescriptionListColumnCount,
  resolveDescriptionListDescriptor,
  validateDescriptionList,
  type DescriptionListDescriptor,
} from "../src/description-list.js";

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

const sample: DescriptionListDescriptor = {
  items: [
    { id: "grade", label: "FA 등급", value: "A등급" },
    { id: "years", label: "규정 출장 시즌", value: "6시즌" },
  ],
};

describe("DescriptionList descriptor", () => {
  it("keeps product-formatted values and stable pair identity", () => {
    expect(() => validateDescriptionList(sample)).not.toThrow();
    expect(() =>
      validateDescriptionList({ items: [{ ...sample.items[0]!, id: " " }] }),
    ).toThrow(/id/);
    expect(() =>
      validateDescriptionList({
        items: [{ ...sample.items[0]!, id: " padded " }],
      }),
    ).toThrow(/whitespace/);
    expect(() =>
      validateDescriptionList({ items: [{ ...sample.items[0]!, label: "" }] }),
    ).toThrow(/label/);
    expect(() =>
      validateDescriptionList({ items: [{ ...sample.items[0]!, value: " " }] }),
    ).toThrow(/value/);
  });

  it("rejects empty and duplicate-id groups, and an unsupported column count", () => {
    expect(() => validateDescriptionList({ items: [] })).toThrow(/at least one/);
    expect(() =>
      validateDescriptionList({ items: [sample.items[0]!, sample.items[0]!] }),
    ).toThrow(/Duplicate/);
    expect(() =>
      validateDescriptionList({ items: sample.items, columns: 3 as never }),
    ).toThrow(/columns/);
  });

  it("resolves the normative 2-column default", () => {
    expect(resolveDescriptionListDescriptor(sample).columns).toBe(2);
    expect(descriptionListDefaults.columns).toBe(2);
  });
});

describe("DescriptionList large-text reflow", () => {
  it("falls back to the requested columns when width is unknown", () => {
    expect(resolveDescriptionListColumnCount(-1, 2)).toBe(2);
    expect(resolveDescriptionListColumnCount(Number.NaN, 2)).toBe(2);
  });

  it("keeps 2 columns when both items comfortably fit", () => {
    expect(resolveDescriptionListColumnCount(400, 2, 1)).toBe(2);
  });

  it("collapses to 1 column as fontScale grows, without a per-screen threshold", () => {
    // Same fixed width; only the caller's measured fontScale changes. No
    // screen-owned `fontScale >= 1.6` branch is required to get this right.
    expect(resolveDescriptionListColumnCount(340, 2, 1)).toBe(2);
    expect(resolveDescriptionListColumnCount(340, 2, 2)).toBe(1);
  });

  it("never widens columns for a scale below 1", () => {
    expect(resolveDescriptionListColumnCount(400, 2, 0.5)).toBe(2);
  });
});

describe("DescriptionList visual identity", () => {
  it("shares the group gap/columns shape used by Statistic, sized for label-value pairs", () => {
    expect(descriptionListRecipe.group.columns).toEqual([1, 2]);
    expect(descriptionListRecipe.value.maxLines).toBeNull();
    expect(descriptionListRecipe.group.minItemWidth).not.toBe(
      statisticRecipe.group.minItemWidth,
    );
  });

  it("links the product-validated beta contract to the catalog entry", () => {
    expect(
      componentCatalog.find((entry) => entry.name === "DescriptionList"),
    ).toMatchObject({
      category: "data-display",
      platform: "shared",
      status: "beta",
    });
  });

  it("keeps label and value copy readable on canvas and surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      for (const reference of [
        descriptionListRecipe.label.color,
        descriptionListRecipe.value.color,
      ]) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
