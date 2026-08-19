import { describe, expect, it } from "vitest";

import { componentCatalog } from "../src/catalog.js";
import { antDesignReferenceComponents } from "../src/component-references.js";
import { componentIds } from "../src/component-definitions.js";
import {
  findActiveMentionTrigger,
  mentionsBehaviorScenarios,
  resolveMentionInsertion,
  validateMentionTriggers,
  type MentionTriggerConfig,
} from "../src/mentions.js";

const triggers: readonly MentionTriggerConfig[] = [
  { id: "user", trigger: "@" },
  { id: "tag", trigger: "#" },
];

describe("validateMentionTriggers", () => {
  it("rejects an empty trigger list", () => {
    expect(() => validateMentionTriggers([])).toThrow(/at least one trigger/);
  });

  it("rejects a multi-character or whitespace trigger", () => {
    expect(() =>
      validateMentionTriggers([{ id: "user", trigger: "@@" }]),
    ).toThrow(/exactly one character/);
    expect(() =>
      validateMentionTriggers([{ id: "user", trigger: " " }]),
    ).toThrow(/whitespace/);
  });

  it("rejects two configs sharing a trigger character or id", () => {
    expect(() =>
      validateMentionTriggers([
        { id: "user", trigger: "@" },
        { id: "mention", trigger: "@" },
      ]),
    ).toThrow(/Duplicate Mentions trigger character/);
    expect(() =>
      validateMentionTriggers([
        { id: "user", trigger: "@" },
        { id: "user", trigger: "#" },
      ]),
    ).toThrow(/Duplicate Mentions trigger id/);
  });

  it("accepts a well-formed, non-overlapping trigger list", () => {
    expect(() => validateMentionTriggers(triggers)).not.toThrow();
  });
});

describe("findActiveMentionTrigger — inputs the matcher must NOT catch", () => {
  it("does not open for an email address's @", () => {
    const text = "contact user@example.com now";
    const cursor = text.indexOf("example");
    expect(findActiveMentionTrigger(text, cursor, triggers)).toBeNull();
  });

  it("does not open when the trigger char sits mid-word with no preceding boundary", () => {
    const text = "John@doe";
    expect(findActiveMentionTrigger(text, text.length, triggers)).toBeNull();
  });

  it("closes an already-open mention once a space is typed", () => {
    const text = "hello @john smith";
    expect(findActiveMentionTrigger(text, text.length, triggers)).toBeNull();
  });

  it("throws for a cursor position outside the text bounds", () => {
    expect(() => findActiveMentionTrigger("hi", 10, triggers)).toThrow(RangeError);
    expect(() => findActiveMentionTrigger("hi", -1, triggers)).toThrow(RangeError);
  });
});

describe("findActiveMentionTrigger — inputs it must catch", () => {
  it("opens at start of text", () => {
    const text = "@bob";
    expect(findActiveMentionTrigger(text, text.length, triggers)).toEqual({
      triggerId: "user",
      trigger: "@",
      triggerStart: 0,
      query: "bob",
    });
  });

  it("opens right after the trigger with an empty query", () => {
    const text = "hello @";
    expect(findActiveMentionTrigger(text, text.length, triggers)).toEqual({
      triggerId: "user",
      trigger: "@",
      triggerStart: 6,
      query: "",
    });
  });

  it("matches a trigger preceded by whitespace mid-sentence", () => {
    const text = "check #tag and @user";
    const cursor = text.length;
    expect(findActiveMentionTrigger(text, cursor, triggers)).toEqual({
      triggerId: "user",
      trigger: "@",
      triggerStart: 15,
      query: "user",
    });
  });

  it("handles a composing Korean query with no special-casing", () => {
    const text = "안녕하세요 @홍길동";
    expect(findActiveMentionTrigger(text, text.length, triggers)).toEqual({
      triggerId: "user",
      trigger: "@",
      triggerStart: 6,
      query: "홍길동",
    });
    // A single, not-yet-combined jamo mid-composition is just another
    // character in the string — no different code path than a full syllable.
    const composing = "안녕하세요 @ㅎ";
    expect(findActiveMentionTrigger(composing, composing.length, triggers)).toEqual({
      triggerId: "user",
      trigger: "@",
      triggerStart: 6,
      query: "ㅎ",
    });
  });
});

describe("resolveMentionInsertion", () => {
  it("prepends the trigger exactly once and appends a trailing space", () => {
    const text = "hello @jo";
    const match = findActiveMentionTrigger(text, text.length, triggers)!;
    const result = resolveMentionInsertion(text, match, text.length, "홍길동");
    expect(result.text).toBe("hello @홍길동 ");
    expect(result.cursorPosition).toBe(result.text.length);
  });

  it("replaces exactly the trigger through the cursor, keeping trailing text intact", () => {
    const text = "hi @jo, welcome";
    const match = findActiveMentionTrigger(text, 6, triggers)!;
    const result = resolveMentionInsertion(text, match, 6, "John");
    expect(result.text).toBe("hi @John , welcome");
  });

  it("rejects an empty inserted display text", () => {
    const text = "hi @";
    const match = findActiveMentionTrigger(text, text.length, triggers)!;
    expect(() => resolveMentionInsertion(text, match, text.length, "  ")).toThrow(TypeError);
  });

  it("rejects a cursor before the matched trigger", () => {
    const text = "hi @john";
    const match = findActiveMentionTrigger(text, text.length, triggers)!;
    expect(() => resolveMentionInsertion(text, match, 1, "John")).toThrow(RangeError);
  });
});

describe("Mentions self-contained contract", () => {
  it("keeps a non-empty, deduplicated behavior scenario list", () => {
    expect(mentionsBehaviorScenarios.length).toBeGreaterThan(0);
    expect(new Set(mentionsBehaviorScenarios).size).toBe(mentionsBehaviorScenarios.length);
  });
});

describe("Mentions catalog and crosswalk stay untouched", () => {
  it("still reserves Mentions as planned/adaptive/input", () => {
    const entry = componentCatalog.find((item) => item.name === "Mentions");
    expect(entry).toMatchObject({
      category: "input",
      platform: "adaptive",
      status: "planned",
    });
  });

  it("keeps the antd Mentions crosswalk pointed at the same target", () => {
    const entry = antDesignReferenceComponents.find((item) => item.name === "Mentions");
    expect(entry).toMatchObject({ targets: [componentIds.Mentions], relationship: "direct" });
  });
});
