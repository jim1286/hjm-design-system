import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { TextField, TextArea } from "../src/inputs.js";
import { ChatScreen, ScreenLayout } from "../src/screens.js";
import { EditorScreen, SearchScreen } from "../src/screen-flows.js";
import { Dialog, Sheet } from "../src/overlays.js";
import { AuthScreenLayout } from "../src/auth-screen.js";
import type { ReactNode } from "react";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// 2026-10-18 "input이 있는 화면에 진입하면 포커스되도록": the screen scope focuses one field after the enter interaction.
const focused: string[] = [];
let tree: ReactTestRenderer | undefined;
beforeEach(() => { vi.useFakeTimers(); focused.length = 0; });
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.useRealTimers(); });
function render(node: ReactNode) {
  act(() => { tree = create(<HjmNativeProvider>{node}</HjmNativeProvider>, {
    createNodeMock: element => element.type === "TextInput" ? { focus: () => focused.push(String((element.props as { accessibilityLabel?: string }).accessibilityLabel)), isFocused: () => false } : {},
  }); });
  act(() => { vi.runAllTimers(); });
}

it("focuses nothing on a generic screen by default", () => {
  render(<ScreenLayout title="설정"><TextField label="이름" /></ScreenLayout>);
  expect(focused).toEqual([]);
});
it("focuses the marked field, else the first enabled one, once per mount", () => {
  render(<ScreenLayout title="프로필" initialFocus="first-input"><TextField label="이름" disabled /><TextField label="소개" /><TextField label="별명" initialFocusTarget /></ScreenLayout>);
  expect(focused).toEqual(["별명"]);
  act(() => tree!.update(<HjmNativeProvider><ScreenLayout title="프로필" initialFocus="first-input"><TextField label="이름" disabled /><TextField label="소개" /><TextField label="별명" initialFocusTarget /></ScreenLayout></HjmNativeProvider>));
  act(() => { vi.runAllTimers(); });
  expect(focused).toEqual(["별명"]);
  act(() => tree!.unmount()); tree = undefined; focused.length = 0;
  render(<ScreenLayout title="프로필" initialFocus="first-input"><TextField label="이름" readOnly /><TextField label="소개" initialFocusTarget={false} /><TextField label="별명" /></ScreenLayout>);
  expect(focused).toEqual(["별명"]);
});
it("defaults on for search and editor screens and off for chat", () => {
  render(<SearchScreen title="검색" query="" queryLabel="검색어" queryClearLabel="지우기" onQueryChange={() => {}} onSearch={() => {}}>{null}</SearchScreen>);
  expect(focused).toEqual(["검색어"]);
  act(() => tree!.unmount()); tree = undefined; focused.length = 0;
  render(<EditorScreen title="글쓰기" dirty={false} submit={{ label: "저장", onAction: () => {} }} cancel={{ label: "닫기", onAction: () => {} }}
    discard={{ mode: "confirm", title: "버릴까요?", description: "초안", confirmLabel: "버리기", cancelLabel: "계속 쓰기", fallbackErrorMessage: "실패" }}><TextArea label="본문" /></EditorScreen>);
  expect(focused).toEqual(["본문"]);
  act(() => tree!.unmount()); tree = undefined; focused.length = 0;
  render(<ChatScreen title="대화" composer={<TextArea label="메시지" />}>{null}</ChatScreen>);
  expect(focused).toEqual([]);
});
it("focuses a sheet's lone text entry after it has entered, and again on reopen", () => {
  const sheet = (open: boolean, fields: ReactNode) => <ScreenLayout title="목록"><Sheet open={open} onOpenChange={() => {}} title="이름 바꾸기" closeLabel="닫기">{fields}</Sheet></ScreenLayout>;
  render(sheet(true, <TextField label="새 이름" />));
  expect(focused).toEqual([]);
  const modal = () => tree!.root.find(node => String(node.type) === "Modal");
  act(() => modal().props.onShow?.({})); act(() => { vi.runAllTimers(); });
  expect(focused).toEqual(["새 이름"]);
  act(() => tree!.update(<HjmNativeProvider>{sheet(true, <><TextField label="성" /><TextField label="이름" /></>)}</HjmNativeProvider>));
  act(() => tree!.update(<HjmNativeProvider>{sheet(false, null)}</HjmNativeProvider>)); act(() => { vi.runAllTimers(); });
  act(() => tree!.update(<HjmNativeProvider>{sheet(true, <><TextField label="성" /><TextField label="이름" /></>)}</HjmNativeProvider>));
  act(() => modal().props.onShow?.({})); act(() => { vi.runAllTimers(); });
  expect(focused).toEqual(["새 이름"]);
});

