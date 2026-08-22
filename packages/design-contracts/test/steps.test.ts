import { describe, expect, it, vi } from "vitest";

import { ACCENTS, THEMES, accentFill } from "../src/colors.js";
import { resolveColorReference } from "../src/color-references.js";
import { componentCatalog, recipeRegistry } from "../src/catalog.js";
import { semanticIconNames } from "../src/icon.js";
import {
  isStepReached,
  resolveStepsDescriptor,
  stepsDefaults,
  stepsRecipe,
  validateStepItemDescriptor,
  validateStepsDescriptor,
  validateStepsStatusLabels,
  type StepsDescriptor,
  type StepsStatusLabels,
} from "../src/steps.js";

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

const steps: StepsDescriptor["steps"] = [
  { id: "welcome", label: "환영" },
  { id: "team", label: "구단 고르기", description: "응원할 팀을 선택해요" },
  { id: "players", label: "관심 선수" },
  { id: "notifications", label: "알림" },
  { id: "ready", label: "완료" },
];

const descriptor: StepsDescriptor = { steps, currentStepId: "team" };

const statusLabels: StepsStatusLabels = {
  pending: "예정",
  current: "진행 중",
  complete: "완료",
  error: "오류",
};

const composeAccessibleName = ({
  position,
  total,
  label,
}: {
  position: number;
  total: number;
  label: string;
}) => `${total}단계 중 ${position}단계: ${label}`;

describe("Steps descriptor validation", () => {
  it("accepts a well-formed item with and without a description", () => {
    expect(() => validateStepItemDescriptor({ id: "a", label: "A" })).not.toThrow();
    expect(() =>
      validateStepItemDescriptor({ id: "a", label: "A", description: "설명" }),
    ).not.toThrow();
  });

  it("accepts a minimal two-step descriptor with the cursor at either end", () => {
    expect(() =>
      validateStepsDescriptor({ steps, currentStepId: "welcome" }),
    ).not.toThrow();
    expect(() =>
      validateStepsDescriptor({ steps, currentStepId: "ready" }),
    ).not.toThrow();
    expect(() => validateStepsDescriptor(descriptor)).not.toThrow();
  });

  it("accepts an explicit error cursor status", () => {
    expect(() =>
      validateStepsDescriptor({ ...descriptor, currentStepStatus: "error" }),
    ).not.toThrow();
  });

  it("rejects fewer than two steps", () => {
    expect(() =>
      validateStepsDescriptor({ steps: [steps[0]!], currentStepId: "welcome" }),
    ).toThrow(/at least two/);
    expect(() =>
      validateStepsDescriptor({ steps: [], currentStepId: "welcome" } as never),
    ).toThrow(/at least two/);
  });

  it("rejects duplicate, empty, and padded item identity", () => {
    expect(() =>
      validateStepsDescriptor({
        steps: [steps[0]!, steps[0]!],
        currentStepId: "welcome",
      }),
    ).toThrow(/Duplicate/);
    expect(() => validateStepItemDescriptor({ id: " ", label: "A" })).toThrow(/id/);
    expect(() => validateStepItemDescriptor({ id: " a ", label: "A" })).toThrow(
      /whitespace/,
    );
    expect(() => validateStepItemDescriptor({ id: "a", label: "" })).toThrow(/label/);
    expect(() =>
      validateStepItemDescriptor({ id: "a", label: "A", description: "  " }),
    ).toThrow(/description/);
  });

  it("rejects a cursor id absent from the steps", () => {
    expect(() =>
      validateStepsDescriptor({ steps, currentStepId: "missing" as never }),
    ).toThrow(/currentStepId/);
  });

  it("rejects an unsupported cursor status", () => {
    expect(() =>
      validateStepsDescriptor({
        ...descriptor,
        currentStepStatus: "complete" as never,
      }),
    ).toThrow(/currentStepStatus/);
    expect(() =>
      validateStepsDescriptor({
        ...descriptor,
        currentStepStatus: "nope" as never,
      }),
    ).toThrow(/currentStepStatus/);
  });

  it("rejects an incomplete or empty status labels bag", () => {
    expect(() => validateStepsStatusLabels(statusLabels)).not.toThrow();
    expect(() =>
      validateStepsStatusLabels({ ...statusLabels, error: "" }),
    ).toThrow(/error/);
    expect(() => validateStepsStatusLabels(null as never)).toThrow(/object/);
  });
});

