// 2026-10-18 "input이 있는 화면에 진입하면 포커스되도록, 웹앱 둘 다": entry focus is owned by the screen/overlay scope.
import { act, createRef, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { TextField, TextArea } from "../src/forms.js";
import { ChatScreen, ScreenLayout } from "../src/screens.js";
import { EditorScreen, SearchScreen } from "../src/screen-flows.js";
import { Dialog, Sheet } from "../src/overlays.js";
import { AuthScreenLayout } from "../src/auth-screen.js";
import "../src/styles.css";

let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); host.style.height = "720px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); (document.activeElement as HTMLElement | null)?.blur?.(); });
const render = (node: ReactNode) => act(async () => root.render(<HjmProvider>{node}</HjmProvider>));
const active = () => (document.activeElement as HTMLElement | null)?.getAttribute("aria-label") ?? document.activeElement?.id ?? null;

it("focuses a page input by default and prefers the marked, else first enabled field", async () => {
  await render(<ScreenLayout title="설정"><TextField aria-label="이름" /></ScreenLayout>);
  expect(active()).toBe("이름");
  await act(async () => root.unmount()); root = createRoot(host);
  await render(<ScreenLayout title="프로필" initialFocus="first-input"><TextField aria-label="이름" disabled /><TextField aria-label="소개" readOnly /><TextField aria-label="별명" /><TextField aria-label="메모" initialFocusTarget /></ScreenLayout>);
  expect(active()).toBe("메모");
  await act(async () => root.unmount()); root = createRoot(host);
  await render(<ScreenLayout title="프로필" initialFocus="first-input"><TextField aria-label="이름" disabled /><TextField aria-label="별명" /></ScreenLayout>);
  expect(active()).toBe("별명");
});
it("does not steal focus from a field the user is in or from under an open modal", async () => {
  const outside = document.createElement("input"); outside.setAttribute("aria-label", "바깥"); document.body.append(outside); outside.focus();
  await render(<ScreenLayout title="프로필" initialFocus="first-input"><TextField aria-label="별명" /></ScreenLayout>);
  expect(active()).toBe("바깥"); outside.remove();
  await act(async () => root.unmount()); root = createRoot(host);
  const modal = document.createElement("div"); modal.setAttribute("aria-modal", "true"); document.body.append(modal);
  await render(<ScreenLayout title="프로필" initialFocus="first-input"><TextField aria-label="별명" /></ScreenLayout>);
  expect(active()).not.toBe("별명"); modal.remove();
});
it("focuses upper search/editor inputs but leaves the bottom chat composer alone", async () => {
  await render(<SearchScreen title="검색" query="" queryLabel="검색어" queryClearLabel="지우기" onQueryChange={() => {}} onSearch={() => {}}>{null}</SearchScreen>);
  expect(document.activeElement?.tagName).toBe("INPUT");
  await act(async () => root.unmount()); root = createRoot(host); (document.activeElement as HTMLElement).blur();
  await render(<EditorScreen title="글쓰기" dirty={false} submit={{ label: "저장", onAction: () => {} }} cancel={{ label: "닫기", onAction: () => {} }}
    discard={{ mode: "confirm", title: "버릴까요", description: "초안", confirmLabel: "버리기", cancelLabel: "유지", fallbackErrorMessage: "실패" }}><TextArea aria-label="본문" /></EditorScreen>);
  expect(active()).toBe("본문");
  await act(async () => root.unmount()); root = createRoot(host); (document.activeElement as HTMLElement).blur();
  await render(<ChatScreen title="대화" composer={<TextArea aria-label="메시지" />}>{null}</ChatScreen>);
  expect(active()).not.toBe("메시지");
});
it("never focuses a bottom sheet input on opening, with one field or several", async () => {
  await render(<Sheet open onOpenChange={() => {}} title="이름 바꾸기" closeLabel="닫기" showClose><TextField aria-label="새 이름" /></Sheet>);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
  expect(active()).not.toBe("새 이름");
  await act(async () => root.unmount()); root = createRoot(host);
  await render(<Sheet open onOpenChange={() => {}} title="이름 바꾸기" closeLabel="닫기" showClose><TextField aria-label="성" /><TextField aria-label="이름" /></Sheet>);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
  expect(document.activeElement?.tagName).not.toBe("INPUT");
});

