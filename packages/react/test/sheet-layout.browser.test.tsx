// Use normal text for behavior coverage; maximum-text checks are out of scope (2026-10-07).
import { act } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { HjmProvider } from "../src/provider.js";
import { Sheet } from "../src/overlays.js";
import { BottomCTA } from "../src/bottom-cta.js";
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

it("draws no closing rule on the docked bottom, preserving side-sheet outlines", async () => {
  for (const width of [393, 1280]) {
    await page.viewport(width, 852);
    for (const placement of ["bottom", "start", "end"] as const) {
      await act(async () => root.render(<HjmProvider reducedMotion>
        <Sheet open onOpenChange={() => {}} title="Calendar" closeLabel="Close" placement={placement}>
          <p>Calendar content</p>
        </Sheet>
      </HjmProvider>));
      const sheet = document.querySelector<HTMLElement>(".hjm-sheet")!;
      const style = getComputedStyle(sheet);
      expect(parseFloat(style.borderBottomWidth)).toBe(placement === "bottom" ? 0 : parseFloat(style.borderTopWidth));
      if (placement === "bottom") expect(sheet.getBoundingClientRect().bottom).toBe(852);
    }
  }
});

it("aligns a composed BottomCTA with the Sheet body without a second bar", async () => {
  await act(async () => root.render(<HjmProvider reducedMotion>
    <Sheet open onOpenChange={() => {}} title="Edit place" closeLabel="Close"
      footer={<BottomCTA primaryAction={{label: "Save", onClick: () => {}}} />}>
      <input aria-label="Nickname" style={{width: "100%", boxSizing: "border-box"}} />
    </Sheet>
  </HjmProvider>));
  for (const width of [393, 1280]) {
    await page.viewport(width, 852);
    const input = document.querySelector('input[aria-label="Nickname"]')!.getBoundingClientRect();
    const cta = document.querySelector<HTMLElement>(".hjm-sheet__footer .hjm-bottom-cta")!;
    const action = cta.querySelector("button")!.getBoundingClientRect();
    expect(action.left).toBeCloseTo(input.left, 1);
    expect(action.right).toBeCloseTo(input.right, 1);
    expect(getComputedStyle(cta).paddingInlineStart).toBe("0px");
    expect(getComputedStyle(cta).borderTopWidth).toBe("0px");
  }
});

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
    expect(sheet.querySelectorAll('button[aria-label="닫기"]')).toHaveLength(1);
    expect(sheet.querySelector('.hjm-sheet__handle[aria-hidden="true"]')).not.toBeNull();
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


async function draggableSideSheet(props: { busy?: boolean } = {}) {
  const onOpenChange = vi.fn();
  await act(async () => root.render(<HjmProvider reducedMotion>
    <Sheet open placement="end" swipeDirection="down" showClose={false} {...props}
      onOpenChange={onOpenChange} title="Letter" closeLabel="Close letter"><p>Read the letter</p></Sheet>
  </HjmProvider>));
  const sheet = document.querySelector<HTMLElement>('.hjm-sheet')!;
  const zone = sheet.querySelector<HTMLElement>('.hjm-sheet__drag')!;
  vi.spyOn(zone, 'setPointerCapture').mockImplementation(() => {});
  async function pointer(type: string, id: number, y: number, t: number, x = 50) {
    const event = new PointerEvent(type, { bubbles: true, pointerId: id, clientX: x, clientY: y, button: 0 });
    Object.defineProperty(event, 'timeStamp', { value: t + 10000 });
    await act(async () => zone.dispatchEvent(event));
  }
  return { sheet, zone, pointer, onOpenChange };
}

it('offers downward handle dismissal on an opted-in side sheet without duplicating its close action', async () => {
  const { sheet, pointer, onOpenChange } = await draggableSideSheet();
  expect(sheet.dataset.placement).toBe('end');
  expect(sheet.querySelector<HTMLElement>('.hjm-sheet__handle')!.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  expect(sheet.querySelectorAll('button[aria-label="Close letter"]')).toHaveLength(1);
  expect(sheet.querySelector('.hjm-dialog__close')).toBeNull();
  await pointer('pointerdown', 1, 100, 0);
  await pointer('pointermove', 1, 400, 1000);
  expect(sheet.style.transform).toBe('translateY(300px)');
  await pointer('pointerup', 1, 400, 2000);
  expect(sheet.style.transform).toBe('');
  expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'swipe' });
});

it.each(['pointerup', 'pointercancel', 'lostpointercapture'])('preserves the held Sheet pointer through a foreign %s', async (foreignEvent) => {
  const { sheet, pointer, onOpenChange } = await draggableSideSheet();
  await pointer('pointerdown', 1, 100, 0);
  await pointer('pointerdown', 2, 120, 100);
  await pointer('pointermove', 2, 400, 200);
  expect(sheet.style.transform).toBe('');
  await pointer('pointermove', 1, 150, 1000);
  await pointer(foreignEvent, 2, 400, 1200);
  expect(sheet.style.transform).toBe('translateY(50px)');
  expect(onOpenChange).not.toHaveBeenCalled();
  await pointer('pointerup', 1, 400, 2000);
  expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'swipe' });
});

it.each(['pointercancel', 'lostpointercapture'])('resets an owning Sheet %s and ignores its later release', async (event) => {
  const { sheet, pointer, onOpenChange } = await draggableSideSheet();
  await pointer('pointerdown', 1, 100, 0);
  await pointer('pointermove', 1, 150, 1000);
  await pointer(event, 1, 150, 1200);
  expect(sheet.style.transform).toBe('');
  await pointer('pointerup', 1, 400, 2000);
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('returns a short Sheet drag without its generated click closing, while keeping keyboard close', async () => {
  const { sheet, pointer, onOpenChange } = await draggableSideSheet();
  const handle = sheet.querySelector<HTMLElement>('.hjm-sheet__handle')!;
  await pointer('pointerdown', 1, 100, 0);
  await pointer('pointermove', 1, 120, 1000);
  await pointer('pointerup', 1, 120, 2000);
  await act(async () => handle.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })));
  expect(onOpenChange).not.toHaveBeenCalled();
  await act(async () => handle.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 })));
  expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'close-action' });
});

it('keeps a busy side Sheet closed to downward gesture requests', async () => {
  const { zone, pointer, onOpenChange } = await draggableSideSheet({ busy: true });
  expect(zone.dataset.swipe).toBeUndefined();
  await pointer('pointerdown', 1, 100, 0);
  await pointer('pointermove', 1, 400, 1000);
  await pointer('pointerup', 1, 400, 2000);
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('does not begin Sheet dismissal for a horizontal gesture', async () => {
  const { sheet, zone, pointer, onOpenChange } = await draggableSideSheet();
  await pointer('pointerdown', 1, 100, 0);
  expect(zone.setPointerCapture).toHaveBeenCalledWith(1);
  await pointer('pointermove', 1, 120, 1000, 250);
  await pointer('pointerup', 1, 120, 2000, 250);
  expect(sheet.style.transform).toBe('');
  expect(onOpenChange).not.toHaveBeenCalled();
});
