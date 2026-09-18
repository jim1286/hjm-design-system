import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { ToggleGroup } from "../src/toggle-group.js";
import { TagsInput } from "../src/tags-input.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const toggle = (label: string) => [...document.querySelectorAll<HTMLButtonElement>(".hjm-toggle-group__item")].find((node) => node.textContent === label)!;
const field = () => document.querySelector<HTMLInputElement>(".hjm-tags-input__input")!;
const tags = () => [...document.querySelectorAll<HTMLElement>(".hjm-tags-input__tag")].map((node) => node.firstElementChild?.textContent);
const key = async (value: string) => act(async () => field().dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })));
const type = async (value: string) => act(async () => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  setter.call(field(), value);
  field().dispatchEvent(new Event("input", { bubbles: true }));
});

it("presses several toggles at once and announces the state, not just the color", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <ToggleGroup
        descriptor={{
          accessibilityLabel: "글자 꾸미기",
          items: [{ id: "bold", label: "굵게" }, { id: "italic", label: "기울임" }, { id: "underline", label: "밑줄", disabled: true }],
        }}
      />
    </HjmProvider>,
  ));
  expect(document.querySelector('[role="group"]')!.getAttribute("aria-label")).toBe("글자 꾸미기");
  await act(async () => toggle("굵게").click());
  await act(async () => toggle("기울임").click());
  expect(toggle("굵게").getAttribute("aria-pressed")).toBe("true");
  expect(toggle("기울임").getAttribute("aria-pressed")).toBe("true");
  // None-pressed is a valid state, unlike a single-choice control.
  await act(async () => toggle("굵게").click());
  await act(async () => toggle("기울임").click());
  expect([...document.querySelectorAll('[aria-pressed="true"]')]).toHaveLength(0);
  await act(async () => toggle("밑줄").click());
  expect(toggle("밑줄").getAttribute("aria-pressed")).toBe("false");
});

it("commits a trimmed tag on Enter and reports why a rejected one failed", async () => {
  const onReject = vi.fn();
  function Fixture() {
    const [value, setValue] = useState<readonly string[]>([]);
    return (
      <HjmProvider reducedMotion>
        <TagsInput
          label="태그"
          tags={value}
          onTagsChange={setValue}
          onReject={onReject}
          policy={{ maxTags: 2 }}
          composeRemoveLabel={(tag) => `${tag} 지우기`}
        />
      </HjmProvider>
    );
  }
  await act(async () => root.render(<Fixture />));
  await type("  산책  ");
  await key("Enter");
  expect(tags()).toEqual(["산책"]);
  expect(field().value).toBe("");
  // Duplicate and limit both report a reason instead of failing silently.
  await type("산책");
  await key("Enter");
  expect(onReject.mock.calls.at(-1)?.[0]).toMatchObject({ accepted: false, reason: "duplicate" });
  await type("저녁");
  await key("Enter");
  await type("세번째");
  await key("Enter");
  expect(onReject.mock.calls.at(-1)?.[0]).toMatchObject({ reason: "limit" });
  expect(tags()).toEqual(["산책", "저녁"]);
});

it("arms the last tag on the first Backspace and removes it on the second", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <TagsInput label="태그" defaultTags={["산책", "저녁"]} composeRemoveLabel={(tag) => `${tag} 지우기`} />
    </HjmProvider>,
  ));
  await act(async () => field().focus());
  await key("Backspace");
  // Armed, not removed: a single keystroke must not lose work.
  expect(tags()).toEqual(["산책", "저녁"]);
  expect(document.querySelectorAll("[data-armed]")).toHaveLength(1);
  await key("Backspace");
  expect(tags()).toEqual(["산책"]);
  // Typing disarms, so the next Backspace edits text instead of removing a tag.
  await type("가");
  expect(document.querySelectorAll("[data-armed]")).toHaveLength(0);
});

it("gives every tag its own localized remove control", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <TagsInput label="태그" defaultTags={["산책", "저녁"]} composeRemoveLabel={(tag) => `${tag} 지우기`} />
    </HjmProvider>,
  ));
  const remove = document.querySelector<HTMLButtonElement>('[aria-label="산책 지우기"]')!;
  expect(remove).not.toBeNull();
  await act(async () => remove.click());
  expect(tags()).toEqual(["저녁"]);
  // Focus returns to the field so typing continues without a pointer.
  expect(document.activeElement).toBe(field());
});

it("turns the tags field into a multi-select combobox when candidates are given", async () => {
  const people = [
    { id: "mina", label: "미나" },
    { id: "minsu", label: "민수" },
    { id: "locked", label: "잠긴 사람", disabled: true },
  ];
  function SuggestFixture() {
    const [value, setValue] = useState<readonly string[]>([]);
    const [draft, setDraft] = useState("");
    const filtered = draft.trim().length === 0 ? [] : people.filter((person) => person.label.startsWith(draft.trim()));
    return (
      <HjmProvider reducedMotion>
        <TagsInput
          label="함께한 사람"
          tags={value}
          onTagsChange={setValue}
          onDraftChange={setDraft}
          suggestions={filtered}
          suggestionsLabel="사람 후보"
          composeRemoveLabel={(tag) => `${tag} 지우기`}
        />
      </HjmProvider>
    );
  }
  await act(async () => root.render(<SuggestFixture />));
  await type("미");
  const options = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')].map((node) => node.textContent);
  expect(options()).toEqual(["미나"]);
  expect(field().getAttribute("aria-expanded")).toBe("true");

  await key("ArrowDown");
  expect(document.querySelector('[role="option"][aria-selected="true"]')!.textContent).toBe("미나");
  await key("Enter");
  // The highlighted candidate wins over the raw text.
  expect(tags()).toEqual(["미나"]);
  expect(field().value).toBe("");

  // With no candidate highlighted, the typed value still commits — that is what
  // separates this from a Select.
  await type("직접쓴태그");
  await key("Enter");
  expect(tags()).toEqual(["미나", "직접쓴태그"]);
});
