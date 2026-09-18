import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { popoverHoverDelay, type PopoverOpenState } from "@hjmds/design-contracts/components/popover";
import { Popover, type PopoverProps } from "../src/popover.js";
import { Dialog, Menu } from "../src/overlays.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });
const dialog = () => document.querySelector<HTMLElement>('[data-hjm-popover-content][data-state="open"]');
const button = (text: string) => [...document.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === text)!;
const click = async (text: string) => act(async () => button(text).click());
const key = async (value: string, shiftKey = false) => act(async () => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true })));
const fixture = (extra: PopoverOpenState & Pick<PopoverProps, "dismissPolicy"> = {}) => <HjmProvider reducedMotion><Popover trigger={<button>필터</button>} title="기록 필터" closeLabel="닫기" {...extra}>
  {({ close }) => <><input aria-label="주제" /><button onClick={close}>적용</button></>}
</Popover><button onClick={() => {}}>다음 입력</button></HjmProvider>;
it("opens on activation, names a non-modal dialog, enters its body and restores on Escape", async () => {
  const changes = vi.fn(); await act(async () => root.render(fixture({ onOpenChange: changes })));
  await act(async () => button("필터").dispatchEvent(new PointerEvent("pointerenter", { bubbles: true })));
  expect(dialog()).toBeNull(); await click("필터");
  await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("주제");
  expect(dialog()?.hasAttribute("aria-modal")).toBe(false); expect(dialog()?.getAttribute("aria-labelledby")).toBeTruthy();
  expect(button("필터").getAttribute("aria-expanded")).toBe("true");
  await key("Escape"); await expect.poll(() => document.activeElement).toBe(button("필터"));
  expect(dialog()).toBeNull(); expect(changes.mock.calls.map((call) => call[1].reason)).toEqual(["trigger", "escape"]);
});
it("closes once and preserves an outside pointer's focus and click", async () => {
  const changes = vi.fn(); const outside = vi.fn();
  await act(async () => root.render(<HjmProvider reducedMotion><Popover title="선택" closeLabel="닫기" trigger={<button>열기</button>} onOpenChange={changes}><input aria-label="입력" /></Popover><button onClick={outside}>바깥</button></HjmProvider>));
  await click("열기"); await act(async () => { button("바깥").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); button("바깥").focus(); button("바깥").dispatchEvent(new PointerEvent("pointerup", { bubbles: true })); button("바깥").click(); });
  expect(document.activeElement).toBe(button("바깥")); expect(outside).toHaveBeenCalledTimes(1); expect(changes.mock.calls.map((call) => call[1].reason)).toEqual(["trigger", "outside-pointer"]);
});
it("continues Tab after the trigger and Shift+Tab back to it without a focus trap", async () => {
  await act(async () => root.render(fixture())); await click("필터");
  await act(async () => button("적용").focus()); await key("Tab"); expect(document.activeElement).toBe(button("다음 입력")); expect(dialog()).toBeNull();
  await click("필터"); await act(async () => button("닫기").focus()); await key("Tab", true); expect(document.activeElement).toBe(button("필터")); expect(dialog()).toBeNull();
});
it("permits later controlled dismissal attempts after an owner rejects one", async () => {
  const change = vi.fn(); await act(async () => root.render(fixture({ open: true, onOpenChange: change })));
  await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("주제");
  await key("Escape"); expect(dialog()).not.toBeNull(); await key("Escape"); expect(change).toHaveBeenCalledTimes(2);
  await act(async () => root.render(fixture({ open: false, onOpenChange: change }))); expect(dialog()).toBeNull();
});
it("respects dismissal policy and always accepts an owner's programmatic close", async () => {
  const change = vi.fn(); const props = { open: true, onOpenChange: change, dismissPolicy: { dismissible: false } };
  await act(async () => root.render(fixture(props))); await click("닫기"); await key("Escape"); expect(change).not.toHaveBeenCalled();
  await act(async () => root.render(fixture({ ...props, open: false }))); expect(dialog()).toBeNull();
});
it("keeps nested portal menus inside and sends Escape to the child popover before its Dialog", async () => {
  function Nested() { return <HjmProvider reducedMotion><Dialog defaultOpen title="상위 설정" closeLabel="모달 닫기" trigger={<button>설정</button>}>
    <Popover trigger={<button>세부 설정</button>} title="세부 설정" closeLabel="팝오버 닫기"><Menu label="정렬 방식" trigger={<button>정렬</button>} items={[{ id: "new", label: "최신순" }]} /></Popover>
  </Dialog></HjmProvider>; }
  await act(async () => root.render(<Nested />)); await click("세부 설정"); await click("정렬");
  await expect.poll(() => document.querySelector('[role="menu"]')).not.toBeNull(); expect(dialog()).not.toBeNull();
  await key("Escape"); expect(dialog()).not.toBeNull(); expect(document.querySelector('[role="menu"]')).toBeNull();
  await key("Escape"); expect(dialog()).toBeNull(); expect(document.querySelector('[data-hjm-modal-content]')).not.toBeNull();
});
it("uses an explicit initial focus target and prevents an aria-disabled trigger from opening", async () => {
  function Content() { const second = useRef<HTMLInputElement>(null); const [disabled, setDisabled] = useState(true); return <HjmProvider reducedMotion>
    <Popover title="세부 입력" closeLabel="닫기" initialFocusRef={second} trigger={<button aria-disabled={disabled}>열기</button>}><input aria-label="첫째" /><input ref={second} aria-label="둘째" /></Popover><button onClick={() => setDisabled(false)}>사용</button></HjmProvider>; }
  await act(async () => root.render(<Content />)); await click("열기"); expect(dialog()).toBeNull(); await click("사용"); await click("열기");
  await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("둘째");
});
it.each(["ltr", "rtl"] as const)("keeps long content inside 320px at 2x text in %s with side placement fallback", async (direction) => {
  await page.viewport(320, 640);
  await act(async () => root.render(<HjmProvider reducedMotion direction={direction} textScale={2}><div style={{ paddingInlineStart: 120 }}><Popover defaultOpen title="아주 길게 입력한 설정 제목" closeLabel="닫기" descriptor={{ placement: "start" }} trigger={<button>설정</button>}><p>{"긴 문장을 반복해서 읽어봅니다. ".repeat(40)}</p><button>확인</button></Popover></div></HjmProvider>));
  await expect.poll(() => dialog()?.style.visibility).toBe("visible");
  const rect = dialog()!.getBoundingClientRect(); expect(rect.left).toBeGreaterThanOrEqual(0); expect(rect.right).toBeLessThanOrEqual(320); expect(rect.bottom).toBeLessThanOrEqual(640);
  expect(["top", "bottom"]).toContain(dialog()!.dataset.placement); expect(dialog()!.scrollHeight).toBeGreaterThan(dialog()!.clientHeight);
});
it("makes an exiting surface immediately inert and removes it after the exit animation", async () => {
  await act(async () => root.render(<HjmProvider reducedMotion={false}><Popover defaultOpen title="정리" closeLabel="닫기" trigger={<button>열기</button>}>{({ close }) => <button onClick={close}>완료</button>}</Popover></HjmProvider>));
  await expect.poll(() => dialog()?.style.visibility).toBe("visible"); const surface = dialog()!;
  const exited = new Promise<void>((resolve) => surface.addEventListener("animationend", (event) => { if (event.animationName === "hjm-popover-out") resolve(); }));
  await click("완료");
  expect(surface.inert).toBe(true); expect(surface.getAttribute("aria-hidden")).toBe("true"); await act(async () => { await exited; }); expect(surface.isConnected).toBe(false);
});
it("ends a controlled child session when its parent closes", async () => {
  const changes = vi.fn();
  function Nested() { const [parent, setParent] = useState(true); const [child, setChild] = useState(false); return <HjmProvider reducedMotion><Popover open={parent} onOpenChange={setParent} title="부모" closeLabel="부모 닫기" trigger={<button>부모 열기</button>}>
    <Popover open={child} onOpenChange={(next, details) => { changes(next, details); setChild(next); }} title="자식" closeLabel="자식 닫기" trigger={<button>자식 열기</button>}><input aria-label="자식 입력" /></Popover><button onClick={() => setParent(false)}>전체 닫기</button>
  </Popover></HjmProvider>; }
  await act(async () => root.render(<Nested />)); await click("자식 열기"); await expect.poll(() => document.querySelectorAll('[data-hjm-popover-content][data-state="open"]').length).toBe(2);
  await click("전체 닫기"); expect(changes).toHaveBeenCalledWith(false, { reason: "programmatic" }); await click("부모 열기");
  expect(document.querySelectorAll('[data-hjm-popover-content][data-state="open"]')).toHaveLength(1);
});
// React delivers onPointerEnter/Leave from delegated pointerover/pointerout, so
// the test must speak that pair — a bare pointerenter never reaches the handler.
const over = (node: Element, pointerType = "mouse") => act(async () => node.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType, relatedTarget: document.body })));
const out = (node: Element, pointerType = "mouse") => act(async () => node.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType, relatedTarget: document.body })));
// The delay elapses inside act so the timer's state update is flushed here.
const settle = (ms: number) => act(async () => { await new Promise((resolve) => setTimeout(resolve, ms)); });

