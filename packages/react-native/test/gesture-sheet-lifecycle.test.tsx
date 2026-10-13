import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { dismissTopGestureSheet, GestureSheet } from "../src/sheet-gesture.js";
vi.mock("@gorhom/bottom-sheet", async () => {
  const { View, TextInput } = await import("react-native");
  return { BottomSheetTextInput: TextInput, BottomSheetModal: View, BottomSheetModalProvider: View,
    BottomSheetScrollView: View, BottomSheetBackdrop: View, BottomSheetHandle: View };
});
vi.mock("react-native-reanimated", () => ({ ReduceMotion: { Always: "always", System: "system" } }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("preserves newest-sheet back ownership when an underlying sheet changes busy state", () => {
  const lower = vi.fn(); const upper = vi.fn();
  const ui = (busy: boolean) => <HjmNativeProvider reducedMotion>
    <GestureSheet open busy={busy} onOpenChange={lower} title="아래" closeLabel="닫기">아래</GestureSheet>
    <GestureSheet open onOpenChange={upper} title="위" closeLabel="닫기">위</GestureSheet>
  </HjmNativeProvider>;
  let tree!: ReturnType<typeof create>;
  try {
    act(() => { tree = create(ui(false)); });
    act(() => tree.update(ui(true)));
    act(() => expect(dismissTopGestureSheet()).toBe(true));
    expect(upper).toHaveBeenCalledWith(false);
    expect(lower).not.toHaveBeenCalled();
  } finally { if (tree) act(() => tree.unmount()); }
  expect(dismissTopGestureSheet()).toBe(false);
});
