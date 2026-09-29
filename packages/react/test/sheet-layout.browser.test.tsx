import { act } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { HjmProvider } from "../src/provider.js";
import { Sheet } from "../src/overlays.js";
import "../src/styles.css";

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div"); document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); await page.viewport(1280, 720); });

export const sheetKeyboardCases = [{ componentId: "sheet" }] as const;
export const sheetLongCopyCases = [{ componentId: "sheet" }] as const;

it.each([1, 2])("aligns the Sheet heading and close control without product CSS at text scale %i", async (textScale) => {
  await page.viewport(320, 568);
  await act(async () => root.render(<HjmProvider reducedMotion textScale={textScale}>
    <Sheet open onOpenChange={() => {}} title="설정" closeLabel="닫기"><p>설정을 변경해 주세요.</p></Sheet>
  </HjmProvider>));
  const sheet = document.querySelector<HTMLElement>(".hjm-sheet")!;
  const title = sheet.querySelector<HTMLElement>(".hjm-sheet__title")!.getBoundingClientRect();
  const close = sheet.querySelector<HTMLElement>(".hjm-dialog__close")!.getBoundingClientRect();
  expect(Math.abs((title.top + title.bottom) / 2 - (close.top + close.bottom) / 2)).toBeLessThanOrEqual(1);
  expect(sheet.scrollWidth).toBeLessThanOrEqual(sheet.clientWidth);
  expect(close.width).toBeGreaterThanOrEqual(44);
});

it("traps keyboard focus and restores it after Escape dismisses the Sheet", async () => {
  const onOpenChange = vi.fn();
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <Sheet
        trigger={<button type="button">Open filters</button>}
        onOpenChange={onOpenChange}
        title="Filters"
        closeLabel="Close filters"
      >
        <button type="button">Apply</button>
      </Sheet>
    </HjmProvider>,
  ));

  const trigger = container.querySelector<HTMLButtonElement>("button")!;
  await act(async () => trigger.click());
  const sheet = document.body.querySelector<HTMLElement>('[data-kind="sheet"] [role="dialog"]')!;
  const close = sheet.querySelector<HTMLButtonElement>('[aria-label="Close filters"]')!;
  expect(sheet.getAttribute("aria-modal")).toBe("true");
  expect(sheet.contains(document.activeElement)).toBe(true);

  await act(async () => userEvent.tab());
  expect(sheet.contains(document.activeElement)).toBe(true);
  await act(async () => userEvent.tab());
  expect(sheet.contains(document.activeElement)).toBe(true);
  await act(async () => userEvent.keyboard("{Escape}"));

  expect(document.body.querySelector('[data-kind="sheet"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "escape" });
  expect(close.isConnected).toBe(false);
});

it("wraps long Sheet titles and descriptions in a narrow viewport", async () => {
  const longCopy = "설정 항목을 확인하고 변경 내용을 저장해 주세요. 긴 제목과 설명이 닫기 버튼을 밀어내거나 화면 너비를 늘리지 않고 줄바꿈되어야 합니다.";
  await page.viewport(320, 568);
  await act(async () => root.render(
    <HjmProvider reducedMotion textScale={2}>
      <Sheet open onOpenChange={() => undefined} title={longCopy} description={longCopy} closeLabel="닫기">
        <p>{longCopy}</p>
      </Sheet>
    </HjmProvider>,
  ));
  const sheet = document.body.querySelector<HTMLElement>('[data-kind="sheet"] [role="dialog"]')!;
  const title = sheet.querySelector<HTMLElement>(".hjm-sheet__title")!;
  const description = sheet.querySelector<HTMLElement>(".hjm-sheet__description")!;
  expect(title.textContent).toBe(longCopy);
  expect(description.textContent).toBe(longCopy);
  expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth + 2);
  expect(description.scrollWidth).toBeLessThanOrEqual(description.clientWidth + 2);
  expect(sheet.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth + 1);
});
