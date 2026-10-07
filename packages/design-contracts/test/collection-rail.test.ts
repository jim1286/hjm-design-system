import { describe, expect, it } from "vitest";
import { validateCollectionRail, resolveCollectionRailLayout, resolveCollectionRailViewport,
  getCollectionRailTargetOffset, getCollectionRailItemOffset, getCollectionRailRevealOffset,
  getCollectionRailPhysicalOffset, getCollectionRailKeyboardIntent } from "../src/collection-rail.js";

describe("finite independently interactive collection placement", () => {
  it("rejects ambiguous identity and impossible measurements", () => {
    expect(() => validateCollectionRail([{ id: "a", label: "A" }, { id: "a", label: "B" }])).toThrow();
    expect(() => validateCollectionRail([{ id: "a", label: "" }])).toThrow();
    expect(() => validateCollectionRail([], "missing")).toThrow();
    for (const width of [-1, NaN, Infinity]) expect(() => resolveCollectionRailLayout(4, width)).toThrow();
    expect(() => resolveCollectionRailLayout(1.5, 390)).toThrow();
    expect(() => getCollectionRailItemOffset(resolveCollectionRailLayout(2, 390), 2)).toThrow();
  });
  it("shows multiple full items and a hint without looping at the finite end", () => {
    const wide = resolveCollectionRailLayout(5, 1000);
    expect(wide.itemWidth * 2 + wide.gap).toBeLessThan(wide.viewport);
    let offset = 0;
    for (let i = 0; i < 20; i++) offset = getCollectionRailTargetOffset(wide, offset, "next");
    expect(offset).toBe(wide.contentWidth - wide.viewport);
    expect(resolveCollectionRailViewport(wide, offset).atEnd).toBe(true);
    for (let i = 0; i < 20; i++) offset = getCollectionRailTargetOffset(wide, offset, "previous");
    expect(offset).toBe(0);
    const narrow = resolveCollectionRailLayout(5, 358);
    expect(narrow.itemWidth).toBe(334);
    expect(narrow.viewport - narrow.itemWidth - narrow.gap).toBe(8);
  });
  it("clamps host rubber-band offsets and fits an empty or short list", () => {
    const empty = resolveCollectionRailLayout(0, 390);
    expect(resolveCollectionRailViewport(empty, 100)).toMatchObject({ startIndex: -1, atStart: true, atEnd: true });
    const single = resolveCollectionRailLayout(1, 1000);
    expect(getCollectionRailTargetOffset(single, -100, "next")).toBe(0);
    const many = resolveCollectionRailLayout(4, 390);
    expect(resolveCollectionRailViewport(many, many.maxOffset + 40).offset).toBe(many.maxOffset);
  });
  it("reveals partially visible independent actions and preserves an item anchor on resize", () => {
    const old = resolveCollectionRailLayout(5, 1000), narrow = resolveCollectionRailLayout(5, 358);
    const reveal = getCollectionRailRevealOffset(old, 0, 2);
    expect(reveal).toBe(112);
    expect(getCollectionRailRevealOffset(old, reveal, 0)).toBe(0);
    const anchorIndex = resolveCollectionRailViewport(old, getCollectionRailItemOffset(old, 2)).startIndex;
    expect(resolveCollectionRailViewport(narrow, getCollectionRailItemOffset(narrow, anchorIndex)).startIndex).toBe(anchorIndex);
  });
  it("translates direction without reversing logical data or editing keys", () => {
    const geometry = resolveCollectionRailLayout(5, 390);
    for (const logical of [0, 100, geometry.maxOffset]) {
      const physical = getCollectionRailPhysicalOffset(geometry, logical, "rtl");
      expect(getCollectionRailPhysicalOffset(geometry, physical, "rtl")).toBe(logical);
    }
    expect(getCollectionRailKeyboardIntent("ArrowLeft", "rtl")).toBe("next");
    expect(getCollectionRailKeyboardIntent("ArrowRight", "rtl")).toBe("previous");
    expect(getCollectionRailKeyboardIntent("Enter", "ltr")).toBeUndefined();
  });
});
