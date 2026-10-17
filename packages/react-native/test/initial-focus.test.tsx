import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { TextField, TextArea } from "../src/inputs.js";
import { ChatScreen, ScreenLayout } from "../src/screens.js";
import { EditorScreen, SearchScreen } from "../src/screen-flows.js";
import { Sheet } from "../src/overlays.js";
import type { ReactNode } from "react";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// 2026-10-18 "input이 있는 화면에 진입하면 포커스되도록": the screen scope focuses one field after the enter interaction.
const focused: string[] = [];
let tree: ReactTestRenderer | undefined;
beforeEach(() => { vi.useFakeTimers(); focused.length = 0; });
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.useRealTimers(); });
function render(node: ReactNode) {
  act(() => { tree = create(<HjmNativeProvider>{node}</HjmNativeProvider>, {
    createNodeMock: element => element.type === "TextInput" ? { focus: () => focused.push(String(element.props.accessibilityLabel)), isFocused: () => false } : {},
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
    discard={{ title: "버릴까요?", description: "초안", confirmLabel: "버리기", cancelLabel: "계속 쓰기", fallbackErrorMessage: "실패" }}><TextArea label="본문" /></EditorScreen>);
  expect(focused).toEqual(["본문"]);
  act(() => tree!.unmount()); tree = undefined; focused.length = 0;
  render(<ChatScreen title="대화" composer={<TextArea label="메시지" />}>{null}</ChatScreen>);
  expect(focused).toEqual([]);
});
it("focuses a sheet's lone text entry after it has entered, and again on reopen", () => {
  const sheet = (open: boolean, fields: ReactNode) => <ScreenLayout title="목록"><Sheet open={open} onOpenChange={() => {}} title="이름 바꾸기" closeLabel="닫기">{fields}</Sheet></ScreenLayout>;
  render(sheet(true, <TextField label="새 이름" />));
  expect(focused).toEqual([]);
  const modal = () => tree!.root.find(node => typeof node.type === "string" && node.type === "Modal");
  act(() => modal().props.onShow?.({})); act(() => { vi.runAllTimers(); });
  expect(focused).toEqual(["새 이름"]);
  act(() => tree!.update(<HjmNativeProvider>{sheet(true, <><TextField label="성" /><TextField label="이름" /></>)}</HjmNativeProvider>));
  act(() => tree!.update(<HjmNativeProvider>{sheet(false, null)}</HjmNativeProvider>)); act(() => { vi.runAllTimers(); });
  act(() => tree!.update(<HjmNativeProvider>{sheet(true, <><TextField label="성" /><TextField label="이름" /></>)}</HjmNativeProvider>));
  act(() => modal().props.onShow?.({})); act(() => { vi.runAllTimers(); });
  expect(focused).toEqual(["새 이름"]);
});
