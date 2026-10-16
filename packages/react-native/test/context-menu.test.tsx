import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Modal, Platform, Pressable, Text } from "react-native";
import { expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { ContextMenu } from "../src/context-menu.js";

// 2026-10-16: canonical long-press menu for conversation rows and comments.
it("adds long-press and an accessibility action to the host and runs the item after dismissal", () => {
  const open = vi.fn(), action = vi.fn();
  const previousOS = Platform.OS; Platform.OS = "ios";
  let tree: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ContextMenu accessibilityLabel="대화 메뉴" onAction={action}
    items={[{ id: "mute", label: "알림 해제" }, { id: "delete", label: "삭제", tone: "danger" }]}>
    <Pressable accessibilityRole="link" accessibilityLabel="서연" onPress={open}><Text>서연</Text></Pressable>
  </ContextMenu></HjmNativeProvider>); });
  const host = tree!.root.findAll(node => node.props.accessibilityLabel === "서연" && typeof node.props.onLongPress === "function")[0]!;
  act(() => host.props.onPress());
  expect(open).toHaveBeenCalledOnce();
  expect(host.props.accessibilityActions).toEqual([{ name: "contextMenu", label: "대화 메뉴" }]);
  act(() => host.props.onLongPress({ nativeEvent: { pageY: 300 } }));
  expect(tree!.root.findByType(Modal).props.visible).toBe(true);
  act(() => tree!.root.findAll(node => node.props.accessibilityLabel === "삭제" && typeof node.props.onPress === "function")[0]!.props.onPress());
  expect(action).not.toHaveBeenCalled();
  act(() => tree!.root.findByType(Modal).props.onDismiss());
  expect(action).toHaveBeenCalledExactlyOnceWith("delete");
  act(() => host.props.onAccessibilityAction({ nativeEvent: { actionName: "contextMenu" } }));
  expect(tree!.root.findByType(Modal).props.visible).toBe(true);
  Platform.OS = previousOS;
  act(() => tree!.unmount());
});
