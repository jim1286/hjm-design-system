import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { TopBar } from "../src/top-bar.js";
import { NotificationBell } from "../src/notification-bell.js";
import "../src/styles.css";

// 2026-10-17 1.27.2 adoption finding: a top-bar-end NotificationBell (Spint home/explore) could not put its glyph on the
// bar inset because it had no IconButton `edge`.
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.style.margin = "0"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

describe.each(["ltr", "rtl"] as const)("NotificationBell edge (%s)", (direction) => {
  it("puts the glyph slot on the top-bar inset and keeps the badge on the icon corner", async () => {
    await page.viewport(402, 700);
    await act(async () => root.render(<HjmProvider direction={direction}>
      <TopBar title="홈" trailing={<NotificationBell edge="end" label="알림 3개" count={3} icon={<svg width={24} height={24} />} onPress={() => undefined} />} />
    </HjmProvider>));
    const bar = host.querySelector(".hjm-top-bar")!;
    const glyph = bar.querySelector(".hjm-icon-button svg")!.getBoundingClientRect();
    const button = bar.querySelector(".hjm-icon-button")!.getBoundingClientRect();
    const badge = bar.querySelector(".hjm-notification-bell > span[aria-hidden]")!.getBoundingClientRect();
    const inset = parseFloat(getComputedStyle(bar).paddingInlineEnd);
    expect(direction === "ltr" ? 402 - glyph.right : glyph.left).toBe(inset);
    expect(direction === "ltr" ? badge.right : badge.left).toBe(direction === "ltr" ? button.right : button.left);
    expect(document.documentElement.scrollWidth).toBe(402);
  });
});
