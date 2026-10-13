import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Dialog } from "@hjmds/react-native/overlays";
import { FloatingActionButton } from "@hjmds/react-native/floating-action-button";
import { ListRow } from "@hjmds/react-native/data-display";
import meta from "../../../showcase/native/src/FloatingActionButton.stories.js";
const Preview = meta.component;
let tree: ReactTestRenderer;
const scrollTo = vi.fn();
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(async () => { vi.useFakeTimers(); scrollTo.mockClear(); await act(async () => { tree = create(<HjmNativeProvider reducedMotion><Preview /></HjmNativeProvider>, { createNodeMock: () => ({ scrollTo }) }); }); });
afterEach(() => { act(() => tree?.unmount()); vi.useRealTimers(); vi.restoreAllMocks(); });
const button = (label: string) => tree.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === label)!;
const press = (label: string) => act(() => button(label).props.onPress());
const field = () => tree.root.findByType(TextInput);
const input = (value: string) => act(() => field().props.onChangeText(value));
const dialog = () => tree.root.findByType(Dialog);
const settle = () => act(async () => { await vi.advanceTimersByTimeAsync(420); });
const notes = () => tree.root.findAllByType(ListRow).map(node => node.props.title);

it("keeps drafts on close, validates input and saves once with a wired FAB return target", async () => {
  const focus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
  press("새 기록"); await settle(); expect(dialog().props.open).toBe(true);
  expect(button("기록 추가").props.accessibilityState.disabled).toBe(true);
  input("   "); expect(button("기록 추가").props.accessibilityState.disabled).toBe(true);
  input("남겨 둔 초안"); focus.mockClear(); press("닫기"); await settle(); expect(dialog().props.open).toBe(false);
  expect(dialog().props.returnFocusRef?.current).toBeTruthy(); expect(focus).toHaveBeenCalled();
  press("새 기록"); await settle(); expect(field().props.value).toBe("남겨 둔 초안");
  input("  저장한 순간  "); const save = button("기록 추가").props.onPress;
  act(() => { save(); save(); }); await settle();
  expect(dialog().props.open).toBe(false); expect(notes().filter(note => note === "저장한 순간")).toHaveLength(1); expect(notes()[0]).toBe("저장한 순간");
  expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: false });
  press("새 기록"); await settle(); expect(field().props.value).toBe(""); expect(button("기록 추가").props.accessibilityState.disabled).toBe(true);
});

it("connects scroll direction and measured clearance without replacing the FAB", () => {
  const fab = tree.root.findByType(FloatingActionButton), opener = button("새 기록");
  const scroll = tree.root.findByType(ScrollView);
  expect(scroll.props.scrollEventThrottle).toBe(16);
  act(() => opener.props.onLayout({ nativeEvent: { layout: { height: 52 } } }));
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBe(84);
  act(() => scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 60 } } }));
  expect(fab.props.descriptor.layoutMode).toBe("collapsed"); expect(button("새 기록")).toBe(opener);
  act(() => scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 40 } } }));
  expect(fab.props.descriptor.layoutMode).toBe("expanded"); expect(button("새 기록")).toBe(opener);
});
