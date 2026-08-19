import { describe, expect, it, vi } from "vitest";

import { ACCENTS, THEMES, accentFill } from "../src/colors.js";
import { resolveColorReference } from "../src/color-references.js";
import { fieldFrameContract } from "../src/component-contracts.js";
import type { CalendarGridDescriptor } from "../src/calendar.js";
import {
  datePickerBehavior,
  datePickerRecipe,
  resolveDatePickerGrid,
  resolveDatePickerTriggerText,
  validateDatePickerDescriptor,
  validateDatePickerSelection,
  type DatePickerDescriptor,
} from "../src/date-picker.js";

function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

function contrast(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function buildGrid(): CalendarGridDescriptor {
  const cells = [
    ...Array.from({ length: 3 }, () => ({})),
    ...Array.from({ length: 28 }, (_, index) => ({
      date: `2027-02-${String(index + 1).padStart(2, "0")}`,
    })),
    ...Array.from({ length: 4 }, () => ({})),
  ];
  return { cells, weekdayLabels: WEEKDAY_LABELS, todayDate: "2027-02-19" };
}

function buildDescriptor(overrides: Record<string, unknown> = {}): DatePickerDescriptor {
  return {
    grid: buildGrid(),
    displayValue: null,
    placeholder: "날짜를 선택하세요",
    label: "관람일",
    selectedDate: null,
    onSelectionChange: () => {},
    open: false,
    onOpenChange: () => {},
    ...overrides,
  } as DatePickerDescriptor;
}

const composeAccessibleName = vi.fn(({ date }: { date: string }) => date);

describe("DatePicker descriptor validation", () => {
  it("accepts a well-formed descriptor with either label field", () => {
    expect(() => validateDatePickerDescriptor(buildDescriptor())).not.toThrow();
    expect(() =>
      validateDatePickerDescriptor(
        buildDescriptor({ label: undefined, accessibilityLabel: "관람일" } as never),
      ),
    ).not.toThrow();
  });

  it("rejects a descriptor with neither label nor accessibilityLabel", () => {
    expect(() =>
      validateDatePickerDescriptor(buildDescriptor({ label: undefined } as never)),
    ).toThrow(/label/);
  });

  it("rejects an empty placeholder and an empty (but not null) displayValue", () => {
    expect(() => validateDatePickerDescriptor(buildDescriptor({ placeholder: " " }))).toThrow(
      /placeholder/,
    );
    expect(() =>
      validateDatePickerDescriptor(buildDescriptor({ displayValue: "" })),
    ).toThrow(/displayValue/);
    expect(() =>
      validateDatePickerDescriptor(buildDescriptor({ displayValue: "2027년 2월 5일" })),
    ).not.toThrow();
  });

  it("rejects a malformed committed date but allows null and absent", () => {
    expect(() => validateDatePickerSelection({ selectedDate: "not-a-date" } as never)).toThrow(
      /selectedDate/,
    );
    expect(() => validateDatePickerSelection({ selectedDate: null } as never)).not.toThrow();
    expect(() => validateDatePickerSelection({})).not.toThrow();
  });

  it("delegates grid shape validation to the Calendar contract unchanged", () => {
    const malformed = buildDescriptor();
    expect(() =>
      validateDatePickerDescriptor({
        ...malformed,
        grid: { ...malformed.grid, cells: malformed.grid.cells.slice(0, 3) },
      }),
    ).toThrow(/multiple of seven/);
  });
});

describe("DatePicker trigger copy", () => {
  it("falls back to the placeholder when nothing is committed yet", () => {
    expect(
      resolveDatePickerTriggerText({ displayValue: null, placeholder: "날짜를 선택하세요" }),
    ).toBe("날짜를 선택하세요");
  });

  it("shows the product-formatted display value once a date is committed", () => {
    expect(
      resolveDatePickerTriggerText({ displayValue: "2027년 2월 19일", placeholder: "날짜를 선택하세요" }),
    ).toBe("2027년 2월 19일");
  });
});

describe("DatePicker grid resolution", () => {
  it("reuses the exact Calendar cell shape for its popover/sheet content", () => {
    const resolved = resolveDatePickerGrid(
      buildDescriptor({ selectedDate: "2027-02-05" }),
      { composeAccessibleName },
    );
    expect(resolved.find((cell) => cell.date === "2027-02-05")).toMatchObject({
      isSelected: true,
      selectable: true,
    });
    expect(resolved[0]).toEqual({ row: 1, column: 1, filler: true });
  });
});

describe("DatePicker visual identity", () => {
  it("reuses the field frame verbatim instead of redeclaring a second one", () => {
    expect(datePickerRecipe.frame).toBe(fieldFrameContract);
  });

  it("declares the Web/Native overlay split like Select", () => {
    expect(datePickerRecipe.adaptive).toEqual({ web: "popover", native: "sheet" });
  });

  it("keeps trigger and support copy readable on canvas and surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = { theme: THEMES[themeName], statusAccents: ACCENTS[themeName], statusAccentFills: accentFill };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      for (const reference of [datePickerRecipe.value.color, datePickerRecipe.value.placeholderColor]) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});

describe("DatePicker behavior contract", () => {
  it("closes on selection and on clear, matching Select's dismiss-and-restore scenario", () => {
    expect(datePickerBehavior.scenarios).toEqual(
      expect.arrayContaining([
        "activating-an-enabled-date-commits-selection-and-closes",
        "clear-commits-null-and-closes-without-reopening",
      ]),
    );
  });

  it("keeps open state and selection as independent controlled axes", () => {
    expect(datePickerBehavior.controlled).toEqual(
      expect.arrayContaining(["selectedDate", "open", "onOpenChange"]),
    );
  });

  it("documents that range selection is out of scope", () => {
    expect(datePickerBehavior.scenarios).toContain(
      "range-selection-is-not-part-of-the-contract",
    );
  });
});
