import { createRef } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import type { View } from "react-native";
import { expect, it } from "vitest";
import { BottomCTA, HjmNativeProvider } from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// 2026-10-18 Utilverse display board: Native overlays return focus only to an explicit `returnFocusRef`, so the action
// that opens one must hand out its button host.
it("forwards each action's buttonRef to the pressable host of that button", () => {
  const primary = createRef<View>(), secondary = createRef<View>();
  let tree: ReactTestRenderer;
  act(() => {
    tree = create(<HjmNativeProvider><BottomCTA
      primaryAction={{ label: "시작", accessibilityLabel: "전광판 시작", onPress: () => {}, buttonRef: primary }}
      secondaryAction={{ label: "취소", accessibilityLabel: "취소하기", onPress: () => {}, buttonRef: secondary }} /></HjmNativeProvider>,
    // Host refs are null in the test renderer unless mocked; report which accessible element received the ref.
    { createNodeMock: element => ({ label: (element.props as { accessibilityLabel?: string }).accessibilityLabel }) });
  });
  expect((primary.current as unknown as { label?: string } | null)?.label).toBe("전광판 시작");
  expect((secondary.current as unknown as { label?: string } | null)?.label).toBe("취소하기");
  act(() => tree!.unmount());
});
