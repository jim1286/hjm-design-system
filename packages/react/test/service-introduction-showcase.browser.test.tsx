import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { ServiceIntroduction } from "../../../showcase/web/src/patterns/reference-flow-previews.js";
import { scopeCopy } from "../../../showcase/shared/reference-flows.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const button = (label: string) => [...document.querySelectorAll<HTMLButtonElement>("button")].find(node => (node.getAttribute("aria-label") ?? node.textContent) === label)!;
const click = (label: string) => act(async () => { const node = button(label); node.focus(); node.click(); });
const dialog = () => document.querySelector('[role="dialog"]');
const field = () => document.querySelector<HTMLInputElement>('[role="dialog"] input')!;
const input = (value: string) => act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field(), value); field().dispatchEvent(new Event("input", { bubbles: true })); });
const occurrences = () => host.textContent!.split(scopeCopy).length - 1;

it.each([false, true])("preserves draft across both CTAs, saves and restores the invoking focus (editorial=%s)", async editorial => {
  await act(async () => root.render(<HjmProvider reducedMotion><ServiceIntroduction editorial={editorial} /></HjmProvider>));
  expect(occurrences()).toBe(1);
  await click("기록은 어디에 저장되나요?"); expect(occurrences()).toBe(2);
  await click("기록은 어디에 저장되나요?"); expect(occurrences()).toBe(1);
  await click("첫 장면 남기기"); await expect.poll(dialog).not.toBeNull();
  expect(button("미리보기에 저장").disabled).toBe(true);
  await input("임시 장면"); await click("닫기"); await expect.poll(dialog).toBeNull();
  await expect.poll(() => document.activeElement).toBe(button("첫 장면 남기기"));
  await click("한 줄 써보기"); await expect.poll(dialog).not.toBeNull();
  expect(field().value).toBe("임시 장면");
  await input("   "); expect(button("미리보기에 저장").disabled).toBe(true);
  await input("  저장한 장면  "); await click("미리보기에 저장"); await expect.poll(dialog).toBeNull();
  expect(host.textContent).toContain("저장한 장면: 저장한 장면");
  await expect.poll(() => document.activeElement).toBe(button("한 줄 써보기"));
  await click("첫 장면 남기기"); await expect.poll(dialog).not.toBeNull();
  expect(field().value).toBe("  저장한 장면  ");
  await input("저장하지 않은 변경"); await click("닫기"); await expect.poll(dialog).toBeNull();
  expect(host.textContent).toContain("저장한 장면: 저장한 장면");
  await click("한 줄 써보기"); await expect.poll(dialog).not.toBeNull();
  expect(field().value).toBe("저장하지 않은 변경");
});

it.each(["첫 장면 남기기", "한 줄 써보기"])("returns focus to the actual pointer opener without pre-focusing it: %s", async label => {
  await act(async () => root.render(<HjmProvider reducedMotion><ServiceIntroduction /></HjmProvider>));
  const opener = button(label);
  // WebKit intentionally does not focus buttons on pointer activation; do not call focus() in this proof.
  await act(async () => page.getByRole("button", { name: label, exact: true }).click());
  await expect.poll(dialog).not.toBeNull();
  await act(async () => page.getByRole("button", { name: "닫기", exact: true }).click());
  await expect.poll(dialog).toBeNull();
  await expect.poll(() => document.activeElement).toBe(opener);
});
