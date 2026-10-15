import { expect, it } from "vitest";
import { resolvePieGeometry, resolvePieVisibility } from "../src/chart.js";
const data = [{ id: "a", value: 60 }, { id: "b", value: 30 }, { id: "missing", value: null }];
it("recalculates visible geometry without renumbering original palette indices", () => {
  const state = resolvePieVisibility(data, ["a"]);
  expect(state).toEqual({ values: [null, 30, null], total: 30, includedCount: 2, observedCount: 1 });
  const slices = resolvePieGeometry(state.values, { cx: 50, cy: 50, radius: 40, innerRadius: 20 });
  expect(slices).toHaveLength(1); expect(slices[0]!.index).toBe(1); expect(slices[0]!.percent).toBe(100);
  expect(resolvePieVisibility(data, ["a", "b", "missing"]).total).toBe(0);
  expect(resolvePieVisibility([{ id: "zero", value: 0 }]).observedCount).toBe(1);
});
it("rejects ambiguous ids and unknown exclusions while preserving ignored negative values", () => {
  expect(() => resolvePieVisibility(data, ["unknown"])).toThrow();
  expect(() => resolvePieVisibility(data, ["a", "a"])).toThrow();
  expect(resolvePieVisibility([{ id: "a", value: -1 }]).values).toEqual([null]);
  expect(() => resolvePieVisibility([data[0]!, data[0]!])).toThrow();
});
