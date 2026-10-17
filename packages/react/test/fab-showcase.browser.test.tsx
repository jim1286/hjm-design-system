import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { FloatingNotesPreview } from "../../../showcase/web/src/patterns/FloatingActionButton.stories.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(async () => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); await act(async () => root.render(<HjmProvider reducedMotion><FloatingNotesPreview /></HjmProvider>)); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const fab = () => host.querySelector<HTMLButtonElement>(".hjm-fab")!;
const dialog = () => document.querySelector('[role="dialog"]');
const field = () => document.querySelector<HTMLTextAreaElement>('textarea')!;
const click = (name: string) => act(async () => page.getByRole("button", { name, exact: true }).click());
const input = (value: string) => act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(field(), value); field().dispatchEvent(new Event("input", { bubbles: true })); });
const save = () => [...document.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === '기록 추가')!;
// The ScreenLayout shell scrolls with the document; the list Container carries the FAB clearance.
const scroll = () => document.scrollingElement as HTMLElement;

it("preserves dismissed drafts, rejects blank notes, saves once, and returns focus to the pointer FAB", async () => {
  const opener = fab();
  await click("새 기록"); await expect.poll(dialog).not.toBeNull();
  expect(save().disabled).toBe(true); await input("   "); expect(save().disabled).toBe(true);
  await input("남겨 둔 초안"); await click("닫기"); await expect.poll(dialog).toBeNull();
  await expect.poll(() => document.activeElement).toBe(opener);
  await click("새 기록"); await expect.poll(dialog).not.toBeNull(); expect(field().value).toBe("남겨 둔 초안");
  await input("  저장한 순간  "); await click("기록 추가"); await expect.poll(dialog).toBeNull();
  expect(host.textContent!.split("저장한 순간")).toHaveLength(2);
  expect(host.querySelector('.hjm-list-row')?.textContent).toContain("저장한 순간");
  await expect.poll(() => document.activeElement).toBe(opener);
  await click("새 기록"); await expect.poll(dialog).not.toBeNull(); expect(field().value).toBe(""); expect(save().disabled).toBe(true);
  await input("연속 저장");
  const action = save();
  await act(async () => { action.click(); action.click(); });
  await expect.poll(dialog).toBeNull();
  expect(host.textContent!.split("연속 저장")).toHaveLength(2);
  expect(host.textContent!.split("저장한 순간")).toHaveLength(2);
});

it("collapses and expands the same FAB while reserving clearance and resets scroll after save", async () => {
  const opener = fab(), region = scroll();
  expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
  await act(async () => { window.scrollTo({ top: region.scrollHeight }); });
  await expect.poll(() => opener.dataset.mode).toBe("collapsed");
  expect(fab()).toBe(opener); expect(opener.getAttribute("aria-label")).toBe("새 기록");
  const clearance = parseFloat(getComputedStyle(host.querySelector('.hjm-list-row')!.closest('.hjm-container')!).marginBottom);
  expect(clearance).toBeGreaterThanOrEqual(opener.getBoundingClientRect().height + 32);
  const last = [...host.querySelectorAll('.hjm-list-row')].at(-1)!;
  expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(opener.getBoundingClientRect().top);
  await act(async () => { window.scrollTo({ top: region.scrollTop - 20 }); });
  await expect.poll(() => opener.dataset.mode).toBe("expanded");
  await click("새 기록"); await expect.poll(dialog).not.toBeNull(); await input("맨 위에 저장"); await click("기록 추가"); await expect.poll(dialog).toBeNull();
  await expect.poll(() => region.scrollTop).toBe(0); await expect.poll(() => opener.dataset.mode).toBe("expanded");
});
