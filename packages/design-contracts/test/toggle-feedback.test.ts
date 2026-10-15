import { expect, it } from "vitest";
import { resolveToggleFeedbackProposal, resolveToggleFeedbackFrame, toggleFeedbackPaths } from "../src/toggle-feedback.js";
it("captures immutable proposals and rejects invalid totals", () => {
 const confirmed = { selected: false, count: 10 }, next = resolveToggleFeedbackProposal(confirmed, true);
 expect(next).toEqual({ selected: true, count: 11 }); expect(Object.isFrozen(next)).toBe(true); expect(confirmed.count).toBe(10);
 expect(resolveToggleFeedbackProposal(next, true).count).toBe(11); expect(resolveToggleFeedbackProposal(next, false)).toEqual(confirmed);
 expect(() => resolveToggleFeedbackProposal({ selected: true, count: 0 }, false)).toThrow(); expect(() => resolveToggleFeedbackProposal({ selected: false, count: Number.MAX_SAFE_INTEGER }, true)).toThrow();
});
it("provides distinct transient geometry that settles without changing the product state", () => {
 expect(resolveToggleFeedbackFrame("ripple", .5).radius).toBeGreaterThan(resolveToggleFeedbackFrame("ripple", 0).radius);
 expect(resolveToggleFeedbackFrame("ribbon", .5).translateY).toBeLessThan(0);
 expect(resolveToggleFeedbackFrame("burst", .5).rays).not.toBe(resolveToggleFeedbackFrame("burst", 0).rays);
 for (const effect of ["ripple", "ribbon", "burst"] as const) { expect(toggleFeedbackPaths[effect].length).toBeGreaterThan(10); expect(resolveToggleFeedbackFrame(effect, 1)).toMatchObject({ opacity: 0, translateY: 0, scale: 1 }); }
 expect(() => resolveToggleFeedbackFrame("burst", Number.NaN)).toThrow();
});
