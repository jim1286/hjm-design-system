import { expect, it } from "vitest";
import { resolveGooeyIndicator, resolveTabIndicator, resolveTabsAppearance, sampleTabIndicator } from "../src/gooey-navigation.js";
import { motion } from "../src/foundations.js";
it("bridges measured edges in either direction without overshooting", () => {
  expect(resolveGooeyIndicator({x:10,width:30},{x:80,width:50})).toMatchObject({x:[10,10,80],width:[30,120,50]});
  expect(resolveGooeyIndicator({x:80,width:50},{x:10,width:30})).toMatchObject({x:[80,10,10],width:[50,120,30]});
  expect(() => resolveGooeyIndicator({x:NaN,width:30},{x:0,width:40})).toThrow(RangeError);
});

it("selects plain motion from the profile while respecting explicit and vertical choices", () => {
  expect(resolveTabsAppearance(undefined)).toBe("standard");
  expect(resolveTabsAppearance(undefined, "slide")).toBe("slide");
  expect(resolveTabsAppearance("standard", "slide")).toBe("standard");
  expect(resolveTabsAppearance("gooey", "slide")).toBe("gooey");
  expect(resolveTabsAppearance("slide", "none")).toBe("slide");
  for (const appearance of [undefined, "slide", "gooey"] as const) expect(resolveTabsAppearance(appearance, "slide", "vertical")).toBe("standard");
});

it("slides between measured edges without the elastic union stretch", () => {
  const recipe = resolveTabIndicator({ x: 100, width: 80 }, { x: 0, width: 40 }, "slide");
  expect(recipe.duration).toBe(motion.normal);
  expect(sampleTabIndicator(recipe, 0)).toEqual({ x: 100, width: 80 });
  expect(sampleTabIndicator(recipe, 0.5)).toEqual({ x: 50, width: 60 });
  expect(sampleTabIndicator(recipe, 1)).toEqual({ x: 0, width: 40 });
  expect(sampleTabIndicator(recipe, -1)).toEqual({ x: 100, width: 80 });
  expect(sampleTabIndicator(recipe, 2)).toEqual({ x: 0, width: 40 });
  expect(() => resolveTabIndicator({ x: 0, width: 0 }, { x: 0, width: 40 }, "slide")).toThrow(RangeError);
});

it("continues an interrupted elastic frame into an ordinary slide", () => {
  const elastic = resolveTabIndicator({ x: 10, width: 30 }, { x: 80, width: 50 }, "gooey");
  const visible = sampleTabIndicator(elastic, 0.45);
  expect(visible).toEqual({ x: 10, width: 120 });
  const next = resolveTabIndicator(visible, { x: 180, width: 60 }, "slide");
  expect(sampleTabIndicator(next, 0)).toEqual(visible);
  expect(sampleTabIndicator(next, 1)).toEqual({ x: 180, width: 60 });
});
