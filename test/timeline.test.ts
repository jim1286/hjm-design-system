import { describe, expect, it, vi } from "vitest";

import { ACCENTS, THEMES, accentFill } from "../src/colors.js";
import { resolveColorReference } from "../src/color-references.js";
import {
  resolveTimelineDescriptor,
  timelineDefaults,
  timelineRecipe,
  validateTimelineDescriptor,
  validateTimelineItemDescriptor,
  type TimelineDescriptor,
} from "../src/timeline.js";

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

const items: TimelineDescriptor["items"] = [
  { id: "p1", label: "안타", timestamp: "1회 초", description: "좌익수 앞 안타로 1루 진출" },
  { id: "p2", label: "도루", timestamp: "1회 초", tone: "info" },
  { id: "p3", label: "득점", timestamp: "1회 초", tone: "success" },
];

const descriptor: TimelineDescriptor = { items };

const composeAccessibleName = ({
  position,
  total,
  label,
}: {
  position: number;
  total: number;
  label: string;
}) => `${total}건 중 ${position}번째: ${label}`;

describe("Timeline descriptor validation", () => {
  it("accepts a well-formed item with every optional field", () => {
    expect(() =>
      validateTimelineItemDescriptor({
        id: "a",
        label: "안타",
        timestamp: "1회 초",
        description: "설명",
        tone: "success",
      }),
    ).not.toThrow();
  });

  it("accepts an item with only the base collection fields", () => {
    expect(() => validateTimelineItemDescriptor({ id: "a", label: "안타" })).not.toThrow();
  });

  it("accepts a single-item descriptor", () => {
    expect(() =>
      validateTimelineDescriptor({ items: [items[0]!] }),
    ).not.toThrow();
  });

  it("rejects an empty item list", () => {
    expect(() => validateTimelineDescriptor({ items: [] })).toThrow(
      /at least one/,
    );
  });

  it("rejects duplicate, empty, and padded item identity", () => {
    expect(() =>
      validateTimelineDescriptor({ items: [items[0]!, items[0]!] }),
    ).toThrow(/Duplicate/);
    expect(() => validateTimelineItemDescriptor({ id: " ", label: "A" })).toThrow(
      /id/,
    );
    expect(() => validateTimelineItemDescriptor({ id: " a ", label: "A" })).toThrow(
      /whitespace/,
    );
    expect(() => validateTimelineItemDescriptor({ id: "a", label: "" })).toThrow(
      /label/,
    );
  });

  it("rejects blank optional copy instead of silently accepting it", () => {
    expect(() =>
      validateTimelineItemDescriptor({ id: "a", label: "A", timestamp: "  " }),
    ).toThrow(/timestamp/);
    expect(() =>
      validateTimelineItemDescriptor({ id: "a", label: "A", description: "  " }),
    ).toThrow(/description/);
  });

  it("rejects an unsupported item tone", () => {
    expect(() =>
      validateTimelineItemDescriptor({ id: "a", label: "A", tone: "danger" as never }),
    ).toThrow(/tone/);
  });
});

describe("Timeline order resolution", () => {
  it("attaches position, total, and the default tone in item order", () => {
    const resolved = resolveTimelineDescriptor(descriptor, { composeAccessibleName });
    expect(resolved.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(resolved.every((item) => item.total === 3)).toBe(true);
    expect(resolved[0]?.tone).toBe(timelineDefaults.itemTone);
    expect(resolved[1]?.tone).toBe("info");
    expect(resolved[2]?.tone).toBe("success");
  });

  it("never derives a status from position — every item passes through unchanged", () => {
    const resolved = resolveTimelineDescriptor(descriptor, { composeAccessibleName });
    expect(resolved[0]).not.toHaveProperty("status");
    expect(resolved[0]?.label).toBe("안타");
    expect(resolved[0]?.timestamp).toBe("1회 초");
    expect(resolved[0]?.description).toBe("좌익수 앞 안타로 1루 진출");
  });

  it("composes the accessible name from order and label", () => {
    const composer = vi.fn(composeAccessibleName);
    const resolved = resolveTimelineDescriptor(descriptor, {
      composeAccessibleName: composer,
    });
    expect(composer).toHaveBeenCalledWith({ position: 2, total: 3, label: "도루" });
    expect(resolved[1]?.accessibleName).toBe("3건 중 2번째: 도루");
  });

  it("rejects a composer that is missing or returns empty copy", () => {
    expect(() =>
      resolveTimelineDescriptor(descriptor, {
        composeAccessibleName: undefined as never,
      }),
    ).toThrow(/composeAccessibleName/);
    expect(() =>
      resolveTimelineDescriptor(descriptor, {
        composeAccessibleName: () => "  ",
      }),
    ).toThrow(/composeAccessibleName/);
  });
});

describe("Timeline visual identity", () => {
  it("exposes only the four generic dot tones, never a product or danger tone", () => {
    expect(Object.keys(timelineRecipe.dot.tones).sort()).toEqual([
      "attention",
      "info",
      "neutral",
      "success",
    ]);
  });

  it("uses a single connector tone, unlike Steps' reached/unreached pair", () => {
    expect(timelineRecipe.connector.tone).not.toHaveProperty("reached");
    expect(timelineRecipe.connector.tone).not.toHaveProperty("unreached");
  });

  it("keeps label, timestamp, and description text readable on canvas and surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      for (const reference of [
        timelineRecipe.label.color,
        timelineRecipe.timestamp.color,
        timelineRecipe.description.color,
      ]) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("keeps every dot fill color above the 3:1 non-text boundary", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      for (const tone of Object.values(timelineRecipe.dot.tones)) {
        const foreground = resolveColorReference(tone.fill, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });
});
