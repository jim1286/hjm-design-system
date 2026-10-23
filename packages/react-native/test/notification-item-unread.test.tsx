import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { afterEach, expect, it } from "vitest";
import { NotificationItem } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
const mount = (read: boolean, unreadLabel?: string) => { act(() => { tree = create(<HjmNativeProvider>
  <NotificationItem read={read} statusLabel="댓글" timestamp="3분 전" title="새 댓글" onPress={() => {}} {...(unreadLabel === undefined ? {} : { unreadLabel })} />
</HjmNativeProvider>); }); return tree!; };

it("draws the named unread dot and announces it with the status line in the row name", () => {
  const t = mount(false, "읽지 않음");
  expect(t.root.findByProps({ testID: "hjm-unread-dot" }).props.accessibilityLabel).toBe("읽지 않음");
  expect(t.root.findByType(Pressable).props.accessibilityLabel).toBe("새 댓글, 읽지 않음, 댓글 · 3분 전");
  const read = mount(true, "읽지 않음");
  expect(read.root.findAllByProps({ testID: "hjm-unread-dot" })).toHaveLength(0);
  expect(read.root.findByType(Pressable).props.accessibilityLabel).toBe("새 댓글, 댓글 · 3분 전");
  expect(mount(false).root.findAllByProps({ testID: "hjm-unread-dot" })).toHaveLength(0);
});
