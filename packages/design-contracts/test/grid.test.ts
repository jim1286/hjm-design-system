import { describe, expect, it } from "vitest";
import {
  gridDefaults,
  gridGaps,
  gridRecipe,
  resolveGridLayout,
  validateGridDescriptor,
  type GridDescriptor,
} from "../src/grid.js";

const responsiveGrid = {
  columns: { compact: 1, medium: 2, expanded: 3, wide: 4 },
  gap: {
    compact: "sm",
    expanded: { row: "lg", column: "md" },
  },
  minColumnWidth: { compact: 120, wide: 200 },
} as const satisfies GridDescriptor;

describe("Grid descriptor validation", () => {
  it("accepts sparse responsive columns, token gaps, and a positive width floor", () => {
    expect(() => validateGridDescriptor(responsiveGrid)).not.toThrow();
    expect(() =>
      validateGridDescriptor({
        columns: { compact: 1, wide: 6 },
        gap: { compact: "none" },
      }),
    ).not.toThrow();
  });

  it("requires a positive integer at every declared column override", () => {
    for (const columns of [0, -1, 1.5, Number.POSITIVE_INFINITY]) {
      expect(() =>
        validateGridDescriptor({ columns: { compact: 1, medium: columns } }),
      ).toThrow(/positive integer/);
    }
  });

  it("rejects an unknown gap token or incomplete axis gap", () => {
    expect(() =>
      validateGridDescriptor({
        columns: { compact: 1 },
        gap: { compact: "giant" as never },
      }),
    ).toThrow(/gap/);
    expect(() =>
      validateGridDescriptor({
        columns: { compact: 1 },
        gap: { compact: { row: "md" } as never },
      }),
    ).toThrow(/column/);
    expect(() =>
      validateGridDescriptor({
        columns: { compact: 1 },
        gap: { compact: { row: "md", column: "sm", inline: "xs" } as never },
      }),
    ).toThrow(/inline/);
  });

  it("rejects a non-positive minColumnWidth and unknown descriptor fields", () => {
    expect(() =>
      validateGridDescriptor({
        columns: { compact: 1 },
        minColumnWidth: { compact: 0 },
      }),
    ).toThrow(/minColumnWidth/);
    expect(() =>
      validateGridDescriptor({ columns: { compact: 1 }, order: "dense" } as never),
    ).toThrow(/order/);
    expect(() => validateGridDescriptor(null as never)).toThrow(/must be an object/);
  });
});

describe("resolveGridLayout", () => {
  it("selects by full window width but computes geometry from available width", () => {
    const layout = resolveGridLayout(responsiveGrid, {
      windowWidth: 1_000,
      availableWidth: 800,
    });

    expect(layout).toEqual({
      windowClass: "expanded",
      flow: "row-major",
      requestedColumns: 3,
      columns: 3,
      rowGap: gridGaps.lg,
      columnGap: gridGaps.md,
      columnWidth: 256,
    });
  });

  it("inherits sparse values independently for columns, gap, and minimum width", () => {
    const medium = resolveGridLayout(responsiveGrid, {
      windowWidth: 700,
      availableWidth: 500,
    });
    expect(medium).toMatchObject({
      windowClass: "medium",
      requestedColumns: 2,
      columns: 2,
      rowGap: gridGaps.sm,
      columnGap: gridGaps.sm,
      columnWidth: 244,
    });

    const wide = resolveGridLayout(responsiveGrid, {
      windowWidth: 1_300,
      availableWidth: 700,
    });
    expect(wide.windowClass).toBe("wide");
    expect(wide.requestedColumns).toBe(4);
    expect(wide.columns).toBe(3);
    expect(wide.rowGap).toBe(gridGaps.lg);
    expect(wide.columnGap).toBe(gridGaps.md);
    expect(wide.columnWidth).toBeCloseTo(222.6667, 4);
  });

  it("collapses columns to honor minColumnWidth but never widens the request", () => {
    const collapsed = resolveGridLayout(
      {
        columns: { compact: 4 },
        minColumnWidth: { compact: 300 },
      },
      { windowWidth: 320 },
    );
    expect(collapsed.requestedColumns).toBe(4);
    expect(collapsed.columns).toBe(1);
    expect(collapsed.columnWidth).toBe(320);

    const narrowSplitView = resolveGridLayout(
      {
        columns: { compact: 3 },
        minColumnWidth: { compact: 300 },
      },
      { windowWidth: 1_000, availableWidth: 240 },
    );
    expect(narrowSplitView.columns).toBe(1);
    expect(narrowSplitView.columnWidth).toBe(240);

    const notWidened = resolveGridLayout(
      {
        columns: { compact: 1 },
        minColumnWidth: { compact: 100 },
      },
      { windowWidth: 1_200 },
    );
    expect(notWidened.columns).toBe(1);
  });

  it("uses the token default and supports an explicit zero gap", () => {
    const defaults = resolveGridLayout(
      { columns: { compact: 2 } },
      { windowWidth: 400 },
    );
    expect(defaults.rowGap).toBe(gridGaps[gridDefaults.gap]);
    expect(defaults.columnGap).toBe(gridGaps[gridDefaults.gap]);
    expect(defaults.columnWidth).toBe(192);

    const noGap = resolveGridLayout(
      { columns: { compact: 2 }, gap: { compact: "none" } },
      { windowWidth: 400 },
    );
    expect(noGap.rowGap).toBe(0);
    expect(noGap.columnGap).toBe(0);
    expect(noGap.columnWidth).toBe(200);
  });

  it("rejects invalid dimensions and impossible geometry", () => {
    expect(() =>
      resolveGridLayout({ columns: { compact: 1 } }, { windowWidth: 0 }),
    ).toThrow(/availableWidth/);
    expect(() =>
      resolveGridLayout(
        { columns: { compact: 1 } },
        { windowWidth: 600, availableWidth: Number.NaN },
      ),
    ).toThrow(/availableWidth/);
    expect(() =>
      resolveGridLayout(
        { columns: { compact: 4 }, gap: { compact: "xxxl" } },
        { windowWidth: 100 },
      ),
    ).toThrow(/positive column width/);
    expect(() =>
      resolveGridLayout(
        { columns: { compact: 1 } },
        { windowWidth: 600, viewportWidth: 600 } as never,
      ),
    ).toThrow(/viewportWidth/);
  });
});

describe("Grid renderer contract", () => {
  it("uses only shared spacing and preserves row-major source order", () => {
    expect(gridRecipe.slots).toEqual(["root", "item"]);
    expect(gridRecipe.defaults.flow).toBe("row-major");
    expect(gridRecipe.gaps).toEqual({
      none: 0,
      xxs: 4,
      xs: 8,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      xxxl: 40,
    });
  });
});
