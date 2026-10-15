import { expect, it } from "vitest";
import { binHistogram, resolveCohorts, resolveFunnel, resolveImportMapping, resolveTarget, validateCorrelation } from "../src/data-workflows.js";

it("blocks duplicate/missing import targets and freezes the actual mapping, including skip", () => {
  const sources = [{ id: "a", label: "A" }, { id: "b", label: "B" }], targets = [{ id: "name", label: "이름", required: true }, { id: "__hjm_skip__", label: "별도 필드" }];
  expect(resolveImportMapping(sources, targets, { a: "name", b: "name" })).toMatchObject({ valid: false, duplicateTargets: ["name"] });
  expect(resolveImportMapping(sources, targets, {}).missingTargets).toEqual(["name"]);
  const mapping = { a: "name", b: null }, resolved = resolveImportMapping(sources, targets, mapping);
  expect(resolved.valid).toBe(true); expect(resolved.skipKey).not.toBe("__hjm_skip__");
  mapping.a = "__hjm_skip__"; expect(resolved.mapping).toEqual({ a: "name", b: null }); expect(Object.isFrozen(resolved.mapping)).toBe(true);
});
it("derives sequential funnel conversions and leaves zero denominators unknown", () => {
  const stages = resolveFunnel([{ id: "visit", label: "방문", count: 100 }, { id: "buy", label: "구매", count: 25, reason: "설문 응답" }]);
  expect(stages[1]).toMatchObject({ conversion: .25, previousConversion: .25, lost: 75, reason: "설문 응답" });
  expect(resolveFunnel([{ id: "a", label: "A", count: 0 }])[0]!.conversion).toBeNull();
  expect(() => resolveFunnel([{ id: "a", label: "A", count: 1 }, { id: "b", label: "B", count: 2 }])).toThrow();
});
it("keeps future cohort observations distinct from observed zero and an empty cohort", () => {
  const rows = resolveCohorts([{ id: "a", label: "A", size: 10, retained: [10, 0] }, { id: "b", label: "B", size: 0, retained: [0] }], 3);
  expect(rows[0]!.rates).toEqual([1, 0, null]); expect(rows[1]!.rates).toEqual([null, null, null]);
  expect(() => resolveCohorts([{ id: "a", label: "A", size: 2, retained: [3] }], 1)).toThrow();
});
it("validates real symmetric correlation data including diagonal values", () => {
  const variables = [{ id: "a", label: "A" }, { id: "b", label: "B" }];
  expect(() => validateCorrelation({ variables, values: [[1, -.8], [-.8, 1]] })).not.toThrow();
  expect(() => validateCorrelation({ variables, values: [[1, .8], [.5, 1]] })).toThrow();
  expect(() => validateCorrelation({ variables, values: [[null, null], [null, 1.1]] })).toThrow();
});
it("does not invent a target percentage at zero and retains over-target ratios", () => {
  expect(resolveTarget(12, 0)).toMatchObject({ ratio: null, progress: null, difference: 12 });
  expect(resolveTarget(12, 10)).toMatchObject({ ratio: 1.2, progress: 1, difference: 2 });
});
it("rebins real samples without losing edge values, missing data or out-of-domain counts", () => {
  const histogram = binHistogram([-1, 0, .5, 1, 2, 3, null], 2, [0, 2]);
  expect(histogram.bins.map(bin => bin.count)).toEqual([2, 2]);
  expect(histogram).toMatchObject({ underflow: 1, overflow: 1, observed: 6, missing: 1 });
  expect(histogram.bins[1]!.includesUpper).toBe(true);
  expect(binHistogram([5, 5, 5], 3).bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(3);
  expect(binHistogram(Array.from({ length: 150000 }, (_, i) => i % 100), 10).observed).toBe(150000);
  expect(() => binHistogram([NaN], 2)).toThrow();
});
