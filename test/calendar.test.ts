import { describe, expect, it, vi } from "vitest";

import { ACCENTS, THEMES, accentFill } from "../src/colors.js";
import { resolveColorReference } from "../src/color-references.js";
import { focusIndicatorContract } from "../src/component-contracts.js";
import {
  calendarBehavior,
  calendarRecipe,
  getCalendarNavigationIntent,
  getCalendarNavigationTarget,
  resolveCalendarDescriptor,
  resolveCalendarGridDescriptor,
  validateCalendarDescriptor,
  validateCalendarGridDescriptor,
  validateCalendarMonthNavigation,
  validateCalendarSelection,
  type CalendarDescriptor,
  type CalendarGridDescriptor,
} from "../src/calendar.js";

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

/**
 * 2027-02: 3 leading fillers (Feb 1 lands on column 4 / Wed), 28 dated cells
 * (Feb has 28 days that year), 4 trailing fillers — 35 cells, 5 full weeks.
 */
function buildFebruaryGrid(
  overrides: Readonly<Record<string, { disabled?: boolean }>> = {},
): CalendarGridDescriptor<{ games: number }> {
  const cells = [
    ...Array.from({ length: 3 }, () => ({})),
    ...Array.from({ length: 28 }, (_, index) => {
      const day = index + 1;
      const date = `2027-02-${String(day).padStart(2, "0")}`;
      const override = overrides[date] ?? {};
      return { date, content: { games: day % 3 }, ...override };
    }),
    ...Array.from({ length: 4 }, () => ({})),
  ];
  return { cells, weekdayLabels: WEEKDAY_LABELS, todayDate: "2027-02-19" };
}

const composeAccessibleName = vi.fn(
  ({ date, isToday, isSelected, disabled }: { date: string; isToday: boolean; isSelected: boolean; disabled: boolean }) =>
    `${date}${isToday ? " 오늘" : ""}${isSelected ? " 선택됨" : ""}${disabled ? " 선택 불가" : ""}`,
);

describe("Calendar grid validation", () => {
  it("accepts a well-formed multi-week page", () => {
    expect(() => validateCalendarGridDescriptor(buildFebruaryGrid())).not.toThrow();
  });

  it("rejects a cell count that is not a positive multiple of seven", () => {
    const grid = buildFebruaryGrid();
    expect(() => validateCalendarGridDescriptor({ ...grid, cells: grid.cells.slice(0, 34) })).toThrow(
      /multiple of seven/,
    );
    expect(() => validateCalendarGridDescriptor({ ...grid, cells: [] })).toThrow(/multiple of seven/);
  });

  it("rejects weekday label counts other than seven and empty labels", () => {
    const grid = buildFebruaryGrid();
    expect(() =>
      validateCalendarGridDescriptor({ ...grid, weekdayLabels: WEEKDAY_LABELS.slice(0, 6) as never }),
    ).toThrow(/seven entries/);
    expect(() =>
      validateCalendarGridDescriptor({ ...grid, weekdayLabels: ["", ...WEEKDAY_LABELS.slice(1)] as never }),
    ).toThrow(/weekdayLabels/);
  });

  it("rejects a malformed or missing todayDate", () => {
    const grid = buildFebruaryGrid();
    expect(() => validateCalendarGridDescriptor({ ...grid, todayDate: "2027-2-19" })).toThrow(
      /todayDate/,
    );
  });

  it("rejects a malformed or duplicate dated cell", () => {
    const grid = buildFebruaryGrid();
    const cells = [...grid.cells];
    cells[3] = { date: "2027/02/01" };
    expect(() => validateCalendarGridDescriptor({ ...grid, cells })).toThrow(/cell date/);

    const duplicated = [...grid.cells, { date: "2027-02-01" }];
    expect(() =>
      validateCalendarGridDescriptor({ ...grid, cells: [...duplicated, ...Array.from({ length: 6 }, () => ({}))] }),
    ).toThrow(/Duplicate/);
  });

  it("leaves filler cells (no date) unvalidated", () => {
    const grid = buildFebruaryGrid();
    expect(() => validateCalendarGridDescriptor(grid)).not.toThrow();
    expect(grid.cells[0]).toEqual({});
  });
});

