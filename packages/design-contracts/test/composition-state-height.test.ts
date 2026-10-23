import { expect, it } from "vitest";
import { resolveCompositionStateMinHeight } from "../src/screen-patterns.js";

it("resolves only the declared state height steps", () => {
  expect([resolveCompositionStateMinHeight(), resolveCompositionStateMinHeight("compact"), resolveCompositionStateMinHeight("regular"), resolveCompositionStateMinHeight("large")])
    .toEqual([null, 96, 160, 220]);
  expect(() => resolveCompositionStateMinHeight("120" as never)).toThrow(TypeError);
});
