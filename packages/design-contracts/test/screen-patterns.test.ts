import { describe, expect, it } from "vitest";
import { canSubmitMessage, validateMessageAttachments, resolveScreenContentState, resolveSearchScreenPhase, resolveSearchCommit, resolveSearchEmptyCause, resolveFocusAfterRemoval, searchScreenRecipe, type ScreenContentState } from "../src/screen-patterns.js";

describe("screen content and composer ownership", () => {
  it("only replaces content for explicit initial states", () => {
    expect(resolveScreenContentState().replacesContent).toBe(false);
    for (const kind of ["loading", "empty", "error", "restricted"] as const) {
      const state = resolveScreenContentState({ kind, title: "Localized title" });
      expect(state.replacesContent).toBe(true);
      expect(state.busy).toBe(kind === "loading");
      expect(state.announcement).toBe(kind === "error" ? "assertive" : "polite");
      expect(() => resolveScreenContentState({ kind, title: "  " })).toThrow();
    }
    expect(() => resolveScreenContentState({ kind: "unknown" } as unknown as ScreenContentState)).toThrow();
  });
  it("does not submit empty, disabled or pending drafts", () => {
    const draft = { value: " 안녕하세요\n두 번째 줄 ", label: "메시지", sendLabel: "보내기" };
    expect(canSubmitMessage(draft)).toBe(true);
    expect(canSubmitMessage({ ...draft, value: " \n\t" })).toBe(false);
    expect(canSubmitMessage({ ...draft, disabled: true })).toBe(false);
    expect(canSubmitMessage({ ...draft, pending: true })).toBe(false);
  });
});

it("allows photo-only messages while rejecting invalid attachment counts", () => {
  const draft = { value: "", label: "메시지", sendLabel: "전송", attachmentCount: 2 };
  expect(canSubmitMessage(draft)).toBe(true);
  expect(canSubmitMessage({...draft,pending:true})).toBe(false);
  expect(canSubmitMessage({...draft,disabled:true})).toBe(false);
  for (const attachmentCount of [-1, 1.5, NaN]) expect(() => canSubmitMessage({...draft,attachmentCount})).toThrow();
});

it("rejects ambiguous photo removal targets and missing localized names", () => {
  const photo = {id:"photo",removeLabel:"사진 삭제"};
  expect(() => validateMessageAttachments([photo,photo])).toThrow();
  expect(() => validateMessageAttachments([{...photo,id:" "}])).toThrow();
  expect(() => validateMessageAttachments([{...photo,removeLabel:" "}])).toThrow();
  expect(() => validateMessageAttachments([photo,{...photo,id:"other"}])).not.toThrow();
});

// 2026-10-06 SearchScreen public API: phases, commits and empty causes are shared by both renderers.
describe("search screen phases", () => {
  it("keeps one-step search on results and splits typing from committed results in two-step search", () => {
    expect(resolveSearchScreenPhase("  ")).toBe("idle");
    expect(resolveSearchScreenPhase("산")).toBe("results");
    expect(resolveSearchScreenPhase("", "산책")).toBe("idle");
    expect(resolveSearchScreenPhase("산", "")).toBe("typing");
    expect(resolveSearchScreenPhase("산", "산책")).toBe("typing");
    expect(resolveSearchScreenPhase("산책 ", "산책")).toBe("results");
  });
  it("drops blank commits and trims the recorded value", () => {
    expect(resolveSearchCommit("  ")).toBeNull();
    expect(resolveSearchCommit(" 산책 ")).toBe("산책");
  });
  it("blames filters only when filters are applied, and never while loading", () => {
    expect(resolveSearchEmptyCause(null, 2)).toBe("none");
    expect(resolveSearchEmptyCause(3, 0)).toBe("none");
    expect(resolveSearchEmptyCause(0, 2)).toBe("filters");
    expect(resolveSearchEmptyCause(0, 0)).toBe("query");
    expect(() => resolveSearchEmptyCause(-1, 0)).toThrow(RangeError);
    expect(() => resolveSearchEmptyCause(0, 1.5)).toThrow(RangeError);
  });
  it("moves focus to the item that replaced the removed one, then the last, then the fallback", () => {
    expect(resolveFocusAfterRemoval(0, 2)).toBe(0);
    expect(resolveFocusAfterRemoval(2, 2)).toBe(1);
    expect(resolveFocusAfterRemoval(0, 0)).toBe(-1);
    expect(() => resolveFocusAfterRemoval(-1, 1)).toThrow(RangeError);
  });
  it("keeps section geometry on spacing tokens", () => {
    expect(searchScreenRecipe).toMatchObject({ recentVisible: 5, suggestionVisible: 6, loadingRows: 4, sectionGap: 24, headerGap: 12, chipGap: 8 });
  });
});
