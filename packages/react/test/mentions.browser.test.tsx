import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Mentions, type MentionCandidate } from "../src/mentions.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const people: readonly MentionCandidate[] = [
  { id: "mina", label: "미나", description: "같이 걷는 사람" },
  { id: "minsu", label: "민수", description: "저녁을 차린 사람" },
  { id: "jun", label: "준", description: "사진을 찍는 사람" },
];

const field = () => document.querySelector<HTMLTextAreaElement>("textarea")!;
const list = () => document.querySelector<HTMLElement>('[role="listbox"]');
const options = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')].map((node) => node.textContent);
const key = async (value: string) => act(async () => field().dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })));

async function type(text: string) {
  // Mirrors a real edit: set the value, park the caret at the end, then fire input.
  const input = field();
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
  await act(async () => {
    setter.call(input, text);
    input.setSelectionRange(text.length, text.length);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function Fixture() {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const candidates = query === null ? [] : people.filter((person) => person.label.startsWith(query));
  return (
    <HjmProvider reducedMotion>
      <Mentions
        label="오늘의 기록"
        value={value}
        onValueChange={setValue}
        triggers={[{ id: "person", trigger: "@" }]}
        candidates={candidates}
        onMentionQueryChange={(match) => setQuery(match?.query ?? null)}
        emptyMessage="찾는 사람이 없어요"
        listLabel="사람 후보"
      />
    </HjmProvider>
  );
}

it("opens on a trigger that starts a token and stays closed when it follows other text", async () => {
  await act(async () => root.render(<Fixture />));
  await type("오늘 ");
  expect(list()).toBeNull();
  await type("오늘 @");
  expect(list()).not.toBeNull();
  expect(field().getAttribute("aria-expanded")).toBe("true");
  // An empty query right after the trigger is a valid match: everyone shows.
  expect(options()).toHaveLength(3);
  await type("오늘 @미");
  expect(options()).toEqual(["미나같이 걷는 사람"]);
  // A space after the trigger ends the token without committing anything.
  await type("오늘 @미 ");
  expect(list()).toBeNull();
  expect(field().value).toBe("오늘 @미 ");
  // A trigger glued to a previous word is not a mention.
  await type("오늘 hello@");
  expect(list()).toBeNull();
});

it("commits with Enter, inserting the trigger exactly once and replacing only the token", async () => {
  await act(async () => root.render(<Fixture />));
  await type("어제 @민와 저녁");
  // Put the caret right after the partial token, not at the end of the text.
  await act(async () => {
    field().setSelectionRange(5, 5);
    field().dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowLeft", bubbles: true }));
  });
  expect(options()).toEqual(["민수저녁을 차린 사람"]);
  await key("Enter");
  // Only the trigger-through-caret range is replaced; the text after the caret
  // is untouched, and the trailing space lets typing continue.
  expect(field().value).toBe("어제 @민수 와 저녁");
  expect(list()).toBeNull();
  await expect.poll(() => field().selectionStart).toBe(7);
});

it("moves the active option with the arrow keys and leaves the text alone on Escape", async () => {
  await act(async () => root.render(<Fixture />));
  await type("@");
  const active = () => document.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')?.textContent;
  expect(active()).toContain("미나");
  await key("ArrowDown");
  expect(active()).toContain("민수");
  await key("ArrowUp");
  await key("ArrowUp");
  // The list wraps rather than dead-ending at the first row.
  expect(active()).toContain("준");
  expect(field().getAttribute("aria-activedescendant")).toContain("jun");
  await key("Escape");
  expect(list()).toBeNull();
  expect(field().value).toBe("@");
});

it("commits a pointer choice without losing the caret the insertion depends on", async () => {
  await act(async () => root.render(<Fixture />));
  await type("사진은 @");
  await act(async () => {
    const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((node) => node.textContent?.startsWith("준"))!;
    option.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
  });
  expect(field().value).toBe("사진은 @준 ");
  expect(list()).toBeNull();
});

it("shows the localized empty message instead of an empty popup", async () => {
  await act(async () => root.render(<Fixture />));
  await type("@없는사람");
  expect(options()).toEqual([]);
  expect(list()?.textContent).toBe("찾는 사람이 없어요");
});
