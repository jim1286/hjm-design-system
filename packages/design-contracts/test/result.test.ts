import { describe, expect, it, vi } from "vitest";
import {
  ACCENTS,
  THEMES,
  accentFill,
  componentCatalog,
  resolveColorReference,
} from "../src/index.js";
import {
  resolveResultDescriptor,
  resultDefaults,
  resultRecipe,
  validateResultDescriptor,
  type ResultDescriptor,
} from "../src/result.js";

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

const sample: ResultDescriptor = {
  status: "success",
  title: "저장했어요",
  description: "변경 사항을 반영했습니다.",
};

describe("Result descriptor", () => {
  it("keeps a plain terminus screen valid with no actions", () => {
    expect(() => validateResultDescriptor(sample)).not.toThrow();
  });

  it("allows exactly one primary and one secondary action first", () => {
    expect(() =>
      validateResultDescriptor({
        ...sample,
        actions: [
          { label: "홈으로", onAction: () => {} },
          { label: "다시 시도", onAction: () => {} },
        ],
      }),
    ).not.toThrow();
  });

  it("rejects a third action instead of silently dropping it", () => {
    expect(() =>
      validateResultDescriptor({
        ...sample,
        actions: [
          { label: "홈으로", onAction: () => {} },
          { label: "다시 시도", onAction: () => {} },
          { label: "문의하기", onAction: () => {} },
        ],
      }),
    ).toThrow(/at most one primary and one secondary/);
  });

  it("rejects empty title/description and an unsupported status", () => {
    expect(() => validateResultDescriptor({ ...sample, title: " " })).toThrow(
      /title/,
    );
    expect(() =>
      validateResultDescriptor({ ...sample, description: " " }),
    ).toThrow(/description/);
    expect(() =>
      validateResultDescriptor({ ...sample, status: "warning" as never }),
    ).toThrow(/status/);
  });

  it("rejects an action whose onAction is not a function", () => {
    expect(() =>
      validateResultDescriptor({
        ...sample,
        actions: [{ label: "홈으로", onAction: undefined as never }],
      }),
    ).toThrow(/onAction/);
  });

  it("resolves the normative info status default and names actions by position", () => {
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    const resolved = resolveResultDescriptor({
      status: "failure",
      title: "불러오지 못했어요",
      actions: [
        { label: "다시 시도", onAction: onPrimary },
        { label: "닫기", onAction: onSecondary },
      ],
    });
    expect(resolved.description).toBeNull();
    expect(resolved.primaryAction).toMatchObject({
      label: "다시 시도",
      accessibilityLabel: "다시 시도",
    });
    expect(resolved.secondaryAction).toMatchObject({ label: "닫기" });
    expect(resultDefaults.status).toBe("info");
  });
});

describe("Result visual identity", () => {
  it("caps status to success/failure/info — no Web-page HTTP vocabulary", () => {
    expect(Object.keys(resultRecipe.tones).sort()).toEqual([
      "failure",
      "info",
      "success",
    ]);
  });

  it("promotes the shared recipe after product flow termini adopt both renderers", () => {
    expect(componentCatalog.find((entry) => entry.name === "Result")).toMatchObject({
      category: "feedback",
      platform: "shared",
      status: "beta",
      surfaceStatus: { web: "beta", native: "beta" },
    });
  });

  it("keeps every status tone readable on canvas and surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      const iconReferences = Object.values(resultRecipe.tones).map(
        (tone) => tone.icon,
      );
      for (const reference of iconReferences) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
