import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Switch } from "../src/selection.js";
import "../src/styles.css";

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); await page.viewport(1280, 720); });

it("exposes one named switch and a separate description, and toggles once from the label", async () => {
  const change = vi.fn();
  await act(async () => root.render(<HjmProvider>
    <Switch presentation="row" label="댓글 알림" description="새 댓글이 도착하면 알려드려요." onCheckedChange={change} />
  </HjmProvider>));
  const control = page.getByRole("switch", { name: "댓글 알림", exact: true });
  const button = container.querySelector("button")!;
  expect(document.getElementById(button.getAttribute("aria-describedby")!)?.textContent).toBe("새 댓글이 도착하면 알려드려요.");
  expect(container.querySelectorAll("button,input")).toHaveLength(1);
  await act(async () => page.getByText("댓글 알림", { exact: true }).click());
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(button.getAttribute("aria-checked")).toBe("true");
  await act(async () => control.click());
  expect(change).toHaveBeenLastCalledWith(false);
});

it.each(["ltr", "rtl"] as const)("reflows long copy at 200%% without shrinking the track (%s)", async (direction) => {
  await page.viewport(320, 568);
  await act(async () => root.render(<HjmProvider direction={direction} textScale={2}>
    <Switch presentation="row" label="관심 있는 소식의 알림을 받을게요" description="알림을 꺼도 기록과 설정은 그대로 유지돼요." />
  </HjmProvider>));
  const button = container.querySelector<HTMLElement>("button")!;
  const copy = button.querySelector<HTMLElement>(".hjm-switch__copy")!.getBoundingClientRect();
  const track = button.querySelector<HTMLElement>(".hjm-switch__track")!.getBoundingClientRect();
  expect(track.top).toBeGreaterThanOrEqual(copy.bottom);
  expect(track.width).toBeGreaterThanOrEqual(44);
  expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
});

it("retains caller descriptions and suppresses disabled changes", async () => {
  const change = vi.fn();
  await act(async () => root.render(<HjmProvider><p id="extra">추가 안내</p>
    <Switch disabled label="알림" description="설명을 확인하세요" aria-describedby="extra" onCheckedChange={change} />
  </HjmProvider>));
  const button = container.querySelector("button")!;
  expect(button.getAttribute("aria-describedby")?.split(" ")).toContain("extra");
  button.click();
  expect(change).not.toHaveBeenCalled();
});

it("uses the nearest provider's text scale for a nested row", async () => {
  await act(async () => root.render(<HjmProvider textScale={2}>
    <HjmProvider textScale={1}><Switch presentation="row" label="알림" description="일반 크기 설명" /></HjmProvider>
  </HjmProvider>));
  const button = container.querySelector<HTMLElement>("button")!;
  expect(getComputedStyle(button).flexDirection).toBe("row");
});
