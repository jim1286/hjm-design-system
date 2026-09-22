import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
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
