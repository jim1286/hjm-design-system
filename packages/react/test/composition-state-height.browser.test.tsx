import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import type { ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { CompositionLayout } from "../src/screens.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "360px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: React.ReactNode) => act(async () => root.render(node));

it("reserves the state region height in place and leaves ready content alone", async () => {
  const view = (state: ScreenContentState) => <HjmProvider>
    <CompositionLayout title="박스스코어" state={state} stateHeight="regular"><div data-testid="ready" style={{ height: 40 }} /></CompositionLayout>
  </HjmProvider>;
  await render(view({ kind: "empty", title: "기록 없음" }));
  const region = host.querySelector<HTMLElement>("[data-hjm-state-height]")!;
  expect(region.dataset.hjmStateHeight).toBe("regular");
  const box = region.getBoundingClientRect(); const copy = region.querySelector('[role="status"]')!.getBoundingClientRect();
  expect(box.height).toBe(160);
  expect(Math.abs((copy.top + copy.bottom) / 2 - (box.top + box.bottom) / 2)).toBeLessThan(1);
  await render(view({ kind: "ready" }));
  expect(host.querySelector("[data-hjm-state-height]")).toBeNull();
  expect(host.querySelector<HTMLElement>('[data-testid="ready"]')!.getBoundingClientRect().height).toBe(40);
});
