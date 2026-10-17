// Use normal text for behavior coverage; maximum-text checks are out of scope (2026-10-07).
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

// Keep historical maximum-text cases registered without executing them (2026-10-07 user scope).
for (const textScale of [1, 2]) {
  it.skipIf(textScale === 2)(`keeps the Sheet title as the accessible name only, with the close control at the header end at text scale ${textScale}`, async () => {
    await page.viewport(320, 568);
    await act(async () => root.render(<HjmProvider reducedMotion textScale={textScale}>
      <Sheet open showClose onOpenChange={() => {}} title="설정" closeLabel="닫기"><p>설정을 변경해 주세요.</p></Sheet>
    </HjmProvider>));
    const sheet = document.querySelector<HTMLElement>(".hjm-sheet")!;
    // 2026-10-17 user decision: no visible title line; the dialog is still named by it.
    expect(page.getByRole("dialog", { name: "설정" }).element()).toBe(sheet);
    const heading = sheet.querySelector<HTMLElement>("h2")!;
    expect(heading.textContent).toBe("설정");
    expect(heading.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    expect(sheet.querySelector(".hjm-sheet__title")).toBeNull();
    const header = sheet.querySelector<HTMLElement>(".hjm-sheet__header")!.getBoundingClientRect();
    const close = sheet.querySelector<HTMLElement>(".hjm-dialog__close")!.getBoundingClientRect();
    expect(Math.abs(close.right - header.right)).toBeLessThanOrEqual(21);
    // The header is only as tall as the × (no title line above or beside it).
    expect(header.height).toBeLessThanOrEqual(close.height + 1);
    expect(sheet.scrollWidth).toBeLessThanOrEqual(sheet.clientWidth);
    expect(close.width).toBeGreaterThanOrEqual(44);
  });
}

it("renders no header row when a bottom sheet has neither description nor close control", async () => {
  await act(async () => root.render(<HjmProvider reducedMotion>
    <Sheet open onOpenChange={() => {}} title="필터" closeLabel="닫기"><div>본문</div></Sheet>
  </HjmProvider>));
  const sheet = document.querySelector<HTMLElement>(".hjm-sheet")!;
  expect(page.getByRole("dialog", { name: "필터" }).element()).toBe(sheet);
  expect(sheet.querySelector(".hjm-sheet__header")).toBeNull();
  const handle = sheet.querySelector<HTMLElement>(".hjm-sheet__handle-row")!.getBoundingClientRect();
  const body = sheet.querySelector<HTMLElement>(".hjm-sheet__body > div")!.getBoundingClientRect();
  // Only the shared body gap (16) separates the handle area from the first body content.
  expect(body.top - handle.bottom).toBeLessThanOrEqual(17);
});

it("closes a bottom sheet on a backdrop press through the owner's onOpenChange, and respects guards", async () => {
  const onOpenChange = vi.fn();
  const view = (props: { busy?: boolean }) => <HjmProvider reducedMotion>
    <Sheet open {...props} onOpenChange={onOpenChange} title="필터" closeLabel="닫기"><p>본문</p></Sheet>
  </HjmProvider>;
  await act(async () => root.render(view({})));
  const positioner = document.querySelector<HTMLElement>('[data-kind="sheet"]')!;
  const surface = positioner.querySelector<HTMLElement>(".hjm-sheet")!;
  // A press that starts on the surface (text selection dragged outward) must not close.
  await act(async () => surface.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })));
  expect(onOpenChange).not.toHaveBeenCalled();
  await act(async () => positioner.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })));
  expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "outside" });
  // The controlled owner kept it open (e.g. a discard confirmation): the sheet stays.
  expect(document.querySelector(".hjm-sheet")).not.toBeNull();

  onOpenChange.mockClear();
  await act(async () => root.render(view({ busy: true })));
  await act(async () => document.querySelector<HTMLElement>('[data-kind="sheet"]')!
    .dispatchEvent(new MouseEvent("mousedown", { bubbles: true })));
  expect(onOpenChange).not.toHaveBeenCalled();
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

it("names the Sheet by a long title and wraps a long description in a narrow viewport", async () => {
  const longCopy = "설정 항목을 확인하고 변경 내용을 저장해 주세요. 긴 제목과 설명이 닫기 버튼을 밀어내거나 화면 너비를 늘리지 않고 줄바꿈되어야 합니다.";
  await page.viewport(320, 568);
  await act(async () => root.render(
    <HjmProvider reducedMotion textScale={1}>
      <Sheet open onOpenChange={() => undefined} title={longCopy} description={longCopy} closeLabel="닫기">
        <p>{longCopy}</p>
      </Sheet>
    </HjmProvider>,
  ));
  const sheet = document.body.querySelector<HTMLElement>('[data-kind="sheet"] [role="dialog"]')!;
  const description = sheet.querySelector<HTMLElement>(".hjm-sheet__description")!;
  expect(page.getByRole("dialog", { name: longCopy }).element()).toBe(sheet);
  expect(description.textContent).toBe(longCopy);
  expect(description.scrollWidth).toBeLessThanOrEqual(description.clientWidth + 2);
  expect(sheet.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth + 1);
});
