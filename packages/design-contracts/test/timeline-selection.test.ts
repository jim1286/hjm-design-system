import { expect, it } from "vitest";
import { getTimelineSelectionTarget, resolveTimelineDescriptor, timelineRecipe, validateTimelineSelection } from "../src/timeline.js";

const items = [{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }] as const;
const compose = ({ label }: { label: string }) => label;

it("marks only the selected record and rejects unknown ids", () => {
  expect(resolveTimelineDescriptor({ items, selectedId: "b" }, { composeAccessibleName: compose }).map(item => item.selected)).toEqual([false, true, false]);
  expect(resolveTimelineDescriptor({ items }, { composeAccessibleName: compose }).every(item => !item.selected)).toBe(true);
  expect(() => resolveTimelineDescriptor({ items, selectedId: "z" as "a" }, { composeAccessibleName: compose })).toThrow(RangeError);
  expect(timelineRecipe.item.selected.borderWidth).toBe(1);
});

it("navigates without wrapping and ignores keys it does not own", () => {
  expect(getTimelineSelectionTarget(items, "a", "ArrowDown")).toBe("b");
  expect(getTimelineSelectionTarget(items, "a", "ArrowUp")).toBe("a");
  expect(getTimelineSelectionTarget(items, "c", "ArrowDown")).toBe("c");
  expect(getTimelineSelectionTarget(items, null, "End")).toBe("c");
  expect(getTimelineSelectionTarget(items, "b", "Home")).toBe("a");
  expect(getTimelineSelectionTarget(items, "b", "ArrowRight")).toBeUndefined();
});

it("requires selectedId and onSelectedIdChange together and forbids actions on selectable records", () => {
  expect(() => validateTimelineSelection(undefined, undefined, { hasActions: true })).not.toThrow();
  expect(() => validateTimelineSelection(null, () => {})).not.toThrow();
  expect(() => validateTimelineSelection("a", undefined)).toThrow(TypeError);
  expect(() => validateTimelineSelection(undefined, () => {})).toThrow(TypeError);
  expect(() => validateTimelineSelection(null, () => {}, { hasActions: true })).toThrow(TypeError);
});

it("supports passive journals and keeps record compatibility", () => {
  expect(() => validateTimelineSelection(undefined, undefined, {hasActions: false, variant: "record"})).not.toThrow();
  expect(() => validateTimelineSelection(undefined, undefined, {hasActions: false, variant: "journal"})).not.toThrow();
  expect(() => validateTimelineSelection(null, () => {}, {hasActions: false, variant: "journal"})).not.toThrow();
});
