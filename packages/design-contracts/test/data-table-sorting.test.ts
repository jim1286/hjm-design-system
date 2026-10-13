import { describe, expect, it } from "vitest";
import { dataTableFirstSortDirection, getNextDataTableSortState, sortDataTableRows, splitPinnedDataTableColumns, toDataTableSortValue } from "../src/data-table.js";

describe("DataTable sorting helpers (2026-10-14)", () => {
  it("starts descending for sortDescFirst columns and cycles back", () => {
    const first = dataTableFirstSortDirection({ sortDescFirst: true });
    const a = getNextDataTableSortState(null, "ops", "three-state", first);
    const b = getNextDataTableSortState(a, "ops", "three-state", first);
    expect(a).toEqual({ columnId: "ops", direction: "descending" });
    expect(b).toEqual({ columnId: "ops", direction: "ascending" });
    expect(getNextDataTableSortState(b, "ops", "three-state", first)).toBeNull();
    expect(getNextDataTableSortState(null, "era")).toEqual({ columnId: "era", direction: "ascending" });
  });
  it("reads displayed numbers and keeps labels as text", () => {
    expect(toDataTableSortValue(".340")).toBe(0.34);
    expect(toDataTableSortValue("36 ⅓")).toBe(36);
    expect(toDataTableSortValue("13.5억")).toBe(13.5);
    expect(toDataTableSortValue("61.0%")).toBe(61);
    expect(toDataTableSortValue("7승0무3패")).toBe("7승0무3패");
    expect(toDataTableSortValue("—")).toBeNull();
  });
  it("sinks missing values in both directions and is stable", () => {
    const rows = [{ n: "a", v: 2 }, { n: "b", v: null }, { n: "c", v: 5 }, { n: "d", v: 2 }];
    const get = (row: typeof rows[number]) => row.v;
    expect(sortDataTableRows(rows, { columnId: "v", direction: "descending" }, get).map(r => r.n)).toEqual(["c", "a", "d", "b"]);
    expect(sortDataTableRows(rows, { columnId: "v", direction: "ascending" }, get).map(r => r.n)).toEqual(["a", "d", "c", "b"]);
    expect(sortDataTableRows(rows, null, get)).toEqual(rows);
  });
  it("pins only the leading run of pinned columns", () => {
    const { pinned, scrolling } = splitPinnedDataTableColumns([{ pinned: "start" as const }, {}, { pinned: "start" as const }]);
    expect(pinned).toHaveLength(1); expect(scrolling).toHaveLength(2);
  });
});