describe("Steps status derivation", () => {
  it("derives complete before the cursor, current at the cursor, pending after", () => {
    const resolved = resolveStepsDescriptor(descriptor, {
      statusLabels,
      composeAccessibleName,
    });
    expect(resolved.map((step) => step.status)).toEqual([
      "complete",
      "current",
      "pending",
      "pending",
      "pending",
    ]);
    expect(stepsDefaults.currentStepStatus).toBe("current");
  });

  it("only the cursor step takes the explicit error status", () => {
    const resolved = resolveStepsDescriptor(
      { ...descriptor, currentStepStatus: "error" },
      { statusLabels, composeAccessibleName },
    );
    expect(resolved.map((step) => step.status)).toEqual([
      "complete",
      "error",
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("attaches position, total, composed accessible name, and status label", () => {
    const composer = vi.fn(composeAccessibleName);
    const resolved = resolveStepsDescriptor(descriptor, {
      statusLabels,
      composeAccessibleName: composer,
    });
    expect(composer).toHaveBeenCalledWith({
      position: 2,
      total: 5,
      label: "구단 고르기",
    });
    expect(resolved[1]).toMatchObject({
      position: 2,
      total: 5,
      accessibleName: "5단계 중 2단계: 구단 고르기",
      statusLabel: "진행 중",
    });
    expect(resolved[0]?.statusLabel).toBe("완료");
    expect(resolved[4]?.statusLabel).toBe("예정");
  });

  it("rejects a composer that is missing or returns empty copy", () => {
    expect(() =>
      resolveStepsDescriptor(descriptor, {
        statusLabels,
        composeAccessibleName: undefined as never,
      }),
    ).toThrow(/composeAccessibleName/);
    expect(() =>
      resolveStepsDescriptor(descriptor, {
        statusLabels,
        composeAccessibleName: () => "  ",
      }),
    ).toThrow(/composeAccessibleName/);
  });

  it("treats every status but pending as reached", () => {
    expect(isStepReached("pending")).toBe(false);
    expect(isStepReached("current")).toBe(true);
    expect(isStepReached("complete")).toBe(true);
    expect(isStepReached("error")).toBe(true);
  });
});

describe("Steps visual identity", () => {
  it("marks complete and error with existing non-color semantic icons", () => {
    expect(stepsRecipe.indicator.marks.pending).toBeNull();
    expect(stepsRecipe.indicator.marks.current).toBeNull();
    expect(semanticIconNames).toContain(stepsRecipe.indicator.marks.complete);
    expect(semanticIconNames).toContain(stepsRecipe.indicator.marks.error);
  });

  /*
    저작 시점에는 "아직 배선되지 않았다"를 단정했다. 배선이 끝났으므로 그 단정을
    **뒤집는다** — 지우지 않는 이유는, 이 테스트가 지키는 것이 "배선 여부"가 아니라
    **catalog와 recipe가 서로를 가리키는지**이기 때문이다. 지우면 recipe 키가 오타로
    바뀌어도 아무도 모른다.

    status는 여전히 `planned`다. 계약과 recipe가 준비된 것이 beta 승격을 뜻하지 않고,
    로드맵의 gate가 실제 제품 vertical slice를 요구한다.
  */
  it("is wired into the shared catalog and points at its own recipe", () => {
    expect(componentCatalog.find((entry) => entry.name === "Steps")).toMatchObject({
      platform: "shared",
      status: "planned",
      recipe: "stepsRecipe",
    });
    expect(recipeRegistry).toHaveProperty("stepsRecipe");
  });

  it("keeps label and description text readable on canvas and surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      for (const reference of [
        ...Object.values(stepsRecipe.label.color),
        stepsRecipe.description.color,
      ]) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("keeps every marker glyph color above the 3:1 non-text boundary", () => {
    // Only opaque foreground-style references are checked here, matching
    // Statistic's contrast harness. The alpha-tinted badge-style border and
    // background tones (like Badge's own border/background) are decorative
    // tints, not the required signal — the glyph (or digit) color and shape
    // carry the state, so those are what must clear the boundary.
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      for (const reference of [
        ...Object.values(stepsRecipe.indicator.content),
        stepsRecipe.connector.tone.reached,
      ]) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });
});
