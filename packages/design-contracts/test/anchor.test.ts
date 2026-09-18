import { expect, it } from "vitest";
import { getAnchorCurrentId, resolveAnchorItems } from "../src/anchor.js";
it("encodes same-document IDs and rejects ambiguous or unusable targets", () => {
  expect(resolveAnchorItems([{ id: "시작", label: "시작" }])[0]?.href).toBe("#%EC%8B%9C%EC%9E%91");
  expect(() => resolveAnchorItems([{ id: "one", label: "첫째" }, { id: "one", label: "둘째" }])).toThrow(/Duplicate/);
  expect(() => resolveAnchorItems([{ id: "two words", label: "목차" }])).toThrow();
  expect(() => resolveAnchorItems([])).toThrow();
});
it("uses geometric order and an explicit bottom signal without mutating caller positions", () => {
  const positions = [{ id: "two", top: 150 }, { id: "one", top: -10 }, { id: "three", top: 300 }];
  expect(getAnchorCurrentId(positions, 20)).toBe("one"); expect(getAnchorCurrentId(positions, 160)).toBe("two");
  expect(getAnchorCurrentId(positions, 20, true)).toBe("three"); expect(positions[0]?.id).toBe("two");
  expect(getAnchorCurrentId([])).toBeUndefined(); expect(() => getAnchorCurrentId(positions, -1)).toThrow();
});
