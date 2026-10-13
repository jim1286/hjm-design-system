import { describe, expect, it } from "vitest";
import { createActionSession, resolveSaveFeedback, type SaveFeedbackInput } from "../src/action-session.js";

const base = { phase: "idle", dirty: true, valid: true, hasSaved: false } satisfies SaveFeedbackInput;
describe("current-draft save feedback", () => {
  it.each([
    [{}, "unsaved", true, false],
    [{ dirty: false }, "unchanged", false, false],
    [{ dirty: false, hasSaved: true }, "unchanged", false, true],
    [{ valid: false }, "unsaved", false, false],
    [{ disabled: true }, "unsaved", false, false],
    [{ phase: "pending" }, "pending", false, false],
    [{ phase: "pending", dirty: false, hasSaved: true }, "pending", false, true],
    [{ phase: "error" }, "error", true, false],
    [{ phase: "error", valid: false }, "error", false, false],
    [{ phase: "error", dirty: false, hasSaved: true }, "unchanged", false, true],
    [{ phase: "success", dirty: false, hasSaved: true }, "saved", false, true],
    [{ phase: "success", hasSaved: true }, "saved-with-changes", true, false],
  ] satisfies [Partial<SaveFeedbackInput>, string, boolean, boolean][])("classifies %j", (input, feedback, canSubmit, currentSaved) => {
    expect(resolveSaveFeedback({ ...base, ...input })).toEqual({ feedback, canSubmit, currentSaved, pending: input.phase === "pending" });
  });
  it("keeps B unsaved after A succeeds and submits the current draft after a failure", async () => {
    const session = createActionSession("");
    let draft = "A";
    const read = () => { const state = session.getSnapshot(); return resolveSaveFeedback({ phase: state.status, dirty: draft !== state.value, valid: !!draft, hasSaved: !!state.value }); };
    let complete!: (value: string) => void;
    const submitted = draft;
    const first = session.run(() => new Promise<string>(resolve => { complete = resolve; }));
    draft = "B";
    expect(read()).toMatchObject({ feedback: "pending", canSubmit: false });
    complete(submitted); await first;
    expect(session.getSnapshot().value).toBe("A");
    expect(read()).toMatchObject({ feedback: "saved-with-changes", canSubmit: true, currentSaved: false });
    await session.run(() => { throw new Error("offline"); }, { retryable: true });
    expect(read().feedback).toBe("error");
    draft = "C";
    // Current-draft save is run(new snapshot), not retry() of the failed B proposal.
    await session.run(() => draft);
    expect(session.getSnapshot().value).toBe("C");
    expect(read()).toMatchObject({ feedback: "saved", canSubmit: false, currentSaved: true });
  });
});
