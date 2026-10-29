import { expect, it } from "vitest";
import { clampCircularPhotoCrop, resolveCircularPhotoCrop } from "../src/image.js";

// 2026-10-29: the circular profile crop returns the source square under the viewport.
it("crops the centred short-side square at zoom 1 and follows pan and zoom", () => {
  expect(resolveCircularPhotoCrop({ zoom: 1, x: 0, y: 0 }, 4000, 3000, 300)).toEqual({ originX: 500, originY: 0, width: 3000, height: 3000 });
  // Dragging the photo right shows its left part.
  expect(resolveCircularPhotoCrop({ zoom: 1, x: 50, y: 0 }, 4000, 3000, 300).originX).toBe(0);
  expect(resolveCircularPhotoCrop({ zoom: 2, x: 0, y: 0 }, 4000, 3000, 300)).toEqual({ originX: 1250, originY: 750, width: 1500, height: 1500 });
});

it("never lets the circle show empty space or zoom below cover", () => {
  expect(clampCircularPhotoCrop({ zoom: 0.5, x: 999, y: 999 }, 4000, 3000, 300)).toEqual({ zoom: 1, x: 50, y: 0 });
  expect(clampCircularPhotoCrop({ zoom: 9, x: 0, y: 0 }, 1000, 1000, 300).zoom).toBe(4);
});