describe("Calendar month navigation and selection axes", () => {
  it("rejects a malformed focused month", () => {
    expect(() =>
      validateCalendarMonthNavigation({ focusedMonth: "2027-2" } as never),
    ).toThrow(/focusedMonth/);
    expect(() =>
      validateCalendarMonthNavigation({ defaultFocusedMonth: "2027-13" } as never),
    ).toThrow(/focusedMonth/);
    expect(() => validateCalendarMonthNavigation({})).not.toThrow();
  });

  it("rejects a malformed selected date but allows null and absent", () => {
    expect(() =>
      validateCalendarSelection({ selectedDate: "not-a-date" } as never),
    ).toThrow(/selectedDate/);
    expect(() => validateCalendarSelection({ selectedDate: null } as never)).not.toThrow();
    expect(() => validateCalendarSelection({})).not.toThrow();
  });
});

describe("Calendar grid resolution", () => {
  it("marks today and the selected date independently, including their overlap", () => {
    const grid = buildFebruaryGrid();
    const resolved = resolveCalendarGridDescriptor(grid, "2027-02-19", { composeAccessibleName });
    const today = resolved.find((cell) => cell.date === "2027-02-19");
    expect(today).toMatchObject({ isToday: true, isSelected: true });

    const other = resolved.find((cell) => cell.date === "2027-02-05");
    expect(other).toMatchObject({ isToday: false, isSelected: false });
  });

  it("gives filler cells no date, no content, and no accessible name", () => {
    const grid = buildFebruaryGrid();
    const resolved = resolveCalendarGridDescriptor(grid, null, { composeAccessibleName });
    const filler = resolved[0]!;
    expect(filler).toEqual({ row: 1, column: 1, filler: true });
  });

  it("keeps a disabled date focusable in the resolved shape but marks it unselectable", () => {
    const grid = buildFebruaryGrid({ "2027-02-10": { disabled: true } });
    const resolved = resolveCalendarGridDescriptor(grid, null, { composeAccessibleName });
    const disabledCell = resolved.find((cell) => cell.date === "2027-02-10");
    expect(disabledCell).toMatchObject({ disabled: true, selectable: false });
    expect((disabledCell as { accessibleName: string }).accessibleName).toContain("선택 불가");
  });

  it("computes 1-indexed row/column consistent with the seven-column page", () => {
    const grid = buildFebruaryGrid();
    const resolved = resolveCalendarGridDescriptor(grid, null, { composeAccessibleName });
    expect(resolved.find((cell) => cell.date === "2027-02-01")).toMatchObject({ row: 1, column: 4 });
    expect(resolved.find((cell) => cell.date === "2027-02-19")).toMatchObject({ row: 4, column: 1 });
    expect(resolved.find((cell) => cell.date === "2027-02-28")).toMatchObject({ row: 5, column: 3 });
  });

  it("requires a composer function and rejects an empty accessible name", () => {
    const grid = buildFebruaryGrid();
    expect(() =>
      resolveCalendarGridDescriptor(grid, null, { composeAccessibleName: undefined as never }),
    ).toThrow(/composeAccessibleName/);
    expect(() =>
      resolveCalendarGridDescriptor(grid, null, { composeAccessibleName: () => "  " }),
    ).toThrow(/composeAccessibleName/);
  });

  it("resolveCalendarDescriptor validates the whole descriptor before resolving its grid", () => {
    const descriptor: CalendarDescriptor<{ games: number }> = {
      grid: buildFebruaryGrid(),
      monthLabel: "2027년 2월",
      selectedDate: "2027-02-05",
      onSelectionChange: () => {},
    };
    expect(() => validateCalendarDescriptor(descriptor)).not.toThrow();
    expect(() => validateCalendarDescriptor({ ...descriptor, monthLabel: "" })).toThrow(
      /monthLabel/,
    );
    const resolved = resolveCalendarDescriptor(descriptor, { composeAccessibleName });
    expect(resolved.find((cell) => cell.date === "2027-02-05")).toMatchObject({ isSelected: true });
  });
});

