import { describe, expect, it } from "vitest";
import {
  percentileHeat, percentileRank, resolveComparisonRow, resolveDataTableBody, resolveDataTableHeaderBands, resolveLineScore, resolveMatrix,
} from "../src/data-table.js";

describe("DataTable family (2026-10-14)", () => {
  it("spans contiguous header groups and pads ungrouped columns", () => {
    const columns = [{ id: "name" }, { id: "avg" }, { id: "hr" }, { id: "sb" }];
    const bands = resolveDataTableHeaderBands(columns, [{ id: "bat", header: "타격", columns: ["avg", "hr"] }, { id: "run", header: "주루", columns: ["sb"] }]);
    expect(bands.map(band => [band.header, band.span])).toEqual([[null, 1], ["타격", 2], ["주루", 1]]);
    expect(() => resolveDataTableHeaderBands([{ id: "a" }, { id: "b" }, { id: "c" }], [{ id: "g", header: "G", columns: ["a", "c"] }])).toThrow(/contiguous/);
    expect(() => resolveDataTableHeaderBands(columns, [{ id: "x", header: "X", columns: ["avg"] }, { id: "y", header: "Y", columns: ["avg"] }])).toThrow(/two groups/);
  });

  it("puts loose rows first and labels each row group", () => {
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(resolveDataTableBody(rows, [{ id: "bench", label: "교체", rows: ["c"] }])).toEqual([
      { kind: "row", id: "a" }, { kind: "row", id: "b" }, { kind: "group", id: "bench", label: "교체" }, { kind: "row", id: "c" },
    ]);
    expect(() => resolveDataTableBody(rows, [{ id: "g", label: "G", rows: ["z"] }])).toThrow(/unknown row/);
  });

  it("ranks percentiles with ties at the midpoint and flips lower-is-better stats", () => {
    const sample = [1, 2, 3, 4, 5];
    expect(percentileRank(5, sample)).toBe(100);
    expect(percentileRank(1, sample)).toBe(0);
    expect(percentileRank(1, sample, { lowerIsBetter: true })).toBe(100);
    expect(percentileRank(3, [3, 3, 3])).toBe(50);
    expect(percentileRank(null, sample)).toBeNull();
    expect(percentileHeat(95)).toEqual({ side: "high", strength: 3 });
    expect(percentileHeat(50)).toBeNull();
    expect(percentileHeat(5)).toEqual({ side: "low", strength: 3 });
  });

  it("pads line scores to nine periods, extends extra innings and finds the leader", () => {
    const teams = [
      { id: "away", name: "LG", periods: [0, 1, 0, 0, 2, 0, 0, 0, 0, 1], totals: { R: 4, H: 9, E: 0, B: 3 } },
      { id: "home", name: "KIA", periods: [1, 0, 0, 2, 0, 0, 0, 0, 0, 0], totals: { R: 3, H: 7, E: 1, B: 2 } },
    ];
    const score = resolveLineScore(teams, { totals: ["R", "H", "E", "B"], currentPeriod: 10 });
    expect(score.columns.filter(column => column.kind === "period")).toHaveLength(10);
    expect(score.columns.at(-1)).toEqual({ id: "t-B", header: "B", kind: "total" });
    expect(score.leaderId).toBe("away");
    expect(score.currentPeriod).toBe(10);
    expect(resolveLineScore([{ ...teams[0]!, periods: [0] }, { ...teams[1]!, periods: [], totals: { R: 4 } }], { totals: ["R"] }).leaderId).toBeNull();
  });

  it("blanks the matrix diagonal", () => {
    const matrix = resolveMatrix(["LG", "KIA"], (row, column) => ({ label: `${row}-${column}` }));
    expect(matrix[0]![0]).toBe("self");
    expect(matrix[0]![1]).toEqual({ label: "LG-KIA" });
  });

  it("gives the longer comparison bar to the better side", () => {
    expect(resolveComparisonRow({ id: "avg", label: "타율", values: [0.3, 0.2] })).toEqual({ winner: 0, shares: [0.6, 0.4] });
    const era = resolveComparisonRow({ id: "era", label: "평균자책", values: [2, 4], lowerIsBetter: true });
    expect(era.winner).toBe(0);
    expect(era.shares[0]).toBeGreaterThan(era.shares[1]);
    expect(resolveComparisonRow({ id: "x", label: "X", values: [1, null] }).winner).toBeNull();
  });
});
