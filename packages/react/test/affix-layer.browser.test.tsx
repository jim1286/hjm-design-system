import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { Affix } from "../src/affix.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

it("keeps a pinned bar above later positioned content and paints the canvas behind it", async () => {
  await act(async () => root.render(<HjmProvider><div data-testid="scroller" style={{ height: 200, overflowY: "auto" }}>
    <Affix><div style={{ height: 40 }}>탭 막대</div></Affix>
    <div style={{ position: "relative", height: 600 }}><div data-testid="card" style={{ position: "relative", height: 80 }}>카드</div></div>
  </div></HjmProvider>));
  const scroller = host.querySelector<HTMLElement>('[data-testid="scroller"]')!;
  const affix = host.querySelector<HTMLElement>(".hjm-affix")!;
  await act(async () => { scroller.scrollTop = 30; scroller.dispatchEvent(new Event("scroll")); await new Promise(requestAnimationFrame); });
  const bar = affix.getBoundingClientRect();
  const card = host.querySelector<HTMLElement>('[data-testid="card"]')!.getBoundingClientRect();
  // The card scrolled under the pinned bar; the topmost element at the overlap is the bar, not the later card.
  expect(card.top).toBeLessThan(bar.bottom);
  const hit = document.elementFromPoint(bar.left + 4, bar.bottom - 4)!;
  expect(affix.contains(hit)).toBe(true);
  expect(getComputedStyle(affix).zIndex).toBe("100");
  expect(getComputedStyle(affix).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
});

it("lets products choose the base layer and no fill, and rejects unknown values", async () => {
  await act(async () => root.render(<HjmProvider><Affix layer="base" fill="none"><span>필터</span></Affix></HjmProvider>));
  const affix = host.querySelector<HTMLElement>(".hjm-affix")!;
  expect(getComputedStyle(affix).zIndex).toBe("0");
  expect(getComputedStyle(affix).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  await expect(act(async () => root.render(<Affix layer={"modal" as "base"}><span /></Affix>))).rejects.toThrow(/Unsupported Affix layer/);
});
