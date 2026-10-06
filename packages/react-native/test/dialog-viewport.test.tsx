import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Pressable, ScrollView } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { spacing } from "@hjmds/design-contracts/foundations";
import { AlertDialog, Dialog } from "../src/overlays.js";
import { HjmNativeProvider } from "../src/provider.js";
import { __setWindowDimensions } from "./react-native.mock.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined;
const title = "지금까지의 대화를 기획으로 정리할까요?";
const description = "현재 9998회 남았어요. 여기서 1회를 사용해요.";

afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  __setWindowDimensions({ width: 800, height: 600, scale: 2, fontScale: 1 });
  vi.restoreAllMocks();
});

describe.each(["dialog", "alertdialog"] as const)("%s constrained viewport", (role) => {
  it("keeps full copy scrollable within the safe window while both actions remain outside the copy scroll", () => {
    __setWindowDimensions({ width: 320, height: 568, scale: 3, fontScale: 3 });
    const onOpenChange = vi.fn();
    act(() => {
      renderer = create(
        <HjmNativeProvider reducedMotion textScale={3} safeAreaInsets={{ top: 59, bottom: 34, left: 0, right: 0 }}>
          {role === "dialog" ? (
            <Dialog open title={title} description={description} closeLabel="닫기" onOpenChange={onOpenChange}
              primaryAction={{ label: "정리하기", onPress: vi.fn() }} secondaryAction={{ label: "취소", onPress: vi.fn() }} />
          ) : (
            <AlertDialog open onOpenChange={onOpenChange} request={{ mode: "confirm", title, description,
              confirmLabel: "정리하기", cancelLabel: "취소" }} />
          )}
        </HjmNativeProvider>,
        { createNodeMock: () => ({}) },
      );
    });
    const boundary = renderer!.root.find((node) => node.props.role === role);
    expect(Object.assign({}, ...boundary.props.style)).toMatchObject({ maxHeight: "100%", flexShrink: 1 });
    const positioner = renderer!.root.findByType(Animated.View);
    expect(positioner.props.style).toMatchObject({
      paddingTop: 59 + spacing.md, paddingBottom: 34 + spacing.md,
    });
    const body = boundary.findByType(ScrollView);
    expect(body.props.style).toMatchObject({ flexGrow: 0, flexShrink: 1 });
    expect(body.props.keyboardShouldPersistTaps).toBe("handled");
    const textChildren = body.findAll((node) => node.props.children === title || node.props.children === description);
    expect(textChildren.length).toBeGreaterThanOrEqual(2);
    expect(textChildren.every((node) => node.props.numberOfLines === undefined)).toBe(true);
    expect(body.findAllByType(Pressable).some((node) => ["정리하기", "취소"].includes(node.props.accessibilityLabel))).toBe(false);
    const cancel = boundary.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === "취소")!;
    act(() => cancel.props.onPress());
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, { reason: role === "dialog" ? "close-action" : "cancel-action" });
  });
});
