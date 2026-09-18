import type { CarouselSelection } from "@hjmds/design-contracts/components/carousel";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { Carousel, type CarouselProps } from "../src/carousel.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

const slides = [{ id: "a", label: "첫 소식" }, { id: "b", label: "둘째 소식" }, { id: "c", label: "마지막 소식" }];
const base = { label: "새 소식", slides, labels: { previous: "이전", next: "다음", pause: "멈추기", resume: "재생하기", navigation: "소식 이동" },
  composeAccessibleName: ({ position, total, label }: { position: number; total: number; label: string }) => `${position}/${total} ${label}`,
  renderSlide: ({ id, label }: { id: string; label: string }) => <div><a href={`#${id}`}>{label}</a><input aria-label={`${id} 메모`} /></div>,
};
let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.useRealTimers(); await page.viewport(1280, 720); });
const button = (text: string) => [...host.querySelectorAll("button")].find((node) => node.textContent === text)!;
const current = () => host.querySelector('.hjm-carousel__slide:not([hidden])')?.getAttribute("aria-label");
async function render(props: Partial<Omit<CarouselProps, "currentKey" | "defaultCurrentKey" | "onCurrentKeyChange">> & CarouselSelection = {}, direction: "ltr" | "rtl" = "ltr", reducedMotion = false) {
  await act(async () => root.render(<HjmProvider direction={direction} reducedMotion={reducedMotion}><Carousel {...base} {...props} /></HjmProvider>));
}

describe("Carousel interaction", () => {
  it("keeps keyed card state while hiding its links from focus and accessibility", async () => {
    await render();
    const input = host.querySelector<HTMLInputElement>("input")!; input.value = "남겨둔 메모";
    const next = button("다음");
    await act(async () => { next.focus(); next.click(); });
    expect(current()).toBe("2/3 둘째 소식");
    expect(document.activeElement).toBe(next);
    const hidden = host.querySelector<HTMLElement>('.hjm-carousel__slide[hidden]')!;
    expect(hidden.inert).toBe(true); expect(getComputedStyle(hidden).display).toBe("none");
    hidden.querySelector("a")!.focus(); expect(document.activeElement).toBe(next);
    await act(async () => button("이전").click()); expect(input.value).toBe("남겨둔 메모");
    await act(async () => button("이전").click()); expect(current()).toBe("1/3 첫 소식");
    expect(button("이전").disabled).toBe(false); expect(button("이전").getAttribute("aria-disabled")).toBe("true");
  });
  it.each(["ltr", "rtl"] as const)("moves from controls in %s without stealing an input arrow", async (direction) => {
    await render({}, direction);
    await act(async () => button("다음").dispatchEvent(new KeyboardEvent("keydown", { key: direction === "ltr" ? "ArrowRight" : "ArrowLeft", bubbles: true })));
    expect(current()).toBe("2/3 둘째 소식");
    await act(async () => host.querySelector('.hjm-carousel__slide:not([hidden]) input')!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(current()).toBe("2/3 둘째 소식");
  });
  it("requests a controlled key without changing the card until its owner updates", async () => {
    const change = vi.fn(); await render({ currentKey: "a", onCurrentKeyChange: change });
    await act(async () => button("다음").click()); expect(change).toHaveBeenCalledWith("b"); expect(current()).toBe("1/3 첫 소식");
    await render({ currentKey: "b", onCurrentKeyChange: change }); expect(current()).toBe("2/3 둘째 소식");
  });
  it("stops autoplay after focus leaves until explicitly restarted and stops at the end", async () => {
    vi.useFakeTimers(); await render({ autoplay: { intervalMs: 1000 } });
    await act(async () => { button("다음").focus(); });
    await act(async () => { button("다음").blur(); await vi.advanceTimersByTimeAsync(3000); });
    expect(current()).toBe("1/3 첫 소식");
    await act(async () => button("재생하기").click());
    expect(host.querySelector(".hjm-carousel__track")?.getAttribute("aria-live")).toBe("off");
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); }); expect(current()).toBe("2/3 둘째 소식");
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); }); expect(current()).toBe("3/3 마지막 소식");
    await act(async () => { await vi.advanceTimersByTimeAsync(4000); }); expect(current()).toBe("3/3 마지막 소식");
    expect(host.querySelector(".hjm-carousel__track")?.getAttribute("aria-live")).toBe("polite");
  });
  it("keeps a pointer pause click paused when focus arrives before click", async () => {
    vi.useFakeTimers(); await render({ autoplay: { intervalMs: 1000 } });
    const rotation = button("멈추기");
    await act(async () => { rotation.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); rotation.focus(); });
    await act(async () => rotation.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 })));
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); }); expect(current()).toBe("1/3 첫 소식");
    await act(async () => button("재생하기").click());
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); }); expect(current()).toBe("2/3 둘째 소식");
  });
  it("suppresses autoplay with reduced motion", async () => {
    vi.useFakeTimers(); await render({ autoplay: { intervalMs: 1000 } }, "ltr", true);
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); }); expect(current()).toBe("1/3 첫 소식");
  });
  it("fits wrapped controls at 320px and 200% text", async () => {
    await page.viewport(320, 844);
    await act(async () => root.render(<HjmProvider textScale={2} direction="rtl"><Carousel {...base} /></HjmProvider>));
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
    for (const control of host.querySelectorAll("button")) {
      expect(control.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
      expect(control.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
    expect(button("이전").getBoundingClientRect().top).toBe(button("다음").getBoundingClientRect().top);
    expect(host.querySelector(".hjm-carousel__dots")!.getBoundingClientRect().bottom).toBeLessThanOrEqual(button("이전").getBoundingClientRect().top);
  });
});
