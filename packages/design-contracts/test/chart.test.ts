import { describe, expect, it } from "vitest";
import {
  areaPath, arcPath, describeChart, linePath, nearestChartIndex, nearestScatterPoint, niceTicks, observedIndices,
  resolveBarGeometry, resolveChartDomain, resolveLineGeometry, resolvePieGeometry, resolveRadarGeometry,
  resolveScatterGeometry, scaleLinear, seriesExtremes, splitSegments, stackValues, stepChartIndex, validateChartSeries,
} from "../src/chart.js";

const categories = ["3월", "4월", "5월", "6월"];
const ops = { id: "ops", label: "OPS", values: [0.8, null, 0.9, 1.0] };

describe("chart validation", () => {
  it("rejects mismatched lengths, empty labels and duplicate ids", () => {
    expect(() => validateChartSeries(categories, [{ ...ops, values: [1] }])).toThrow(RangeError);
    expect(() => validateChartSeries(categories, [{ ...ops, label: " " }])).toThrow(TypeError);
    expect(() => validateChartSeries(categories, [ops, ops])).toThrow(/Duplicate/);
    expect(() => validateChartSeries(categories, [])).toThrow(TypeError);
  });
});

describe("scales and ticks", () => {
  it("produces nice ticks", () => {
    expect(niceTicks(0, 100, 4)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(0.2, 0.95, 4)).toEqual([0.2, 0.4, 0.6, 0.8]);
    expect(niceTicks(3, 3)).toEqual([3]);
  });
  it("zooms lines but includes zero when asked, and widens flat series", () => {
    expect(resolveChartDomain([0.8, 0.9])).toEqual([0.8, 0.9]);
    expect(resolveChartDomain([5, 8], { includeZero: true })).toEqual([0, 8]);
    const [min, max] = resolveChartDomain([2, 2]);
    expect(min).toBeLessThan(2); expect(max).toBeGreaterThan(2);
    expect(resolveChartDomain([null, null])).toEqual([0, 1]);
  });
  it("inverts so the smallest value is on top", () => {
    const y = scaleLinear([1, 10], [100, 0], true);
    expect(y(1)).toBe(0); expect(y(10)).toBe(100);
  });
});

describe("line geometry", () => {
  const g = resolveLineGeometry({ categories, series: [ops], width: 300, height: 120 });
  it("keeps gaps as null and splits segments there", () => {
    expect(g.plots[0]![1]).toBeNull();
    expect(splitSegments(g.plots[0]!)).toHaveLength(2);
    expect(observedIndices([ops])).toEqual([0, 2, 3]);
  });
  it("builds linear, monotone and step paths", () => {
    const points = [{ x: 0, y: 10 }, { x: 10, y: 0 }, { x: 20, y: 5 }];
    expect(linePath(points)).toBe("M0,10L10,0L20,5");
    expect(linePath(points, "monotone")).toMatch(/^M0,10C/);
    expect(linePath(points, "step")).toContain("H5V0H10");
    expect(areaPath(points, 20)).toMatch(/Z$/);
  });
  it("stacks positive and negative values separately", () => {
    const stacks = stackValues([{ id: "a", label: "A", values: [1, -2] }, { id: "b", label: "B", values: [2, -1] }]);
    expect(stacks[1]![0]).toEqual([1, 3]);
    expect(stacks[1]![1]).toEqual([-2, -3]);
  });
});

describe("bar geometry", () => {
  it("anchors bars at zero and groups series side by side", () => {
    const g = resolveBarGeometry({ categories: ["A", "B"], series: [{ id: "x", label: "X", values: [10, 20] }, { id: "y", label: "Y", values: [5, null] }], width: 200, height: 100 });
    expect(g.domain[0]).toBe(0);
    expect(g.bars).toHaveLength(3);
    const [a, , c] = g.bars;
    expect(c!.x).toBeGreaterThan(a!.x);
    expect(a!.y + a!.height).toBeCloseTo(g.value(0));
  });
  it("lays horizontal bars along x", () => {
    const g = resolveBarGeometry({ categories: ["A"], series: [{ id: "x", label: "X", values: [10] }], width: 200, height: 100, orientation: "horizontal" });
    expect(g.bars[0]!.width).toBeGreaterThan(g.bars[0]!.height);
  });
});

describe("polar geometry", () => {
  it("drops negative and missing pie values and sums to 100%", () => {
    const slices = resolvePieGeometry([3, null, -1, 1], { cx: 50, cy: 50, radius: 40, innerRadius: 20 });
    expect(slices.map(s => s.index)).toEqual([0, 3]);
    expect(slices.reduce((sum, s) => sum + s.percent, 0)).toBeCloseTo(100);
    expect(resolvePieGeometry([0, null], { cx: 0, cy: 0, radius: 1 })).toEqual([]);
    expect(arcPath(0, 0, 10, 0, 0, Math.PI * 2)).toContain("A10,10");
  });
  it("puts radar values on one shared domain", () => {
    const g = resolveRadarGeometry({ categories: ["컨택", "파워", "선구안"], series: [{ id: "p", label: "P", values: [100, 50, null] }], cx: 50, cy: 50, radius: 40, domain: [0, 100] });
    expect(g.rings).toHaveLength(4);
    expect(g.polygons[0]!.points[0]!.y).toBeCloseTo(10);
    expect(g.polygons[0]!.points[2]!.value).toBeNull();
    expect(() => resolveRadarGeometry({ categories: ["a", "b"], series: [{ id: "p", label: "P", values: [1, 2] }], cx: 0, cy: 0, radius: 1 })).toThrow(RangeError);
  });
});

describe("focus and accessibility", () => {
  it("finds the nearest category and steps over gaps", () => {
    expect(nearestChartIndex([0, 100, 200], 140)).toBe(1);
    expect(nearestChartIndex([0, 100, 200], 140, [0, 2])).toBe(2);
    expect(stepChartIndex([0, 2, 3], 0, 1)).toBe(2);
    expect(stepChartIndex([0, 2, 3], 3, 1)).toBe(3);
    expect(stepChartIndex([0, 2, 3], null, -1)).toBe(3);
  });
  it("finds scatter points within reach only", () => {
    const g = resolveScatterGeometry({ points: [{ id: "a", label: "A", x: 1, y: 1 }, { id: "b", label: "B", x: 2, y: 2 }], width: 200, height: 200 });
    expect(nearestScatterPoint(g.points, g.points[1]!.px + 3, g.points[1]!.py)).toBe(1);
    expect(nearestScatterPoint(g.points, -500, -500)).toBeNull();
  });
  it("reports extremes and a product-formatted text alternative", () => {
    expect(seriesExtremes([null, 3, 9, 1])).toEqual({ max: 2, min: 3 });
    expect(describeChart(["3월", "4월"], [{ id: "a", label: "OPS", values: [0.8, null] }], v => v.toFixed(3), "기록 없음")).toBe("OPS: 3월 0.800, 4월 기록 없음");
  });
});
