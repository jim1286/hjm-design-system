import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { SidePanelDismissPolicy } from "@hjmds/design-contracts/components/side-panel";
import { SidePanel, type SidePanelProps } from "../src/side-panel.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const panel = () => document.querySelector<HTMLElement>(".hjm-side-panel");
const backdrop = () => document.querySelector<HTMLElement>(".hjm-side-panel-positioner");
const button = (text: string) => [...document.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
const labelled = (label: string) => document.querySelector<HTMLElement>(`[aria-label="${label}"]`)!;
const click = async (text: string) => act(async () => button(text).click());
const key = async (value: string, shiftKey = false) => act(async () => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true })));

const fixture = (props: Partial<SidePanelProps> = {}) => {
  const merged = {
    trigger: <button>상세 열기</button>,
    title: "기록 상세",
    closeLabel: "닫기",
    footer: <button>저장</button>,
    ...props,
  } as SidePanelProps;
  return (
    <HjmProvider reducedMotion>
      <SidePanel {...merged}><input aria-label="제목" /></SidePanel>
      <button onClick={() => {}}>페이지 버튼</button>
    </HjmProvider>
  );
};

it("docks a modal panel to the logical end edge, traps focus and locks page scroll", async () => {
  await act(async () => root.render(fixture()));
  expect(document.body.style.overflow).toBe("");
  await click("상세 열기");
  expect(panel()?.getAttribute("role")).toBe("dialog");
  expect(panel()?.getAttribute("aria-modal")).toBe("true");
  expect(panel()?.dataset.edge).toBe("end");
  expect(document.body.style.overflow).toBe("hidden");
  // The docked panel spans the viewport block size and sits flush against the edge.
  const box = panel()!.getBoundingClientRect();
  expect(Math.round(box.right)).toBe(Math.round(window.innerWidth));
  expect(Math.round(box.height)).toBe(Math.round(window.innerHeight));
  expect(getComputedStyle(panel()!).borderRadius).toBe("0px");
  await act(async () => button("저장").focus());
  await key("Tab");
  expect(document.activeElement).not.toBe(button("페이지 버튼"));
  expect(panel()!.contains(document.activeElement)).toBe(true);
  await act(async () => labelled("닫기").click());
  expect(document.body.style.overflow).toBe("");
  expect(document.activeElement).toBe(button("상세 열기"));
});

it("mirrors the start edge in RTL and keeps the size contract per variant", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion direction="rtl">
      <SidePanel defaultOpen edge="start" size="wide" title="필터" closeLabel="닫기"
        trigger={<button>열기</button>}><input aria-label="검색" /></SidePanel>
    </HjmProvider>,
  ));
  const box = panel()!.getBoundingClientRect();
  // `start` in RTL is the right edge; the logical property resolves it, not a left/right prop.
  expect(Math.round(box.right)).toBe(Math.round(window.innerWidth));
  expect(Math.round(box.width)).toBe(560);
});

it("leaves the page live for a non-modal panel and still dismisses on Escape from inside", async () => {
  const changes = vi.fn(); const outside = vi.fn();
  const policy: SidePanelDismissPolicy = { modal: false, dismissible: true, dismissWhileBusy: false, escapeDismiss: true };
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <SidePanel defaultOpen dismissPolicy={policy} title="보조 정보" closeLabel="닫기"
        trigger={<button>열기</button>} onOpenChange={changes}><input aria-label="메모" /></SidePanel>
      <button onClick={outside}>페이지 버튼</button>
    </HjmProvider>,
  ));
  expect(panel()?.getAttribute("role")).toBe("complementary");
  expect(panel()?.hasAttribute("aria-modal")).toBe(false);
  expect(backdrop()).toBeNull();
  expect(document.body.style.overflow).toBe("");
  // The rest of the page keeps both its focus and its clicks.
  await act(async () => button("페이지 버튼").focus());
  expect(document.activeElement).toBe(button("페이지 버튼"));
  await click("페이지 버튼");
  expect(outside).toHaveBeenCalledTimes(1);
  expect(panel()).not.toBeNull();
  // Escape outside the panel belongs to the page; only focus inside dismisses it.
  await key("Escape");
  expect(panel()).not.toBeNull();
  await act(async () => labelled("메모").focus());
  await key("Escape");
  expect(panel()).toBeNull();
  expect(changes.mock.calls.map((call) => call[1].reason)).toEqual(["escape"]);
});

it("reports one concrete reason per dismissal and refuses outside dismissal while busy", async () => {
  const changes = vi.fn();
  await act(async () => root.render(fixture({ busy: true, onOpenChange: changes, defaultOpen: true })));
  await act(async () => { backdrop()!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); });
  expect(panel()).not.toBeNull();
  expect(labelled("닫기").hasAttribute("disabled")).toBe(true);
  await act(async () => root.render(fixture({ onOpenChange: changes, defaultOpen: true })));
  await act(async () => { backdrop()!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); });
  expect(panel()).toBeNull();
  expect(changes.mock.calls.map((call) => call[1].reason)).toEqual(["outside"]);
});

it("lets a controlled owner close a busy panel and completes the dismissal once", async () => {
  const complete = vi.fn();
  function Owner() {
    const [open, setOpen] = useState(true);
    return (
      <HjmProvider reducedMotion>
        <SidePanel open={open} onOpenChange={(next, detail) => { void detail; setOpen(next); }}
          busy title="업로드 중" closeLabel="닫기" onDismissComplete={complete}
          trigger={<button>열기</button>}><input aria-label="파일 이름" /></SidePanel>
        <button onClick={() => setOpen(false)}>작업 끝내기</button>
      </HjmProvider>
    );
  }
  await act(async () => root.render(<Owner />));
  await key("Escape");
  expect(panel()).not.toBeNull();
  expect(complete).not.toHaveBeenCalled();
  // Reduced motion has no exit transition to wait for; the callback must still
  // arrive exactly once, with the owner-initiated reason.
  await click("작업 끝내기");
  expect(panel()).toBeNull();
  expect(complete.mock.calls).toEqual([[{ reason: "programmatic" }]]);
});

it("keeps the panel readable at double text size in a narrow viewport", async () => {
  await page.viewport(320, 640);
  await act(async () => root.render(
    <HjmProvider reducedMotion textScale={2}>
      <SidePanel defaultOpen size="wide" title="아주 긴 제목과 unexpectedly long English heading"
        description="긴 설명 문장이 좁은 화면에서도 잘리지 않고 이어서 읽힌다."
        closeLabel="닫기" footer={<button>저장</button>} trigger={<button>열기</button>}>
        <input aria-label="제목" />
      </SidePanel>
    </HjmProvider>,
  ));
  const box = panel()!.getBoundingClientRect();
  expect(Math.round(box.width)).toBeLessThanOrEqual(320);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  expect(labelled("닫기").getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  const body = panel()!.querySelector<HTMLElement>(".hjm-side-panel__body")!;
  const footer = panel()!.querySelector<HTMLElement>(".hjm-side-panel__footer")!;
  // The footer keeps its own row instead of being pushed off the docked panel.
  expect(Math.round(footer.getBoundingClientRect().bottom)).toBeLessThanOrEqual(Math.round(box.bottom) + 1);
  expect(body.getBoundingClientRect().height).toBeGreaterThan(0);
});
