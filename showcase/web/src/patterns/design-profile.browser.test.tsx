import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { DesignProfileComparison, RecordSample } from "./design-profile-preview";
import { profileCopy as copy } from "../../../shared/design-profile";
import "../../../../packages/react/src/styles.css";

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (comparison = false) => act(async () => root.render(<HjmProvider reducedMotion>{comparison ? <DesignProfileComparison /> : <RecordSample />}</HjmProvider>));
const button = (label: string, scope: ParentNode = document) => [...scope.querySelectorAll<HTMLButtonElement>("button")].find(node => node.textContent === label || node.getAttribute("aria-label") === label)!;
const field = (label: string) => document.getElementById([...document.querySelectorAll("label")].find(node => node.textContent === label)!.htmlFor) as HTMLInputElement;
const click = (label: string, scope?: ParentNode) => act(async () => userEvent.click(button(label, scope)));
const fill = (label: string, value: string) => act(async () => {
  const target = field(label);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(target, value);
  target.dispatchEvent(new Event("input", { bubbles: true }));
});
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 400)); });

it("distinguishes submitted records from edits made during and after saving", async () => {
  await render(); await fill(copy.name, "제출한 산책"); await click(copy.save);
  await fill(copy.name, "작성 중인 독서"); await settle();
  expect(host.textContent).toContain("현재 입력은 아직 저장하지 않았어요");
  expect(field(copy.name).value).toBe("작성 중인 독서");
  await click(copy.save); await settle(); expect(host.textContent).not.toContain("현재 입력은 아직 저장하지 않았어요");
  await fill(copy.name, "다음 기록"); expect(host.textContent).toContain("현재 입력은 아직 저장하지 않았어요");
  await click(copy.fail); await settle(); expect(host.textContent).toContain(copy.failed);
  await click(copy.retry); await settle(); expect(host.textContent).toContain(copy.saved);
});

it("dismisses the sample toast without reviving it when the profile changes", async () => {
  await render(true); expect(host.textContent).toContain(copy.toastCopy);
  await click(copy.close); await settle(); expect(host.textContent).not.toContain(copy.toastCopy);
  expect(document.activeElement).toBe(button(copy.showToast));
  await click(copy.nextTheme); expect(host.textContent).not.toContain(copy.toastCopy);
  await click(copy.showToast); expect(host.textContent).toContain(copy.toastCopy);
});

it("keeps record and visited tab inputs when product, profile, and tab appearance change", async () => {
  await render(true);
  await fill(copy.name, "내 기록 초안"); await fill(copy.tabsDraft, "탭 초안");
  const record = field(copy.name), tab = field(copy.tabsDraft);
  await click(copy.tabsHistory);
  for (const name of ["문장 모음", "종이", copy.tabsGooey]) {
    const label = [...host.querySelectorAll("label")].find(node => node.textContent === name)!;
    await act(async () => userEvent.click(label));
  }
  await click(copy.tabsEntry);
  expect(field(copy.name)).toBe(record); expect(record.value).toBe("내 기록 초안");
  expect(field(copy.tabsDraft)).toBe(tab); expect(tab.value).toBe("탭 초안");
});

it("keeps the initiating action focused while pending and rejects repeated keyboard activation", async () => {
  await render();
  for (const label of [copy.save, copy.fail]) {
    const action = button(label); await act(async () => action.focus());
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(document.activeElement === action).toBe(true);
    await act(async () => userEvent.keyboard("{Enter}")); await settle();
    expect(host.textContent).toContain(label === copy.fail ? copy.failed : copy.saved);
  }
});

it("preserves an open overlay draft through theme changes and returns pointer dismissal to its opener", async () => {
  await render(true);
  for (const label of [copy.dialog, copy.sheet]) {
    const opener = button(label); await click(label); await settle();
    const dialog = document.querySelector('[role="dialog"]')!;
    await fill(copy.overlayDraft, "테마를 넘긴 초안"); await click(copy.nextTheme, dialog);
    expect(document.querySelector('[role="dialog"]')).toBe(dialog);
    expect(field(copy.overlayDraft).value).toBe("테마를 넘긴 초안");
    await click(copy.close, dialog); await settle(); expect(document.activeElement === opener).toBe(true);
  }
});
