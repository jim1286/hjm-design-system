import { expect, it } from "vitest";
import { resolveContentTransition } from "../src/content-transition.js";
it("mirrors only inline travel and preserves the final content geometry", () => {
  expect(resolveContentTransition("slide", "rtl").translateX).toBe(-resolveContentTransition("slide", "ltr").translateX);
  expect(resolveContentTransition("rise", "rtl")).toEqual(resolveContentTransition("rise", "ltr"));
  expect(resolveContentTransition().scale).toBe(1);
});

it("rejects unknown presets instead of silently changing presentation", () => {
  expect(() => resolveContentTransition("unknown" as never)).toThrow(TypeError);
});