// 1.28.1 adoption gaps (2026-10-18): the entry window (overlay on entry, late fields) and fields revealed after entry.
// Overlay teardown commits state from a timer, so settle timers until nothing new is scheduled.
const update = (node: ReactNode) => { act(() => tree!.update(<HjmNativeProvider>{node}</HjmNativeProvider>)); for (let i = 0; i < 4; i++) act(() => { vi.runAllTimers(); }); };
const touchables = () => tree!.root.findAll(node => typeof node.type === "string" && typeof node.props.onTouchStart === "function");
it("waits under an open HJM dialog and focuses once it closes, ignoring taps inside the dialog", () => {
  const ui = (open: boolean) => <><ScreenLayout title="프로필" initialFocus="first-input"><TextField label="별명" /></ScreenLayout>
    <Dialog open={open} onOpenChange={() => {}} title="약관" closeLabel="닫기" dismissible={false}>{null}</Dialog></>;
  render(ui(true));
  const modal = tree!.root.find(node => String(node.type) === "Modal");
  act(() => modal.props.onShow?.({})); act(() => { vi.runAllTimers(); });
  expect(focused).toEqual([]);
  // The tap on "agree" happens inside the dialog; it must not end the screen's entry window.
  const inside = touchables().find(node => modal.findAll(child => child === node).length > 0)!;
  act(() => inside.props.onTouchStart()); act(() => { vi.runAllTimers(); });
  update(ui(false));
  expect(focused).toEqual(["별명"]);
});
it("focuses a field that appears after entry data loads, unless the user touched the screen first", () => {
  const ui = (ready: boolean) => <ScreenLayout title="계정 삭제" initialFocus="first-input">{ready ? <TextField label="확인 문구" /> : null}</ScreenLayout>;
  render(ui(false));
  update(ui(true));
  expect(focused).toEqual(["확인 문구"]);
  act(() => tree!.unmount()); tree = undefined; focused.length = 0;
  render(ui(false));
  act(() => touchables()[0]!.props.onTouchStart());
  update(ui(true));
  expect(focused).toEqual([]);
});
it("focuses a marked field revealed after entry in any mode, and each step's marked field in a sheet", () => {
  const home = (searching: boolean, marked = true) => <ScreenLayout title="도구">{searching ? <TextField label="검색" {...(marked ? { initialFocusTarget: true } : {})} /> : null}</ScreenLayout>;
  render(home(false));
  act(() => touchables()[0]!.props.onTouchStart());
  update(home(true, false));
  expect(focused).toEqual([]);
  update(home(false));
  update(home(true));
  expect(focused).toEqual(["검색"]);
  act(() => tree!.unmount()); tree = undefined; focused.length = 0;
  const sheet = (step: 0 | 1) => <ScreenLayout title="아이디어"><Sheet open onOpenChange={() => {}} title="새 아이디어" closeLabel="닫기">
    {step === 0 ? <TextField key="title" label="제목" initialFocusTarget /> : <TextField key="seed" label="씨앗" initialFocusTarget />}</Sheet></ScreenLayout>;
  render(sheet(0));
  act(() => tree!.root.find(node => String(node.type) === "Modal").props.onShow?.({})); act(() => { vi.runAllTimers(); });
  update(sheet(1));
  update(sheet(0));
  expect(focused).toEqual(["제목", "씨앗", "제목"]);
});
it("AuthScreenLayout focuses nothing by default and opts in for a nickname step", () => {
  const auth = (initialFocus?: "first-input") => <AuthScreenLayout hero={null} hasFooter={false} main={<TextField label="닉네임" />} {...(initialFocus ? { initialFocus } : {})} />;
  render(auth());
  expect(focused).toEqual([]);
  act(() => tree!.unmount()); tree = undefined;
  render(auth("first-input"));
  expect(focused).toEqual(["닉네임"]);
});

// 1.31 gap 10 (2026-10-18): a screen rendered inside an overlay enters with that overlay — after its native
// presentation — instead of on mount, the same rule Web applies when the overlay activates.
it("focuses a screen rendered inside a sheet or dialog once the overlay has entered", () => {
  for (const Overlay of [Sheet, Dialog]) {
    render(<Overlay open onOpenChange={() => {}} title="검색" closeLabel="닫기"><ScreenLayout title="검색" initialFocus="first-input"><TextField label="검색어" /></ScreenLayout></Overlay>);
    expect(focused).toEqual([]);
    const modal = tree!.root.find(node => String(node.type) === "Modal");
    act(() => modal.props.onShow?.({})); act(() => { vi.runAllTimers(); });
    expect(focused).toEqual(["검색어"]);
    act(() => tree!.unmount()); tree = undefined; focused.length = 0;
  }
});
