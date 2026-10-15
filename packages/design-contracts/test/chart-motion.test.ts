import { expect, it } from "vitest";
import { prepareChartLineMorph } from "../src/chart.js";
import { resolveSwipeTabIndicator } from "../src/gooey-navigation.js";
it("keeps vertices of both unequal period polylines and clamps motion", () => {
  const from = [{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 20, y: 0 }];
  const to = [{ x: 0, y: 20 }, { x: 20, y: 20 }];
  const morph = prepareChartLineMorph(from, to)!;
  expect(morph(0)).toEqual(from);
  expect(morph(1)).toEqual([{ x: 0, y: 20 }, { x: 10, y: 20 }, { x: 20, y: 20 }]);
  expect(morph(.5)[1]).toEqual({ x: 10, y: 20 });
  expect(morph(-1)).toEqual(morph(0)); expect(morph(2)).toEqual(morph(1));
  expect(prepareChartLineMorph([], to)).toBeNull();
});
it("interpolates measured physical rectangles in RTL order and rejects missing layout", () => {
  const rects = [{ x: 120, width: 80 }, { x: 0, width: 120 }];
  expect(resolveSwipeTabIndicator(rects, .5)).toEqual({ x: 60, width: 100 });
  expect(resolveSwipeTabIndicator(rects, -5)).toEqual(rects[0]);
  expect(resolveSwipeTabIndicator(rects, 5)).toEqual(rects[1]);
  expect(resolveSwipeTabIndicator([rects[0], undefined], .5)).toBeNull();
  expect(resolveSwipeTabIndicator(rects, NaN)).toBeNull();
});
