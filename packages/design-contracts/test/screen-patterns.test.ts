import { describe, expect, it } from "vitest";
import { shouldSubmitMessageKey, canSubmitMessage, validateMessageAttachments, resolveScreenContentState, resolveSearchScreenPhase, resolveSearchCommit, resolveSearchDebounceMs, resolveSearchEmptyCause, resolveSearchFilterRailVisible, resolveFocusAfterRemoval, searchScreenRecipe, type ScreenContentState } from "../src/screen-patterns.js";

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
  it("keeps scope filters on a query-caused zero but hides narrowing ones, and hides every rail while typing", () => {
    expect(resolveSearchFilterRailVisible("results", true, "query")).toBe(false);
    expect(resolveSearchFilterRailVisible("results", true, "query", "scope")).toBe(true);
    expect(resolveSearchFilterRailVisible("results", false, "query", "scope")).toBe(true);
    expect(resolveSearchFilterRailVisible("results", true, "filters")).toBe(true);
    expect(resolveSearchFilterRailVisible("typing", true, "none", "scope")).toBe(false);
    expect(resolveSearchFilterRailVisible("idle", false, "none")).toBe(true);
    expect(() => resolveSearchFilterRailVisible("results", true, "query", "wide" as never)).toThrow(RangeError);
  });
  it("moves focus to the item that replaced the removed one, then the last, then the fallback", () => {
    expect(resolveFocusAfterRemoval(0, 2)).toBe(0);
    expect(resolveFocusAfterRemoval(2, 2)).toBe(1);
    expect(resolveFocusAfterRemoval(0, 0)).toBe(-1);
    expect(() => resolveFocusAfterRemoval(-1, 1)).toThrow(RangeError);
  });
  it("rejects malformed search counts even when the result is loading or nonempty", () => {
    for (const count of [1.5, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => resolveSearchEmptyCause(count, 0)).toThrow(RangeError);
    }
    for (const count of [null, 3]) {
      for (const filters of [-1, 1.5, NaN, Infinity]) {
        expect(() => resolveSearchEmptyCause(count, filters)).toThrow(RangeError);
      }
    }
  });
  it("keeps section geometry on spacing tokens", () => {
    expect(searchScreenRecipe).toMatchObject({ recentVisible: 5, suggestionVisible: 6, loadingRows: 4, sectionGap: 24, headerGap: 12, chipGap: 8 });
  });
});

it("keeps newline default and protects Shift, composing, and Safari 229 when opting into Enter send", () => {
  expect(shouldSubmitMessageKey({key:"Enter"})).toBe(false);
  expect(shouldSubmitMessageKey({key:"Enter"}, "send")).toBe(true);
  for (const event of [{key:"Enter",shiftKey:true},{key:"Enter",isComposing:true},{key:"Enter",keyCode:229},{key:"a"}]) expect(shouldSubmitMessageKey(event,"send")).toBe(false);
});

it("reveals timestamps only for rightward horizontal intent", async () => {
  const { timestampRevealOffset } = await import("../src/screen-patterns.js");
  expect(timestampRevealOffset(8, 0)).toBe(0);
  expect(timestampRevealOffset(40, 30)).toBe(0);
  expect(timestampRevealOffset(-80, 0)).toBe(0);
  expect(timestampRevealOffset(60, 4)).toBe(60);
  expect(timestampRevealOffset(200, 4)).toBe(88);
});

// Timer handles stay renderer-owned; defaulting and validation are platform-independent.
describe("search debounce delay", () => {
  it("uses the recipe default while preserving zero, finite custom values and negative clamping", () => {
    expect(resolveSearchDebounceMs()).toBe(searchScreenRecipe.debounceMs);
    expect(resolveSearchDebounceMs(0)).toBe(0);
    expect(resolveSearchDebounceMs(12.5)).toBe(12.5);
    expect(resolveSearchDebounceMs(1500)).toBe(1500);
    expect(resolveSearchDebounceMs(-5)).toBe(0);
  });
  it.each([NaN, Infinity, -Infinity])("rejects nonfinite delay %s before scheduling", value => {
    expect(() => resolveSearchDebounceMs(value)).toThrow(RangeError);
  });
});

