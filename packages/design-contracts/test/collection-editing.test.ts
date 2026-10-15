import { expect, it } from "vitest";
import { changeColumnSettings, focusAfterRemoval, recoverableFilters, snapshotSelection } from "../src/collection-editing.js";

it("captures mutation scope independently of later selection changes", () => {
  const selected = ["record-a", "record-b"], scope = snapshotSelection(selected);
  selected.splice(0, 1, "record-c");
  expect(scope).toEqual(["record-a", "record-b"]);
  expect(Object.isFrozen(scope)).toBe(true);
  expect(() => snapshotSelection(["a", "a"])).toThrow();
  expect(focusAfterRemoval(["a", "b", "c"], "b")).toBe("c");
  expect(focusAfterRemoval(["a", "b", "c"], "b", ["c"])).toBe("a");
  expect(focusAfterRemoval(["a", "b", "c"], "b", ["a", "c"])).toBeUndefined();
  expect(focusAfterRemoval(["a"], "a")).toBeUndefined();
});
it("preserves fixed-column barriers, the last visible column and caller metadata", () => {
  const columns = [{ id: "name", label: "이름", visible: true, locked: true },
    { id: "score", label: "점수", visible: true, format: "decimal" }, { id: "year", label: "연도", visible: false }];
  expect(changeColumnSettings(columns, "name", "toggle")).toBe(columns);
  expect(changeColumnSettings(columns, "score", "earlier")).toBe(columns);
  const reordered = changeColumnSettings(columns, "year", "earlier");
  expect(reordered.map(column => column.id)).toEqual(["name", "year", "score"]);
  expect(reordered[2]).toBe(columns[1]);
  const hidden = changeColumnSettings(columns, "score", "toggle");
  expect(hidden[1]).toMatchObject({ visible: false, format: "decimal" });
  const one = [{ id: "score", label: "점수", visible: true }];
  expect(changeColumnSettings(one, "score", "toggle")).toBe(one);
});
it("only offers recoveries with actual positive result counts", () => {
  expect(recoverableFilters([{ id: "a", label: "기간", resultCount: 0 }, { id: "b", label: "주제", resultCount: 3 }]).map(option => option.id)).toEqual(["b"]);
  expect(() => recoverableFilters([{ id: "a", label: "기간", resultCount: NaN }])).toThrow();
  expect(() => recoverableFilters([{ id: "a", label: "기간", resultCount: -1 }])).toThrow();
});
