import { act } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { ThinkingOrb } from "../src/thinking-orb.js";
import { HjmProvider } from "../src/provider.js";
// The evidence registry points to this focused environment/accessibility proof; its shared scenario fixture is intentionally generic.
// componentId: "thinking-orb"
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement;
afterEach(async () => { if (root) await act(() => root!.unmount()); root = undefined; host?.remove(); vi.restoreAllMocks(); });
async function render(
  paused = false,
  reducedMotion = false,
  theme: "light" | "dark" = "light",
  active = true,
  options: Readonly<{ size?: 20 | 64; direction?: "ltr" | "rtl"; textScale?: number; label?: string }> = {},
) {
  if (!root) { host = document.createElement("div"); document.body.append(host); root = createRoot(host); }
  await act(() => root!.render(
    <HjmProvider
      theme={theme}
      reducedMotion={reducedMotion}
      {...(options.direction === undefined ? {} : { direction: options.direction })}
      {...(options.textScale === undefined ? {} : { textScale: options.textScale })}
    >
      <ThinkingOrb
        label={options.label ?? "검색 중"}
        state="searching"
        {...(options.size === undefined ? {} : { size: options.size })}
        paused={paused}
        active={active}
      />
    </HjmProvider>,
  ));
}
const pixels = () => host.querySelector("canvas")!.toDataURL();
const wait = () => new Promise(resolve => setTimeout(resolve, 100));
it("renders semantic ink, localized status, frozen frames and cleans up observers", async () => {
  const cancel = vi.spyOn(window, "cancelAnimationFrame");
  await render(false, true);
  expect(host.querySelector('[role="status"]')?.textContent).toBe("검색 중");
  expect(host.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
  const light = pixels(); await wait(); expect(pixels()).toBe(light);
  await render(false, true, "dark"); expect(pixels()).not.toBe(light);
  await render(false, false); await wait(); const first = pixels(); await wait(); expect(pixels()).not.toBe(first);
  await render(true); const frozen = pixels(); await wait(); expect(pixels()).toBe(frozen);
  await render(false, false, "light", false); const inactive = pixels(); await wait(); expect(pixels()).toBe(inactive);
  await act(() => root!.unmount()); root = undefined; expect(cancel).toHaveBeenCalled();
});
it("stops drawing when outside the viewport and resumes when visible", async () => {
  await render(); await wait();
  host.style.position = "fixed"; host.style.top = "-1000px";
  await wait(); const hidden = pixels(); await wait(); expect(pixels()).toBe(hidden);
  host.style.top = "0"; await wait(); expect(pixels()).not.toBe(hidden);
});

it("keeps the required large-text, RTL, theme, reduced-motion, and accessibility contract", async () => {
  const longLocalizedLabel = "검색 중: 요청한 내용을 찾고 결과를 정리하고 있습니다";
  for (const size of [20, 64] as const) {
    await render(false, true, "dark", true, { size, direction: "rtl", textScale: 2, label: longLocalizedLabel });
    const status = host.querySelector<HTMLElement>('[role="status"]');
    const canvas = host.querySelector<HTMLCanvasElement>("canvas");
    const provider = host.querySelector<HTMLElement>("[data-hjm-provider]");
    expect(provider?.getAttribute("data-theme")).toBe("dark");
    expect(provider?.getAttribute("dir")).toBe("rtl");
    expect(provider?.getAttribute("data-large-text")).toBe("true");
    expect(status?.textContent).toBe(longLocalizedLabel);
    expect(status?.getAttribute("aria-live")).toBe("polite");
    expect(status?.getAttribute("aria-atomic")).toBe("true");
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
    expect(canvas?.style.width).toBe(`${size}px`);
    expect(canvas?.style.height).toBe(`${size}px`);
    const staticFrame = pixels(); await wait(); expect(pixels()).toBe(staticFrame);
  }
});
