import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { notificationRowRecipe } from "@hjmds/design-contracts/screen-patterns";
import { NotificationItem } from "../src/screens.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (read: boolean, unreadLabel?: string) => act(async () => root.render(<HjmProvider systemTheme="light" reducedMotion>
  <NotificationItem read={read} statusLabel="댓글" timestamp="3분 전" title="새 댓글" href="#n1" {...(unreadLabel === undefined ? {} : { unreadLabel })} />
</HjmProvider>));

it("draws a named unread dot after the status line only for unread items that name it", async () => {
  await render(false, "읽지 않음");
  const dot = host.querySelector<HTMLElement>("[data-hjm-unread-dot]")!;
  expect(dot.getAttribute("role")).toBe("img");
  expect(dot.getAttribute("aria-label")).toBe("읽지 않음");
  expect(dot.getBoundingClientRect().width).toBe(notificationRowRecipe.unreadSize);
  expect(dot.closest("a")).not.toBeNull();
  await render(true, "읽지 않음");
  expect(host.querySelector("[data-hjm-unread-dot]")).toBeNull();
  await render(false);
  expect(host.querySelector("[data-hjm-unread-dot]")).toBeNull();
  expect(() => act(() => root.render(<NotificationItem read={false} statusLabel="s" timestamp="t" title="x" unreadLabel=" " />))).toThrow(TypeError);
});