describe("initial focus resolution", () => {
  const field = (order: number, preference?: boolean, focusable = true) => ({ order, preference, focusable });
  it("picks the preferred, else first focusable field for first-input", async () => {
    const { resolveInitialFocusTarget } = await import("../src/screen-patterns.js");
    expect(resolveInitialFocusTarget([field(1), field(0, undefined, false), field(2, true)], "first-input")?.order).toBe(2);
    expect(resolveInitialFocusTarget([field(1), field(0, undefined, false)], "first-input")?.order).toBe(1);
    expect(resolveInitialFocusTarget([field(0, false)], "first-input")).toBeNull();
    expect(resolveInitialFocusTarget([field(0)], "none")).toBeNull();
  });
  it("focuses only a lone text entry for single-input", async () => {
    const { resolveInitialFocusTarget, initialFocusDefaults } = await import("../src/screen-patterns.js");
    expect(resolveInitialFocusTarget([field(0)], "single-input")?.order).toBe(0);
    expect(resolveInitialFocusTarget([field(0), field(1)], "single-input")).toBeNull();
    expect(resolveInitialFocusTarget([field(0, undefined, false)], "single-input")).toBeNull();
    expect(initialFocusDefaults).toMatchObject({ screen: "first-input", search: "first-input", editor: "first-input", chat: "first-input", commentThread: "first-input", overlay: "single-input", auth: "first-input" });
  });
  it("keeps the entry window open under an overlay and for late fields until the user interacts", async () => {
    const { resolveEntryFocus } = await import("../src/screen-patterns.js");
    const facts = (candidates: ReturnType<typeof field>[], blocked = false, textEntryFocused = false) => ({ mode: "first-input" as const, candidates, blocked, textEntryFocused });
    // Entered under a modal: wait; a tap inside the modal does not end the window; closing it focuses the field.
    expect(resolveEntryFocus("entering", { kind: "enter" }, facts([field(0)], true))).toEqual({ phase: "open", target: null });
    expect(resolveEntryFocus("open", { kind: "interact" }, facts([field(0)], true)).phase).toBe("open");
    expect(resolveEntryFocus("open", { kind: "unblock" }, facts([field(0)])).target?.order).toBe(0);
    // A field appearing after async data still gets entry focus, unless the user has touched the screen first.
    expect(resolveEntryFocus("entering", { kind: "enter" }, facts([]))).toEqual({ phase: "open", target: null });
    expect(resolveEntryFocus("open", { kind: "register", field: field(0) }, facts([field(0)])).target?.order).toBe(0);
    expect(resolveEntryFocus("open", { kind: "interact" }, facts([])).phase).toBe("settled");
    expect(resolveEntryFocus("settled", { kind: "register", field: field(0) }, facts([field(0)])).target).toBeNull();
    // Never over a focused text field; never while inactive or still entering.
    expect(resolveEntryFocus("open", { kind: "register", field: field(0) }, facts([field(0)], false, true))).toEqual({ phase: "settled", target: null });
    expect(resolveEntryFocus("entering", { kind: "register", field: field(0) }, facts([field(0)])).target).toBeNull();
    expect(resolveEntryFocus("inactive", { kind: "unblock" }, facts([field(0)])).target).toBeNull();
  });
  it("never restarts automatic focus after the page entry window has settled", async () => {
    const { resolveEntryFocus } = await import("../src/screen-patterns.js");
    const none = (blocked = false, textEntryFocused = false) => ({ mode: "none" as const, candidates: [field(0, true)], blocked, textEntryFocused });
    expect(resolveEntryFocus("entering", { kind: "enter" }, none())).toEqual({ phase: "settled", target: null });
    expect(resolveEntryFocus("settled", { kind: "register", field: field(0, true) }, none()).target).toBeNull();
    expect(resolveEntryFocus("settled", { kind: "register", field: field(0, true, false) }, none()).target).toBeNull();
    expect(resolveEntryFocus("settled", { kind: "register", field: field(0, true) }, none(true)).target).toBeNull();
    expect(resolveEntryFocus("settled", { kind: "register", field: field(0, true) }, none(false, true)).target).toBeNull();
    expect(resolveEntryFocus("settled", { kind: "deactivate" }, none()).phase).toBe("inactive");
    expect(resolveEntryFocus("inactive", { kind: "activate" }, none()).phase).toBe("entering");
  });
});

describe("chat reaction summary and icon tile frame (2026-10-18)", () => {
  it("validates summary copy, ids and counts and shows counts from minCount", async () => {
    const { resolveChatReactionSummary, chatMessageRecipe } = await import("../src/screen-patterns.js");
    const items = resolveChatReactionSummary({ label: "Reactions", items: [{ id: "heart", emoji: "❤️", count: 2 }, { id: "laugh", emoji: "😂", count: 1 }] });
    expect(items.map(item => item.showCount)).toEqual([true, false]);
    expect(chatMessageRecipe.reactionSummary.minCount).toBe(2);
    expect(() => resolveChatReactionSummary({ label: " ", items: [] })).toThrow(TypeError);
    expect(() => resolveChatReactionSummary({ label: "R", items: [{ id: "a", emoji: "❤️", count: 1 }, { id: "a", emoji: "😂", count: 1 }] })).toThrow(TypeError);
    expect(() => resolveChatReactionSummary({ label: "R", items: [{ id: "a", emoji: "", count: 1 }] })).toThrow(TypeError);
    expect(() => resolveChatReactionSummary({ label: "R", items: [{ id: "a", emoji: "❤️", count: 1.5 }] })).toThrow(RangeError);
  });
  it("keeps the original squircle as the default frame and bounds a filling icon", async () => {
    const { iconTileRecipe } = await import("../src/screen-patterns.js");
    expect(iconTileRecipe.defaults).toEqual({ frame: "surface", shape: "squircle", size: "fixed" });
    expect(`${iconTileRecipe.shapes.squircle * 100}`.startsWith("22")).toBe(true);
    expect(iconTileRecipe.fillMinSize).toBeLessThan(iconTileRecipe.iconSize);
    expect(iconTileRecipe.fillMaxSize).toBeGreaterThan(iconTileRecipe.iconSize);
  });
  it("resolves a filling icon's edge from its cell with the recipe clamp", async () => {
    const { iconTileRecipe, resolveIconTileFillEdge } = await import("../src/screen-patterns.js");
    expect(resolveIconTileFillEdge(20)).toBe(iconTileRecipe.fillMinSize);
    expect(resolveIconTileFillEdge(57.5)).toBe(57.5);
    expect(resolveIconTileFillEdge(200)).toBe(iconTileRecipe.fillMaxSize);
    expect(() => resolveIconTileFillEdge(Number.NaN)).toThrow(RangeError);
    expect(() => resolveIconTileFillEdge(-1)).toThrow(RangeError);
  });
});
