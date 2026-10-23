import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { ChoiceRow } from "../src/choice-row.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "360px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const art = (name: string) => <span data-art={name} style={{ display: "block", width: 44, height: 44 }} />;
const items = [
  { value: "meadow", label: "들판", leading: art("meadow") },
  { value: "night", label: "밤하늘", leading: art("night") },
  { value: "plain", label: "기본" },
];

it("shows the confirmed item's picture on the row and every item's picture in a shared 40 box in the sheet", async () => {
  await act(async () => root.render(<HjmProvider><ChoiceRow title="셸 테마" items={items} value="night" onValueChange={() => {}} closeLabel="닫기" /></HjmProvider>));
  const row = host.querySelector<HTMLElement>(".hjm-list-row")!;
  expect(row.querySelector(".hjm-list-row__leading [data-art]")!.getAttribute("data-art")).toBe("night");
  await act(async () => row.click());
  const boxes = [...document.querySelectorAll<HTMLElement>(".hjm-choice-row__item-leading")];
  // The item without art keeps an empty box so the three labels start on one line.
  expect(boxes.map((box) => box.querySelector("[data-art]")?.getAttribute("data-art") ?? null)).toEqual(["meadow", "night", null]);
  for (const box of boxes) {
    const rect = box.getBoundingClientRect();
    expect([Math.round(rect.width), Math.round(rect.height)]).toEqual([40, 40]);
    expect(box.closest("[aria-hidden='true']")).not.toBeNull();
  }
  const starts = [...document.querySelectorAll<HTMLElement>(".hjm-radio-group .hjm-choice__copy")].map((copy) => Math.round(copy.getBoundingClientRect().left));
  expect(new Set(starts).size).toBe(1);
});

it("keeps a row leading supplied by the product and adds no box when no item has a picture", async () => {
  await act(async () => root.render(<HjmProvider><ChoiceRow title="언어" leading={<span data-icon="" />} items={[{ value: "ko", label: "한국어" }, { value: "en", label: "English" }]} value="ko" onValueChange={() => {}} closeLabel="닫기" /></HjmProvider>));
  const row = host.querySelector<HTMLElement>(".hjm-list-row")!;
  expect(row.querySelector(".hjm-list-row__leading [data-icon]")).not.toBeNull();
  await act(async () => row.click());
  expect(document.querySelector(".hjm-choice-row__item-leading")).toBeNull();
});
