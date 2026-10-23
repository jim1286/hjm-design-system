import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { ListRow } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "360px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: React.ReactNode) => act(async () => root.render(node));

it("draws a decorative disclosure chevron after trailing, inside the link and before a separate action, mirrored in RTL", async () => {
  for (const direction of ["ltr", "rtl"] as const) {
    await render(<HjmProvider direction={direction}>
      <ListRow title="버전" href="/version" trailing={<span data-testid="value">1.2</span>} trailingAccessory="disclosure"
        trailingAction={<button type="button">더보기</button>} />
    </HjmProvider>);
    const link = host.querySelector<HTMLAnchorElement>("a.hjm-list-row")!;
    const accessory = link.querySelector<HTMLElement>(".hjm-list-row__accessory")!;
    expect(accessory.getAttribute("aria-hidden")).toBe("true");
    expect(link.lastElementChild).toBe(accessory);
    expect(accessory.previousElementSibling?.className).toBe("hjm-list-row__trailing");
    const icon = accessory.querySelector("svg")!;
    expect(icon.getAttribute("data-transform")).toBe(direction === "rtl" ? "mirror-inline" : "none");
    expect(icon.getAttribute("width")).toBe("20");
    // The row's accessible name stays its text; the action button stays outside the link.
    expect(link.textContent).toBe("버전1.2");
    expect(host.querySelector(".hjm-list-row__action button")!.closest("a")).toBeNull();
    // Trailing value → chevron is the tighter 8 accessory gap, not the 12 row gap.
    const value = link.querySelector(".hjm-list-row__trailing")!.getBoundingClientRect();
    const mark = accessory.getBoundingClientRect();
    const gap = direction === "rtl" ? value.left - mark.right : mark.left - value.right;
    expect(Math.round(gap)).toBe(8);
    expect(getComputedStyle(accessory).color).not.toBe(getComputedStyle(link.querySelector(".hjm-list-row__title")!).color);
  }
  await render(<HjmProvider><ListRow title="계정" onClick={() => {}} /></HjmProvider>);
  expect(host.querySelector(".hjm-list-row__accessory")).toBeNull();
});

it("keeps the loading row's accessory box", async () => {
  await render(<HjmProvider><ListRow title="계정" loading trailingAccessory="disclosure" /></HjmProvider>);
  const box = host.querySelector<HTMLElement>(".hjm-list-row--loading .hjm-list-row__accessory")!;
  expect(box.getBoundingClientRect().width).toBe(20);
  expect(box.querySelector("svg")).toBeNull();
});
