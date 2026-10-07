import { createRef } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Platform, TextInput } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider, PasswordField, SearchField, TextArea } from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const originalOS = Platform.OS;
const testPlatform = Platform as { OS: string };
afterEach(() => { testPlatform.OS = originalOS; vi.restoreAllMocks(); });

// 2026-10-07 user scope: OS maximum font size is excluded; preserve this historical fixture without running it.
it.skip("refreshes iOS attributed draft text across scales while preserving value, focus, selection and forwarded ref", () => {
  testPlatform.OS = "ios";
  const ref = createRef<TextInput>();
  const onValueChange = vi.fn();
  let scale = 1;
  let renderer!: ReactTestRenderer;
  const tree = () => <HjmNativeProvider theme="light" reducedMotion textScale={scale}><TextArea ref={ref} accessibilityLabel="Idea" value="saved draft" onValueChange={onValueChange} minVisibleLines={3} /></HjmNativeProvider>;
  act(() => { renderer = create(tree(), { createNodeMock: () => ({ focus: vi.fn(), isFocused: () => true, setNativeProps: vi.fn() }) }); });
  const original = ref.current;
  act(() => {
    renderer.root.findByType(TextInput).props.onFocus({});
    renderer.root.findByType(TextInput).props.onSelectionChange?.({ nativeEvent: { selection: { start: 2, end: 5 } } });
  });
  scale = 3;
  act(() => { renderer.update(tree()); });
  expect(ref.current).not.toBe(original);
  expect(renderer.root.findByType(TextInput).props.value).toBe("saved draft");
  expect(ref.current?.focus).toHaveBeenCalledOnce();
  expect(ref.current?.setNativeProps).toHaveBeenCalledWith({ selection: { start: 2, end: 5 } });
  expect(onValueChange).not.toHaveBeenCalled();
  const enlarged = ref.current;
  scale = 1;
  act(() => { renderer.update(tree()); });
  expect(ref.current).not.toBe(enlarged);
  expect(renderer.root.findByType(TextInput).props.value).toBe("saved draft");
  expect(onValueChange).not.toHaveBeenCalled();
  act(() => { renderer.unmount(); });
});

// 2026-10-07 user scope: OS maximum font size is excluded; preserve this historical fixture without running it.
it.skip("retains the Android editor and unchanged-scale iOS editor", () => {
  for (const os of ["android", "ios"] as const) {
    testPlatform.OS = os;
    const ref = createRef<TextInput>();
    let scale = 1;
    let renderer!: ReactTestRenderer;
    const tree = () => <HjmNativeProvider theme="light" reducedMotion textScale={scale}><TextArea ref={ref} accessibilityLabel="Idea" defaultValue="draft" /></HjmNativeProvider>;
    act(() => { renderer = create(tree(), { createNodeMock: () => ({ isFocused: () => false }) }); });
    const original = ref.current;
    act(() => { renderer.update(tree()); });
    expect(ref.current).toBe(original);
    if (os === "android") {
      scale = 3;
      act(() => { renderer.update(tree()); });
      expect(ref.current).toBe(original);
    }
    act(() => { renderer.unmount(); });
  }
});

it("attaches product callback refs once instead of re-attaching on every render", () => {
  testPlatform.OS = "ios";
  const fields = [
    (ref: (node: TextInput | null) => void, value: string) => <TextArea ref={ref} accessibilityLabel="Idea" value={value} onValueChange={() => {}} minVisibleLines={3} />,
    (ref: (node: TextInput | null) => void, value: string) => <SearchField ref={ref} label="검색" clearLabel="지우기" busyLabel="검색 중" value={value} onValueChange={() => {}} />,
    (ref: (node: TextInput | null) => void, value: string) => <PasswordField ref={ref} label="비밀번호" autofillHint="current" revealLabel="보기" concealLabel="숨기기" value={value} onValueChange={() => {}} />,
  ];
  for (const field of fields) {
    const ref = vi.fn();
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<HjmNativeProvider theme="light" reducedMotion>{field(ref, "a")}</HjmNativeProvider>, { createNodeMock: () => ({ focus: vi.fn(), isFocused: () => false }) }); });
    act(() => tree.update(<HjmNativeProvider theme="light" reducedMotion>{field(ref, "ab")}</HjmNativeProvider>));
    act(() => tree.update(<HjmNativeProvider theme="light" reducedMotion>{field(ref, "abc")}</HjmNativeProvider>));
    expect(ref.mock.calls.filter(([node]) => node === null)).toHaveLength(0);
    expect(ref).toHaveBeenCalledOnce();
    act(() => tree.unmount());
  }
});
