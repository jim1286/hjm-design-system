// 2026-10-18 "input이 있는 화면에 진입하면 포커스되도록, 웹앱 둘 다": entry focus is owned by the screen/overlay scope.
import { act, type ReactNode } from "react";
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

it("leaves a generic screen alone and focuses the marked, else first enabled field when asked", async () => {
  await render(<ScreenLayout title="설정"><TextField aria-label="이름" /></ScreenLayout>);
  expect(document.activeElement).toBe(document.body);
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
it("defaults on for search and editor screens and off for chat", async () => {
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
it("focuses a sheet's lone text entry, and keeps the first focusable element with several", async () => {
  await render(<Sheet open onOpenChange={() => {}} title="이름 바꾸기" closeLabel="닫기" showClose><TextField aria-label="새 이름" /></Sheet>);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
  expect(active()).toBe("새 이름");
  await act(async () => root.unmount()); root = createRoot(host);
  await render(<Sheet open onOpenChange={() => {}} title="이름 바꾸기" closeLabel="닫기" showClose><TextField aria-label="성" /><TextField aria-label="이름" /></Sheet>);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
  expect(active()).toBe("닫기");
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
it("focuses a marked field revealed after entry in any mode, and each step's marked field in a sheet", async () => {
  const home = (searching: boolean, marked = true) => <ScreenLayout title="도구">{searching ? <TextField aria-label="검색" {...(marked ? { initialFocusTarget: true } : {})} /> : null}</ScreenLayout>;
  await render(home(false)); press(host);
  await render(home(true, false)); await settle();
  expect(active()).not.toBe("검색");
  await render(home(false)); await render(home(true)); await settle();
  expect(active()).toBe("검색");
  await act(async () => root.unmount()); root = createRoot(host); (document.activeElement as HTMLElement).blur();
  const sheet = (step: 0 | 1) => <Sheet open onOpenChange={() => {}} title="새 아이디어" closeLabel="닫기" showClose>
    {step === 0 ? <TextField key="title" aria-label="제목" initialFocusTarget /> : <TextField key="seed" aria-label="씨앗" initialFocusTarget />}</Sheet>;
  await render(sheet(0)); await settle();
  expect(active()).toBe("제목");
  await render(sheet(1)); await settle();
  expect(active()).toBe("씨앗");
});
it("AuthScreenLayout focuses nothing by default and opts in for a nickname step", async () => {
  await render(<AuthScreenLayout hero={null} hasFooter={false} main={<TextField aria-label="닉네임" />} />);
  expect(active()).not.toBe("닉네임");
  await act(async () => root.unmount()); root = createRoot(host);
  await render(<AuthScreenLayout hero={null} hasFooter={false} initialFocus="first-input" main={<TextField aria-label="닉네임" />} />);
  expect(active()).toBe("닉네임");
});
