import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { AnimatedStatistic } from "../src/statistic-motion.js";
import { MorphingMenu } from "../src/menu-morph.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined; let host: HTMLDivElement;
afterEach(async () => { if (root) await act(() => root!.unmount()); root = undefined; host?.remove(); });
async function render(child: ReactNode, reducedMotion = false) {
  if (!root) { host = document.createElement("div"); document.body.append(host); root = createRoot(host); }
  await act(() => root!.render(<HjmProvider reducedMotion={reducedMotion}>{child}</HjmProvider>));
}
it("formats accessible values and uses static output for unsupported number formats", async () => {
  const view = (locale = "ko-KR", value = 1200) => <AnimatedStatistic descriptor={{ id: "count", label: "조회" }} value={value} locale={locale} />;
  await render(view()); expect(host.querySelector("number-flow-react")).not.toBeNull();
  expect(host.querySelector("article")?.getAttribute("aria-label")).toContain("1,200");
  await render(view("ko-KR", 5432)); expect(host.querySelector("article")?.getAttribute("aria-label")).toContain("5,432");
  await render(view("ar-EG")); expect(host.querySelector("number-flow-react")).toBeNull();
  expect(host.textContent).toContain(new Intl.NumberFormat("ar-EG").format(1200));
  await render(view(), true); expect(host.querySelector("number-flow-react")).toBeNull();
  await render(<AnimatedStatistic descriptor={{ id: "count", label: "조회" }} value={12345} locale="en-US" format={{ notation: "scientific" }} />);
  expect(host.textContent).toContain("1.235E4");
});
it("supports menu keyboard selection, disabled skipping, Escape and restored focus", async () => {
  const action = vi.fn();
  await render(<MorphingMenu label="작업" items={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta", disabled: true }, { id: "c", label: "Copy" }]} onAction={action} />);
  const trigger = () => host.querySelector<HTMLElement>('[role="button"]')!;
  await act(() => trigger().click());
  const items = host.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
  expect(document.activeElement).toBe(items[0]);
  expect(host.querySelector('[role="menu"]')?.getAttribute("aria-label")).toBe("작업");
  await act(() => items[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
  expect(document.activeElement).toBe(items[2]);
  await act(() => items[2]!.click()); expect(action).toHaveBeenCalledExactlyOnceWith("c");
  expect(document.activeElement).toBe(trigger());
  await act(() => trigger().click());
  await act(() => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  expect(document.activeElement).toBe(trigger());
});
it("uses the canonical Menu when motion is reduced", async () => {
  await render(<MorphingMenu label="작업" items={[{ id: "a", label: "Alpha" }]} />, true);
  expect(host.querySelector(".hjm-menu-morph")).toBeNull();
  expect(host.querySelector("button")?.textContent).toBe("작업");
});
