import { act, createRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { FloatingActionButton, useFloatingActionButtonScroll, resolveFloatingActionButtonContentClearance } from "../src/floating-action-button.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

function ScrollFixture({ scale = 1, direction = "ltr" as "ltr" | "rtl" }) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const layoutMode = useFloatingActionButtonScroll(target);
  const [clearance, setClearance] = useState(resolveFloatingActionButtonContentClearance(34));
  return <HjmProvider textScale={scale} direction={direction}>
    <div ref={setTarget} data-scroll style={{ height: 440, overflow: "auto" }}>
      <div style={{ paddingBottom: clearance }}><div style={{ height: 800 }} /><button data-last>마지막 기록 열기</button></div>
    </div>
    <FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" }, layoutMode }}
      renderIcon={() => <span>＋</span>} onContentClearanceChange={setClearance} safeAreaBottomInset={34} />
  </HjmProvider>;
}

describe("FloatingActionButton", () => {
  it("collapses after accumulated scroll, expands toward the start and retains the same focused button", async () => {
    await page.viewport(320, 500); await act(async () => root.render(<ScrollFixture />));
    const scroll = host.querySelector<HTMLElement>("[data-scroll]")!;
    const button = host.querySelector<HTMLButtonElement>(".hjm-fab")!; button.focus();
    const move = async (top: number) => { await act(async () => { scroll.scrollTop = top; scroll.dispatchEvent(new Event("scroll")); }); };
    await move(3); expect(button.dataset.mode).toBe("expanded");
    await move(12); expect(button.dataset.mode).toBe("collapsed");
    expect(button.getAttribute("aria-label")).toBe("새 기록"); expect(button.getBoundingClientRect().width).toBe(52);
    expect(document.activeElement).toBe(button); expect(host.querySelector(".hjm-fab")).toBe(button);
    await move(12); expect(button.dataset.mode).toBe("collapsed");
    await move(2); expect(button.dataset.mode).toBe("expanded");
    expect(button.querySelector(".hjm-fab__icon")?.getAttribute("aria-hidden")).toBe("true");
  });
  it.each(["ltr", "rtl"] as const)("reserves the last content above the fixed action in %s", async (direction) => {
    await page.viewport(320, 500); await act(async () => root.render(<ScrollFixture scale={2} direction={direction} />));
    const scroll = host.querySelector<HTMLElement>("[data-scroll]")!;
    await act(async () => { scroll.scrollTop = scroll.scrollHeight; scroll.dispatchEvent(new Event("scroll")); });
    const last = host.querySelector("[data-last]")!.getBoundingClientRect();
    const fab = host.querySelector(".hjm-fab")!.getBoundingClientRect();
    expect(last.bottom).toBeLessThanOrEqual(fab.top); expect(last.top).toBeGreaterThanOrEqual(scroll.getBoundingClientRect().top);
    expect(500 - fab.bottom).toBe(50);
    expect(direction === "ltr" ? 320 - fab.right : fab.left).toBe(16);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  });
  it("reports actual multiline height and preserves ref and activation", async () => {
    await page.viewport(320, 600); const clearance = vi.fn(); const click = vi.fn(); const ref = createRef<HTMLButtonElement>();
    await act(async () => root.render(<HjmProvider textScale={2} reducedMotion>
      <FloatingActionButton ref={ref} descriptor={{ label: "오늘의 새로운 기록을 남겨볼까요", icon: { name: "add" } }}
        renderIcon={() => <span>＋</span>} onClick={click} onContentClearanceChange={clearance} />
    </HjmProvider>));
    const button = ref.current!; expect(button).toBe(host.querySelector(".hjm-fab"));
    const bounds = button.getBoundingClientRect();
    expect(bounds.height).toBeGreaterThan(52); expect(clearance).toHaveBeenLastCalledWith(bounds.height + 32);
    expect(getComputedStyle(button.querySelector(".hjm-button__label")!).animationName).toBe("none");
    await act(async () => button.click()); expect(click).toHaveBeenCalledTimes(1);
    expect(bounds.left).toBeGreaterThanOrEqual(0); expect(bounds.right).toBeLessThanOrEqual(320);
  });
});
