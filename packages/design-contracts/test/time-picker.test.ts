import { expect, it } from "vitest";
import { validateTimePicker, timePickerDraft, timePickerItems, resolveTimePickerValue } from "../src/time-picker.js";
const labels = { label: "Time", hour: "Hour", minute: "Minute", placeholder: "Choose", confirm: "Confirm", cancel: "Cancel" };
it("preserves midnight and requires both segments without a Date/timezone conversion", () => {
  expect(timePickerDraft("00:00")).toEqual({ hour: "00", minute: "00" });
  expect(resolveTimePickerValue(timePickerDraft("00:00"), {})).toBe("00:00");
  expect(resolveTimePickerValue({ hour: "00", minute: null }, {})).toBeNull();
  for (const value of ["24:00", "00:60", "9:30", "2026-10-19"]) expect(() => validateTimePicker({ value, labels, onValueChange() {} })).toThrow();
});
it("requires a consistent minute grid and preserves off-grid input until explicitly changed", () => {
  for (const minuteStep of [0, 7, 1.5, 61]) expect(() => validateTimePicker({ value: null, labels, minuteStep, onValueChange() {} })).toThrow();
  expect(timePickerItems("minute", timePickerDraft("14:30"), { minuteStep: 15 }).map(x => x.value)).toEqual(["00", "15", "30", "45"]);
  expect(resolveTimePickerValue(timePickerDraft("14:31"), { minuteStep: 15 })).toBeNull();
});
it("keeps an hour available when any slot is usable and never substitutes an unavailable minute", () => {
  const options = { minuteStep: 15, isTimeUnavailable: (time: string) => time !== "14:45" };
  const draft = timePickerDraft("14:30");
  expect(timePickerItems("hour", draft, options).filter(x => !x.disabled).map(x => x.value)).toEqual(["14"]);
  expect(timePickerItems("minute", draft, options).filter(x => !x.disabled).map(x => x.value)).toEqual(["45"]);
  expect(resolveTimePickerValue(draft, options)).toBeNull();
  expect(resolveTimePickerValue(timePickerDraft("14:45"), options)).toBe("14:45");
});
