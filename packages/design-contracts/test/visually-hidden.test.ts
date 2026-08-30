import { describe, expect, it } from "vitest";

import { visuallyHiddenRecipe } from "../src/visually-hidden.js";

describe("VisuallyHidden contract", () => {
  it("keeps content in the accessibility tree while removing visual geometry", () => {
    expect(visuallyHiddenRecipe).toMatchObject({
      geometry: { width: 1, height: 1, margin: -1, border: 0, padding: 0 },
      clipping: "inset(50%)",
      overflow: "hidden",
      position: "absolute",
      whiteSpace: "nowrap",
    });
  });
});
