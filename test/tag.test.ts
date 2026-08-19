import { describe, expect, it } from "vitest";
import {
  ACCENTS,
  THEMES,
  accentFill,
  chipRecipe,
  componentCatalog,
  resolveColorReference,
} from "../src/index.js";
import {
  resolveTagDescriptor,
  tagDefaults,
  tagRecipe,
  validateTagDescriptor,
  type TagDescriptor,
} from "../src/tag.js";

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

const sample: TagDescriptor = { label: "좌익수" };

describe("Tag descriptor", () => {
  it("keeps a plain visible label as the only required field", () => {
    expect(() => validateTagDescriptor(sample)).not.toThrow();
    expect(() => validateTagDescriptor({ label: "A등급", tone: "success" })).not.toThrow();
  });

  it("rejects empty label and unsupported tone", () => {
    expect(() => validateTagDescriptor({ label: " " })).toThrow(/label/);
    expect(() =>
      validateTagDescriptor({ label: "2026 시즌", tone: "danger" as never }),
    ).toThrow(/tone/);
  });

  it("resolves a normative neutral tone default", () => {
    expect(resolveTagDescriptor(sample)).toEqual({
      label: "좌익수",
      tone: "neutral",
    });
    expect(tagDefaults.tone).toBe("neutral");
  });

  it("never grows a selection, close, or press field", () => {
    const resolved = resolveTagDescriptor({ label: "A등급", tone: "brand" });
    expect(Object.keys(resolved).sort()).toEqual(["label", "tone"]);
  });
});

describe("Tag visual identity vs. Chip", () => {
  it("is not pressable and shares no interaction contract with Chip", () => {
    expect(tagRecipe).not.toHaveProperty("states");
    expect(tagRecipe).not.toHaveProperty("focus");
    expect(tagRecipe).not.toHaveProperty("selectionIndicator");
  });

  it("uses a rectangular shape distinct from Chip's pill", () => {
    expect(tagRecipe.radius).not.toBe(chipRecipe.radius);
    expect(chipRecipe.radius).toBe("full");
  });

  it("links the planned contract to the catalog entry", () => {
    expect(componentCatalog.find((entry) => entry.name === "Tag")).toMatchObject({
      category: "data-display",
      platform: "shared",
      status: "planned",
    });
  });

  it("keeps every tone readable on canvas and surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      const contentReferences = Object.values(tagRecipe.tones).map(
        (tone) => tone.content,
      );
      for (const reference of contentReferences) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
