import { describe, expect, it } from "vitest";
import { celebrationColors, reorderIntent, validateItems, validateCarousel } from "../src/interaction-adapters.js";
const items = [{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }];
describe("optional interaction boundaries", () => {
  it("moves stable IDs without mutating controlled data", () => {
    expect(reorderIntent(items, "a", 2, "drag")).toEqual({ itemId: "a", fromIndex: 0, toIndex: 2, orderedIds: ["b", "c", "a"], source: "drag" });
    expect(items.map(item => item.id)).toEqual(["a", "b", "c"]);
  });
  it("keeps disabled rows fixed even if another row crosses them", () => {
    const locked = [items[0]!, { ...items[1]!, disabled: true }, items[2]!];
    expect(reorderIntent(locked, "a", 2, "drag")).toBeNull();
    expect(reorderIntent(locked, "b", 0, "keyboard")).toBeNull();
  });
  it("rejects ambiguous identity and stale selection", () => {
    expect(() => validateItems([items[0]!, items[0]!])).toThrow();
    expect(() => validateCarousel(items, "gone")).toThrow();
    expect(() => validateCarousel([], "a")).toThrow();
    expect(reorderIntent(items, "gone", 0, "drag")).toBeNull();
    expect(reorderIntent(items, "a", 9, "keyboard")).toBeNull();
    expect(reorderIntent(items, "a", 0.5, "keyboard")).toBeNull();
    expect(reorderIntent(items, "a", 0, "drag")).toBeNull();
  });
  // 2026-09-30: primary + pale surfaceAccent read as a sparse single-color burst on device.
  it("celebrates with the primary plus every theme status accent", () => {
    expect(celebrationColors("#p", { info: "#i", success: "#s", warning: "#w", attention: "#a" })).toEqual(["#p", "#i", "#s", "#w", "#a"]);
  });
});
