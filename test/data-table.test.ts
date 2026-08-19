import { describe, expect, it } from "vitest";
import {
  dataTableBehavior,
  dataTableDefaults,
  dataTableRecipe,
  getNextDataTableSortState,
  resolveDataTableSelectAllState,
  validateDataTableColumns,
  validateDataTableRows,
  validateDataTableSortState,
  type DataTableColumnDescriptor,
  type DataTableRowDescriptor,
} from "../src/data-table.js";

const columns: readonly DataTableColumnDescriptor[] = [
  { id: "name", header: "Name", sortable: true },
  { id: "avg", header: "AVG", sortable: true, align: "end" },
  { id: "team", header: "Team" },
];

const rows: readonly DataTableRowDescriptor[] = [
  { id: "row-1" },
  { id: "row-2" },
  { id: "row-3", disabled: true },
];

describe("DataTable columns", () => {
  it("rejects an empty column list", () => {
    expect(() => validateDataTableColumns([])).toThrow(/at least one column/);
  });

  it("rejects empty and duplicate column ids", () => {
    expect(() =>
      validateDataTableColumns([{ id: " ", header: "Name" }]),
    ).toThrow(/column id/);
    expect(() =>
      validateDataTableColumns([
        { id: "name", header: "Name" },
        { id: "name", header: "Name again" },
      ]),
    ).toThrow(/Duplicate/);
  });

  it("rejects an empty header and a non-positive width", () => {
    expect(() => validateDataTableColumns([{ id: "name", header: " " }])).toThrow(/header/);
    expect(() =>
      validateDataTableColumns([{ id: "name", header: "Name", width: 0 }]),
    ).toThrow(/width/);
    expect(() =>
      validateDataTableColumns([{ id: "name", header: "Name", width: -10 }]),
    ).toThrow(/width/);
  });
});

describe("DataTable rows", () => {
  it("rejects an empty or duplicate row id", () => {
    expect(() => validateDataTableRows([{ id: " " }])).toThrow(/row id/);
    expect(() => validateDataTableRows([{ id: "a" }, { id: "a" }])).toThrow(/Duplicate/);
    expect(() => validateDataTableRows(rows)).not.toThrow();
  });
});

describe("DataTable sort state", () => {
  it("rejects an unsupported direction and a reference to an unknown or unsortable column", () => {
    expect(() =>
      validateDataTableSortState({ columnId: "name", direction: "asc" as never }, columns),
    ).toThrow(/direction/);
    expect(() =>
      validateDataTableSortState({ columnId: "missing", direction: "ascending" }, columns),
    ).toThrow(/unknown column/);
    expect(() =>
      validateDataTableSortState({ columnId: "team", direction: "ascending" }, columns),
    ).toThrow(/not sortable/);
    expect(() =>
      validateDataTableSortState({ columnId: "name", direction: "ascending" }, columns),
    ).not.toThrow();
    expect(() => validateDataTableSortState(null, columns)).not.toThrow();
  });

  it("cycles ascending -> descending -> none by default (three-state)", () => {
    const first = getNextDataTableSortState(null, "name");
    expect(first).toEqual({ columnId: "name", direction: "ascending" });
    const second = getNextDataTableSortState(first, "name");
    expect(second).toEqual({ columnId: "name", direction: "descending" });
    const third = getNextDataTableSortState(second, "name");
    expect(third).toBeNull();
  });

  it("cycles ascending -> descending -> ascending in two-state mode", () => {
    const first = getNextDataTableSortState(null, "name", "two-state");
    const second = getNextDataTableSortState(first, "name", "two-state");
    const third = getNextDataTableSortState(second, "name", "two-state");
    expect(third).toEqual({ columnId: "name", direction: "ascending" });
  });

  it("restarts at ascending when a different column is clicked", () => {
    const current = { columnId: "name", direction: "descending" } as const;
    expect(getNextDataTableSortState(current, "avg")).toEqual({
      columnId: "avg",
      direction: "ascending",
    });
  });

  it("keeps the documented default cycle in sync", () => {
    expect(dataTableDefaults.sortCycle).toBe("three-state");
  });
});

describe("resolveDataTableSelectAllState", () => {
  it("excludes disabled rows from both the count and the denominator", () => {
    expect(resolveDataTableSelectAllState(rows, new Set())).toBe(false);
    expect(resolveDataTableSelectAllState(rows, new Set(["row-1"]))).toBe("mixed");
    expect(resolveDataTableSelectAllState(rows, new Set(["row-1", "row-2"]))).toBe(true);
    expect(
      resolveDataTableSelectAllState(rows, new Set(["row-1", "row-2", "row-3"])),
    ).toBe(true);
  });

  it("reports false when every row is disabled", () => {
    expect(
      resolveDataTableSelectAllState([{ id: "only", disabled: true }], new Set(["only"])),
    ).toBe(false);
  });
});

describe("DataTable visual and behavior contract", () => {
  it("keeps interactive header and selection targets touch-safe", () => {
    expect(dataTableRecipe.sortButton.minTarget).toBeGreaterThanOrEqual(44);
    expect(dataTableRecipe.selectionCell.width).toBeGreaterThanOrEqual(44);
  });

  it("reuses the shared collection selection and async state unchanged", () => {
    expect(dataTableBehavior.controlled).toContain("selection");
    expect(dataTableBehavior.stateAxes.content).toEqual([
      "idle",
      "loading",
      "loadingMore",
      "empty",
      "error",
    ]);
  });

  it("declares no native surface for this web-only component", () => {
    expect(dataTableBehavior.native).toEqual({ roles: [], states: [], actions: [] });
  });
});
