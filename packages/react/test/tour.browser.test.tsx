import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { Tour } from "../src/tour.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const card = () => document.querySelector<HTMLElement>(".hjm-tour");
const button = (text: string) => [...document.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
const click = async (text: string) => act(async () => button(text).click());
const key = async (value: string) => act(async () => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })));

const labels = { next: "다음", previous: "이전", skip: "그만 보기", done: "다 봤어요" };
const steps = [
  { id: "list", anchorId: "list", title: "여기에 기록이 쌓여요", description: "최근에 쓴 기록이 위에 옵니다." },
  { id: "write", anchorId: "write", title: "여기서 새 기록을 써요", description: "짧게 남겨도 괜찮아요." },
] as const;

function Fixture({
  onOpenChange,
  onStepChange,
  controlled,
}: {
  onOpenChange?: (open: boolean, detail: { reason: string }) => void;
  onStepChange?: (id: string) => void;
  controlled?: boolean;
}) {
  const [stepId, setStepId] = useState<"list" | "write">("list");
  const [open, setOpen] = useState(true);
  const openProps = controlled
    ? { open, onOpenChange: (next: boolean, detail: { reason: string }) => { setOpen(next); onOpenChange?.(next, detail); } }
    : { defaultOpen: true, ...(onOpenChange === undefined ? {} : { onOpenChange }) };
  return (
    <HjmProvider reducedMotion>
      <button id="list" type="button">내 기록</button>
      <button id="write" type="button">새 기록</button>
      <Tour
        {...openProps}
        descriptor={{ accessibilityLabel: "기록 둘러보기", currentStepId: stepId, labels, steps: [...steps] }}
        resolveAnchor={(anchorId) => document.getElementById(anchorId)}
        composeAnnouncement={({ position, total, title, description }) => `${total}단계 중 ${position}단계, ${title}. ${description}`}
        onStepChange={(id) => { setStepId(id as "list" | "write"); onStepChange?.(id); }}
      />
    </HjmProvider>
  );
}

it("names the tour, announces the step, and moves focus to the card on every step change", async () => {
  await act(async () => root.render(<Fixture />));
  await expect.poll(() => document.activeElement).toBe(card());
  expect(card()?.getAttribute("aria-label")).toBe("기록 둘러보기");
  expect(card()?.getAttribute("aria-modal")).toBe("true");
  const announcement = () => document.getElementById(card()!.getAttribute("aria-describedby")!)!.textContent;
  expect(announcement()).toBe("2단계 중 1단계, 여기에 기록이 쌓여요. 최근에 쓴 기록이 위에 옵니다.");
  // The visible copy repeats the announcement, so it stays out of the a11y tree.
  expect(card()!.querySelector(".hjm-tour__title")!.closest("[aria-hidden='true']")).not.toBeNull();

  await click("다음");
  await expect.poll(() => announcement()).toBe("2단계 중 2단계, 여기서 새 기록을 써요. 짧게 남겨도 괜찮아요.");
  // Focus follows the card, never the anchor the step points at.
  expect(document.activeElement).toBe(card());
  expect(document.getElementById("write")).not.toBe(document.activeElement);
});

it("keeps the page inert and never dismisses on an outside pointer", async () => {
  const changes = vi.fn();
  await act(async () => root.render(<Fixture onOpenChange={changes} />));
  await expect.poll(() => card()).not.toBeNull();
  expect(document.getElementById("list")!.closest("[inert]")).not.toBeNull();
  await act(async () => {
    document.querySelector<HTMLElement>(".hjm-tour-backdrop")!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  });
  expect(card()).not.toBeNull();
  expect(changes).not.toHaveBeenCalled();
});

it("treats Previous on the first step as a no-op and finishes the last step as complete", async () => {
  const changes = vi.fn(); const stepChanges = vi.fn();
  await act(async () => root.render(<Fixture onOpenChange={changes} onStepChange={stepChanges} />));
  await expect.poll(() => card()).not.toBeNull();
  await click("이전");
  expect(stepChanges).not.toHaveBeenCalled();
  expect(card()).not.toBeNull();
  await click("다음");
  await click("이전");
  expect(stepChanges.mock.calls.map(([id]) => id)).toEqual(["write", "list"]);
  await click("다음");
  // The last step's primary action carries the done label and completes.
  expect(button("다 봤어요")).toBeTruthy();
  await click("다 봤어요");
  expect(card()).toBeNull();
  expect(changes.mock.calls.map(([, detail]) => detail.reason)).toEqual(["complete"]);
});

it("always exits on Escape and on Skip, whichever step is showing", async () => {
  const changes = vi.fn();
  await act(async () => root.render(<Fixture onOpenChange={changes} />));
  await expect.poll(() => card()).not.toBeNull();
  await key("Escape");
  expect(card()).toBeNull();
  await act(async () => root.unmount());
  root = createRoot(host);
  await act(async () => root.render(<Fixture onOpenChange={changes} />));
  await expect.poll(() => card()).not.toBeNull();
  await click("다음");
  await click("그만 보기");
  expect(card()).toBeNull();
  expect(changes.mock.calls.map(([, detail]) => detail.reason)).toEqual(["escape", "skip"]);
});

it("settles an unmounted open tour as interrupted exactly once", async () => {
  const changes = vi.fn();
  await act(async () => root.render(<Fixture onOpenChange={changes} />));
  await expect.poll(() => card()).not.toBeNull();
  await act(async () => root.unmount());
  await act(async () => undefined);
  expect(changes.mock.calls.map(([open, detail]) => [open, detail.reason])).toEqual([[false, "interrupted"]]);
  root = createRoot(host);
});

it("lets a controlled owner close the tour and keeps the card inside a narrow viewport", async () => {
  await page.viewport(320, 640);
  const changes = vi.fn();
  await act(async () => root.render(<Fixture controlled onOpenChange={changes} />));
  await expect.poll(() => card()).not.toBeNull();
  const box = card()!.getBoundingClientRect();
  expect(Math.round(box.left)).toBeGreaterThanOrEqual(0);
  expect(Math.round(box.right)).toBeLessThanOrEqual(320);
  await key("Escape");
  expect(card()).toBeNull();
  expect(changes.mock.calls.map(([open, detail]) => [open, detail.reason])).toEqual([[false, "escape"]]);
});
