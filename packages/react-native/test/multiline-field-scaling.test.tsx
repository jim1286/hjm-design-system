import { createRef } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Platform, TextInput } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider, TextArea } from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const originalOS = Platform.OS;
const testPlatform = Platform as { OS: string };
afterEach(() => { testPlatform.OS = originalOS; vi.restoreAllMocks(); });

it("refreshes iOS attributed draft text across scales while preserving value, focus, selection and forwarded ref", () => {
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

it("retains the Android editor and unchanged-scale iOS editor", () => {
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
