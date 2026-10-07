import { expect, it } from "vitest";
import { dateTimeSelectionReducer as reduce, initialDateTimeSelection, dateTimeSelectionValue, dateTimeSelectionDisplay } from "../../../shared/date-time-selection";

it("keeps month navigation separate from the picked date and time", () => {
  const original = initialDateTimeSelection("failed");
  const next = reduce(original, { type: "month", value: "2026-10" });
  expect(dateTimeSelectionValue(next)).toBe("2026-09-16 09:30");
  expect(next.month).toBe("2026-10");
  expect(original.month).toBe("2026-09");
});
it("blocks incomplete and duplicate confirmation and retains the pending snapshot", () => {
  const empty = initialDateTimeSelection();
  expect(reduce(empty, { type: "confirm" })).toBe(empty);
  const pending = reduce(initialDateTimeSelection("failed"), { type: "confirm" });
  for (const action of [{ type: "date", value: "2026-10-10" }, { type: "hour", value: "18" }, { type: "minute", value: "40" }, { type: "month", value: "2026-11" }, { type: "reset" }, { type: "confirm" }, { type: "armFailure" }] as const) {
    expect(reduce(pending, action)).toBe(pending);
  }
  const resolved = reduce(pending, { type: "respond" });
  expect(resolved.saved).toBe("2026-09-16 09:30");
  expect(reduce(resolved, { type: "respond" })).toBe(resolved);
});
it("preserves all picked values through failure and retry, and invalidates an old success on editing", () => {
  const selected = initialDateTimeSelection("failed");
  const failure = reduce(reduce(reduce(selected, { type: "armFailure" }), { type: "confirm" }), { type: "respond" });
  expect(failure.status).toBe("failed");
  expect(dateTimeSelectionValue(failure)).toBe("2026-09-16 09:30");
  const saved = reduce(reduce(failure, { type: "confirm" }), { type: "respond" });
  expect(saved.status).toBe("saved");
  const changed = reduce(saved, { type: "minute", value: "45" });
  expect(changed.saved).toBeNull();
  expect(changed.status).toBe("idle");
  expect(dateTimeSelectionValue(changed)).toBe("2026-09-16 09:45");
  expect(dateTimeSelectionValue(reduce(changed, { type: "reset" }))).toBeNull();
});
it("keeps disabled fixtures immutable for user actions", () => {
  const selected = initialDateTimeSelection("failed");
  expect(reduce(selected, { type: "date", value: null }, true)).toBe(selected);
  expect(reduce(selected, { type: "confirm" }, true)).toBe(selected);
  expect(reduce(selected, { type: "reset" }, true)).toBe(selected);
});

it("isolates display groups in RTL without changing the civil transport value", () => {
  const state = initialDateTimeSelection("failed");
  const value = dateTimeSelectionValue(state)!;
  expect(dateTimeSelectionDisplay(value)).toBe("\u20662026-09-16 09:30\u2069");
  expect(dateTimeSelectionValue(state)).toBe("2026-09-16 09:30");
});
