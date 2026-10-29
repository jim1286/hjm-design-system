// 2026-10-29 user rule: profile photos are framed in a circle before upload (Web renderer of CircularPhotoCropper).
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { CircularPhotoCropper } from "../src/image-viewer.js";
import "../src/styles.css";

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

// A 400x300 SVG photo stands in for a picked file; the crop math is the contract's.
const photo = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="teal"/></svg>');

it("shows a circular mask and returns the dragged source square", async () => {
  await page.viewport(390, 760);
  const confirm = vi.fn(), cancel = vi.fn();
  await act(async () => root.render(<HjmProvider><CircularPhotoCropper open source={{ uri: photo, width: 400, height: 300 }}
    title="사진 맞추기" hint="끌어서 옮겨요" confirmLabel="완료" cancelLabel="취소" onCancel={cancel} onConfirm={confirm} /></HjmProvider>));
  const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="사진 맞추기"]')!;
  expect(dialog).toBeTruthy();
  const mask = dialog.querySelector<HTMLElement>(".hjm-photo-cropper__mask")!;
  expect(getComputedStyle(mask).borderTopLeftRadius).toBe("50%");
  // Centred at first: the middle 300x300 of the 400x300 photo.
  const done = [...dialog.querySelectorAll("button")].find(button => button.textContent === "완료")!;
  await act(async () => done.click());
  expect(confirm).toHaveBeenLastCalledWith({ originX: 50, originY: 0, width: 300, height: 300 });
  // Drag right as far as allowed: the left edge of the photo.
  const stage = dialog.querySelector<HTMLElement>(".hjm-photo-cropper__stage")!;
  const box = stage.getBoundingClientRect();
  const at = (x: number) => ({ pointerId: 1, clientX: x, clientY: box.top + box.height / 2, bubbles: true });
  await act(async () => {
    stage.dispatchEvent(new PointerEvent("pointerdown", at(box.left + 50)));
    stage.dispatchEvent(new PointerEvent("pointermove", at(box.left + 350)));
    stage.dispatchEvent(new PointerEvent("pointerup", at(box.left + 350)));
  });
  await act(async () => done.click());
  expect(confirm).toHaveBeenLastCalledWith({ originX: 0, originY: 0, width: 300, height: 300 });
  const cancelButton = [...dialog.querySelectorAll("button")].find(button => button.textContent === "취소")!;
  await act(async () => cancelButton.click());
  expect(cancel).toHaveBeenCalledTimes(1);
});
