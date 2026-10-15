import { expect, it } from "vitest";
import { resolveFollowProposal, resolveAttendanceProposal, resolveAttendanceChoice } from "../src/social-compositions.js";
const choices = [{ id: "yes", label: "참석", attending: true }, { id: "no", label: "불참", attending: false }, { id: "maybe", label: "미정", attending: false }];
it("derives immutable follow proposals from the confirmed state without drifting counts", () => {
  const state = { following: false, count: 12 }, next = resolveFollowProposal(state, true);
  expect(next).toEqual({ following: true, count: 13 }); expect(Object.isFrozen(next)).toBe(true); expect(state.count).toBe(12);
  expect(resolveFollowProposal(next, true).count).toBe(13); expect(resolveFollowProposal(next, false)).toEqual(state);
  expect(() => resolveFollowProposal({ following: false, count: Number.MAX_SAFE_INTEGER }, true)).toThrow();
  expect(() => resolveFollowProposal({ following: true, count: 0 }, false)).toThrow();
});
it("changes attendee counts only when crossing the actual attending boundary", () => {
  const state = { responseId: null, count: 2 };
  const next = resolveAttendanceProposal(state, choices, "yes"); expect(next).toEqual({ responseId: "yes", count: 3 });
  expect(resolveAttendanceProposal(next, choices, "yes").count).toBe(3);
  expect(resolveAttendanceProposal(next, choices, "maybe").count).toBe(2);
  expect(resolveAttendanceProposal({ responseId: "no", count: 0 }, choices, "maybe").count).toBe(0);
  expect(() => resolveAttendanceProposal(state, choices, "unknown")).toThrow();
  expect(() => resolveAttendanceChoice([...choices, choices[0]!], null)).toThrow();
  expect(() => resolveAttendanceProposal({ responseId: "yes", count: 0 }, choices, "no")).toThrow();
});
