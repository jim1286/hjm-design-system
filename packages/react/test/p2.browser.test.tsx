import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { TextFormat } from "../src/text-formats.js";
import { ClipboardButton } from "../src/clipboard.js";
import { CounterBadge } from "../src/supplemental-display.js";
import { Avatar, AvatarGroup } from "../src/advanced-display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

it("emits a real element per text format instead of a styled span", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <TextFormat kind="kbd">Enter</TextFormat>
      <TextFormat kind="code">npm run build</TextFormat>
      <TextFormat kind="quote">기록은 짧아도 좋아요</TextFormat>
    </HjmProvider>,
  ));
  const nodes = [...document.querySelectorAll<HTMLElement>(".hjm-text-format")];
  expect(nodes.map((node) => node.tagName)).toEqual(["KBD", "CODE", "BLOCKQUOTE"]);
  expect(() => {
    // An unknown kind fails loudly instead of rendering a meaningless element.
    act(() => root.render(<HjmProvider><TextFormat kind={"bold" as never}>x</TextFormat></HjmProvider>));
  }).toThrow(/Unsupported TextFormat kind/);
});

it("shows a dot badge only with a name, because the dot carries the meaning", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <CounterBadge count={3} dot accessibilityLabel="읽지 않은 알림 있음" />
    </HjmProvider>,
  ));
  const badge = document.querySelector<HTMLElement>(".hjm-counter-badge")!;
  expect(badge.textContent).toBe("");
  expect(badge.getAttribute("aria-label")).toBe("읽지 않은 알림 있음");
  expect(Math.round(badge.getBoundingClientRect().width)).toBe(8);
  expect(() => {
    act(() => root.render(<HjmProvider><CounterBadge count={3} dot /></HjmProvider>));
  }).toThrow(/requires an accessibilityLabel/);
});

it("overlaps grouped avatars from the recipe ratio and names the group once", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <AvatarGroup label="함께한 사람 5명" overflow="+3">
        <Avatar name="미나" />
        <Avatar name="민수" />
      </AvatarGroup>
    </HjmProvider>,
  ));
  const group = document.querySelector<HTMLElement>(".hjm-avatar-group")!;
  expect(group.getAttribute("role")).toBe("group");
  expect(group.getAttribute("aria-label")).toBe("함께한 사람 5명");
  const avatars = [...document.querySelectorAll<HTMLElement>(".hjm-avatar")];
  const gap = avatars[1]!.getBoundingClientRect().left - avatars[0]!.getBoundingClientRect().left;
  // 40px medium avatar with a 0.3 overlap ratio leaves 28px of advance.
  expect(Math.round(gap)).toBeLessThan(40);
  expect(document.querySelector(".hjm-avatar-group__overflow")!.textContent).toBe("+3");
});

it("copies, announces the copied state, and reports a denied clipboard", async () => {
  const writeText = vi.fn(async () => undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <ClipboardButton value="hjm-invite-code" labels={{ idle: "초대 코드 복사", copied: "복사했어요" }} />
    </HjmProvider>,
  ));
  await act(async () => document.querySelector<HTMLButtonElement>("button")!.click());
  await act(async () => undefined);
  expect(writeText).toHaveBeenCalledWith("hjm-invite-code");
  // Announced, not only painted.
  await expect.poll(() => document.querySelector("[role='status']")!.textContent).toBe("복사했어요");

  const onCopyError = vi.fn();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: async () => { throw new Error("denied"); } },
    configurable: true,
  });
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <ClipboardButton value="x" labels={{ idle: "복사", copied: "복사했어요" }} onCopyError={onCopyError} />
    </HjmProvider>,
  ));
  await act(async () => document.querySelector<HTMLButtonElement>("button")!.click());
  await act(async () => undefined);
  expect(onCopyError).toHaveBeenCalled();
  // A denied clipboard must not claim success.
  expect(document.querySelector("button")!.textContent).toBe("복사");
});