// 1.28.1 adoption gaps (2026-10-18): the entry window (modal on entry, late fields) and fields revealed after entry.
const settle = (ms = 30) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });
const press = (target: Element) => target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
it("waits under an open HJM dialog and focuses once it closes, ignoring input inside the dialog", async () => {
  const ui = (open: boolean) => <><ScreenLayout title="프로필" initialFocus="first-input"><TextField aria-label="별명" /></ScreenLayout>
    <Dialog open={open} onOpenChange={() => {}} title="약관" closeLabel="닫기" dismissible={false}><button type="button">동의</button></Dialog></>;
  let focusCount = 0;
  host.addEventListener("focusin", event => { if ((event.target as Element).getAttribute("aria-label") === "별명") focusCount++; });
  await render(ui(true)); await settle();
  expect(focusCount).toBe(0);
  press(document.querySelector('[aria-modal="true"] button')!);
  await render(ui(false)); await settle(600);
  expect(active()).toBe("별명");
  expect(focusCount).toBe(1);
});
it("focuses a field that appears after entry data loads, unless the user interacted first", async () => {
  const ui = (ready: boolean) => <ScreenLayout title="계정 삭제" initialFocus="first-input">{ready ? <TextField aria-label="확인 문구" /> : null}</ScreenLayout>;
  await render(ui(false)); await render(ui(true)); await settle();
  expect(active()).toBe("확인 문구");
  await act(async () => root.unmount()); root = createRoot(host); (document.activeElement as HTMLElement).blur();
  await render(ui(false)); press(host); await render(ui(true)); await settle();
  expect(active()).not.toBe("확인 문구");
});
it("does not focus newly revealed page fields after interaction or marked steps in a bottom sheet", async () => {
  const home = (searching: boolean, marked = true) => <ScreenLayout title="도구">{searching ? <TextField aria-label="검색" {...(marked ? { initialFocusTarget: true } : {})} /> : null}</ScreenLayout>;
  await render(home(false)); press(host);
  await render(home(true, false)); await settle();
  expect(active()).not.toBe("검색");
  await render(home(false)); await render(home(true)); await settle();
  expect(active()).not.toBe("검색");
  await act(async () => root.unmount()); root = createRoot(host); (document.activeElement as HTMLElement).blur();
  const sheet = (step: 0 | 1) => <Sheet open onOpenChange={() => {}} title="새 아이디어" closeLabel="닫기" showClose>
    {step === 0 ? <TextField key="title" aria-label="제목" initialFocusTarget /> : <TextField key="seed" aria-label="씨앗" initialFocusTarget />}</Sheet>;
  await render(sheet(0)); await settle();
  expect(active()).not.toBe("제목");
  await render(sheet(1)); await settle();
  expect(active()).not.toBe("씨앗");
});
it("AuthScreenLayout focuses its input on page entry", async () => {
  await render(<AuthScreenLayout hero={null} hasFooter={false} main={<TextField aria-label="닉네임" />} />);
  expect(active()).toBe("닉네임");
  await act(async () => root.unmount()); root = createRoot(host);
  await render(<AuthScreenLayout hero={null} hasFooter={false} initialFocus="first-input" main={<TextField aria-label="닉네임" />} />);
  expect(active()).toBe("닉네임");
});

// 1.31 gap 10 (BurnTok search overlay, 2026-10-18): a modal that wraps the screen is the screen's own layer, not a
// layer above it, so it must not block entry. A modal outside the screen still blocks (covered above).
it("focuses a screen rendered inside a product modal that wraps it", async () => {
  await render(<div role="dialog" aria-modal="true" aria-label="검색"><ScreenLayout title="검색" initialFocus="first-input"><TextField aria-label="검색어" /></ScreenLayout></div>);
  await settle();
  expect(active()).toBe("검색어");
});
it("keeps Dialog focus but blocks a nested screen inside a bottom sheet", async () => {
  await render(<Dialog open onOpenChange={() => {}} title="검색" closeLabel="닫기"><ScreenLayout title="검색" initialFocus="first-input"><TextField aria-label="검색어" /></ScreenLayout></Dialog>);
  await settle();
  expect(active()).toBe("검색어");
  await act(async () => root.unmount()); root = createRoot(host); (document.activeElement as HTMLElement).blur();
  await render(<Sheet open onOpenChange={() => {}} title="검색" closeLabel="닫기" showClose size="full" initialFocus="first-input"><ScreenLayout title="검색" initialFocus="first-input"><TextField aria-label="검색어" /></ScreenLayout></Sheet>);
  await settle();
  expect(active()).not.toBe("검색어");
});

it("blocks explicit input refs and nested footer focus in a bottom sheet, while manual focus still works", async () => {
  const input = createRef<HTMLInputElement>();
  await render(<Sheet open onOpenChange={() => {}} title="작성" closeLabel="닫기" initialFocus="first-input" initialFocusRef={input}
    footer={<ScreenLayout title="작성창" initialFocus="first-input"><TextField ref={input} aria-label="하단 입력" initialFocusTarget /></ScreenLayout>} />);
  await settle();
  expect(active()).not.toBe("하단 입력");
  input.current!.focus();
  expect(active()).toBe("하단 입력");
});

it.each(["click", "contextmenu"])("cancels deferred page focus when a %s arrives before the entry microtask", async event => {
  act(() => root.render(<HjmProvider><ScreenLayout title="대화"><TextField aria-label="메시지" />
    <button type="button" aria-label="반응">반응</button></ScreenLayout></HjmProvider>));
  const control = host.querySelector("button[aria-label='반응']")! as HTMLButtonElement;
  control.focus();
  control.dispatchEvent(new MouseEvent(event, { bubbles: true }));
  await settle();
  expect(active()).toBe("반응");
});

it("excludes marked footer inputs and nested footer screens while retaining upper input focus", async () => {
  await render(<ScreenLayout title="설정" footer={<TextField aria-label="하단" initialFocusTarget />}><TextField aria-label="상단" /></ScreenLayout>);
  expect(active()).toBe("상단");
  await act(async () => root.unmount()); root = createRoot(host);
  await render(<ScreenLayout title="상세" footer={<ScreenLayout title="하단 입력"><TextField aria-label="하단" initialFocusTarget /></ScreenLayout>}>{null}</ScreenLayout>);
  expect(active()).not.toBe("하단");
});
