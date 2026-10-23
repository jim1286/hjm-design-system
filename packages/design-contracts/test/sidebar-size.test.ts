import { expect, it } from "vitest";
import { sidebarDefaults, sidebarRecipe, sidebarSizes } from "../src/sidebar.js";

it("offers two open widths and keeps the regular one as the default and the legacy expanded width", () => {
  expect(sidebarSizes).toEqual(["compact", "regular"]);
  expect(sidebarDefaults.size).toBe("regular");
  expect(sidebarRecipe.sizes).toEqual({ compact: 220, regular: 260 });
  expect(sidebarRecipe.widths.expanded).toBe(sidebarRecipe.sizes.regular);
  // Even the compact rail must leave room past the collapsed icon rail for a label.
  expect(sidebarRecipe.sizes.compact).toBeGreaterThan(sidebarRecipe.widths.collapsed * 2);
});