describe("Calendar keyboard navigation", () => {
  const grid = buildFebruaryGrid();

  it("maps arrow keys, Home, and End to grid-navigation intents, flipping arrows under RTL", () => {
    expect(getCalendarNavigationIntent("ArrowRight")).toBe("next-day");
    expect(getCalendarNavigationIntent("ArrowLeft")).toBe("previous-day");
    expect(getCalendarNavigationIntent("ArrowRight", "rtl")).toBe("previous-day");
    expect(getCalendarNavigationIntent("ArrowDown")).toBe("next-week");
    expect(getCalendarNavigationIntent("ArrowUp")).toBe("previous-week");
    expect(getCalendarNavigationIntent("Home")).toBe("first-of-week");
    expect(getCalendarNavigationIntent("End")).toBe("last-of-week");
    expect(getCalendarNavigationIntent("Escape")).toBeUndefined();
  });

  it("moves by day and by week inside the visible page", () => {
    expect(getCalendarNavigationTarget(grid, "2027-02-19", "next-day")).toEqual({
      date: "2027-02-20",
    });
    expect(getCalendarNavigationTarget(grid, "2027-02-19", "next-week")).toEqual({
      date: "2027-02-26",
    });
    expect(getCalendarNavigationTarget(grid, "2027-02-26", "previous-week")).toEqual({
      date: "2027-02-19",
    });
  });

  it("signals overflow instead of wrapping past either edge of the page", () => {
    expect(getCalendarNavigationTarget(grid, "2027-02-01", "previous-day")).toEqual({
      overflow: "before",
    });
    expect(getCalendarNavigationTarget(grid, "2027-02-01", "previous-week")).toEqual({
      overflow: "before",
    });
    expect(getCalendarNavigationTarget(grid, "2027-02-26", "next-week")).toEqual({
      overflow: "after",
    });
    expect(getCalendarNavigationTarget(grid, "2027-02-28", "next-day")).toEqual({
      overflow: "after",
    });
  });

  it("Home/End skip leading fillers to land on the first/last dated cell of the row", () => {
    expect(getCalendarNavigationTarget(grid, "2027-02-03", "first-of-week")).toEqual({
      date: "2027-02-01",
    });
    expect(getCalendarNavigationTarget(grid, "2027-02-01", "last-of-week")).toEqual({
      date: "2027-02-04",
    });
    expect(getCalendarNavigationTarget(grid, "2027-02-28", "last-of-week")).toEqual({
      date: "2027-02-28",
    });
  });

  it("rejects a currentDate that is not part of the supplied grid page", () => {
    expect(() => getCalendarNavigationTarget(grid, "2027-03-01", "next-day")).toThrow(
      /not part of this grid page/,
    );
  });
});

describe("Calendar visual identity", () => {
  it("gives today a persistent border and selected a filled background, independent of each other", () => {
    expect(calendarRecipe.day.today.border).not.toBe(calendarRecipe.day.selected.background);
    expect(calendarRecipe.day.focus).toBe(focusIndicatorContract);
  });

  it("keeps every essential copy and marker color readable on canvas and surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = { theme: THEMES[themeName], statusAccents: ACCENTS[themeName], statusAccentFills: accentFill };
      const backgrounds = [THEMES[themeName].bg, THEMES[themeName].surface];
      for (const reference of [
        calendarRecipe.header.monthLabel.color,
        calendarRecipe.weekdayLabel.color,
        calendarRecipe.day.label.color,
      ]) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
      const todayBorder = resolveColorReference(calendarRecipe.day.today.border, palette);
      for (const background of backgrounds) {
        expect(contrast(todayBorder, background)).toBeGreaterThanOrEqual(3);
      }
      // `selected` is a filled background, not a border/text mark, so it is
      // checked against its own content color (the day number on top of it)
      // rather than against canvas — the same pattern buttonRecipe's tones use
      // for onPrimary-on-primary instead of primary-on-canvas.
      const selectedBackground = resolveColorReference(calendarRecipe.day.selected.background, palette);
      const selectedContent = resolveColorReference(calendarRecipe.day.selected.content, palette);
      expect(contrast(selectedContent, selectedBackground)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("Calendar behavior contract", () => {
  it("does not skip disabled cells during keyboard navigation, unlike collection navigation", () => {
    expect(calendarBehavior.web.focus).toBe("roving");
    expect(calendarBehavior.scenarios).toContain(
      "disabled-dates-remain-focusable-but-never-activate",
    );
  });

  it("keeps month paging and selection as independent controlled axes", () => {
    expect(calendarBehavior.controlled).toEqual(
      expect.arrayContaining([
        "selectedDate",
        "focusedMonth",
        "onFocusedMonthChange",
      ]),
    );
  });

  it("documents that range selection is out of scope", () => {
    expect(calendarBehavior.scenarios).toContain("range-selection-is-not-part-of-the-contract");
  });
});