it("opens on hover only after the delay and survives the trip to the panel", async () => {
  await act(async () => root.render(<HjmProvider reducedMotion>
    <Popover trigger={<button>요약</button>} title="이번 주 요약" closeLabel="닫기" openOn="hover"><p>7일 기록</p></Popover>
  </HjmProvider>));
  const trigger = button("요약");
  await over(trigger);
  // A pass-through must not flash the panel; the open delay is what prevents it.
  expect(dialog()).toBeNull();
  await settle(popoverHoverDelay.open + 50);
  const panel = dialog()!;
  expect(panel).not.toBeNull();
  await out(trigger);
  // Entering the panel within the close delay keeps it open — otherwise the gap
  // between trigger and panel would be impossible to cross.
  await over(panel);
  await settle(popoverHoverDelay.close + 50);
  expect(dialog()).not.toBeNull();
  await out(panel);
  await settle(popoverHoverDelay.close + 50);
  expect(dialog()).toBeNull();
});

it("keeps the click path when hover is configured, because touch has no hover", async () => {
  await act(async () => root.render(<HjmProvider reducedMotion>
    <Popover trigger={<button>요약</button>} title="이번 주 요약" closeLabel="닫기" openOn="hover"><p>7일 기록</p></Popover>
  </HjmProvider>));
  const trigger = button("요약");
  await over(trigger, "touch");
  expect(dialog()).toBeNull();
  await click("요약");
  expect(dialog()).not.toBeNull();
});
