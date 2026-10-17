import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import inputSheet from "../../../showcase/web/src/patterns/InputSheet.stories.js";
import familyDrawer from "../../../showcase/web/src/patterns/FamilyDrawer.stories.js";
import "../src/styles.css";

// Exercise the actual public-package compositions, including their async adapters.
const InputSheet = inputSheet.component;
const FamilyDrawer = familyDrawer.component;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const button = (label: string) => [...document.querySelectorAll("button")].find(node => node.textContent === label || node.getAttribute("aria-label") === label)!;
const click = (label: string) => act(async () => button(label).click());
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 420)); });

it("retains the sheet draft through failure, dismissal and retry, closing only after success", async () => {
  await act(async () => root.render(<HjmProvider><InputSheet /></HjmProvider>));
  await click("기록 이름 입력");
  expect(button("저장").disabled).toBe(true);
  const input = document.querySelector<HTMLInputElement>("input")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "남길 이름");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await click("다음 저장 실패시키기"); await click("저장");
  expect(input.disabled).toBe(true);
  await click("닫기");
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  await settle();
  expect(document.body.textContent).toContain("저장하지 못했어요.");
  expect(input.value).toBe("남길 이름");
  await click("닫기"); await settle(); await click("기록 이름 입력");
  expect(document.querySelector<HTMLInputElement>("input")!.value).toBe("남길 이름");
  await click("다시 저장"); await settle();
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(host.textContent).toContain("저장된 이름: 남길 이름");
});

it("resumes an unfinished drawer and resets its step only after confirmed completion", async () => {
  await act(async () => root.render(<HjmProvider><FamilyDrawer /></HjmProvider>));
  await click("공간 설정하기"); await click("계속"); await click("계속");
  await click("다음 저장 실패시키기"); await click("설정 마치기");
  expect(button("이전").disabled).toBe(true);
  await settle();
  expect(document.body.textContent).toContain("설정을 저장하지 못했어요.");
  await click("닫기"); await settle(); await click("공간 설정하기");
  expect(button("다시 저장")).toBeDefined();
  await click("다시 저장"); await settle();
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(host.textContent).toContain("설정을 마쳤어요.");
  await click("공간 설정하기");
  expect(button("이전").disabled).toBe(true);
  expect(button("계속")).toBeDefined();
});
