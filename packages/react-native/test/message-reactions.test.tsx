import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Modal, Pressable, ScrollView } from "react-native";
import { expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { MessageReactions } from "../src/internal/message-reactions.js";
import { Text } from "../src/primitives.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("dismisses from the scrollable menu's empty area without choosing a reaction or action", () => {
  const change = vi.fn();
  const edit = vi.fn();
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><MessageReactions label="반응" closeLabel="닫기" options={[{ id: "heart", emoji: "❤️", label: "좋아요" }]} value={null} onValueChange={change} menuActions={[{ id: "edit", label: "수정", onPress: edit }]}><Text>메시지</Text></MessageReactions></HjmNativeProvider>); });
  act(() => tree.root.findAllByType(Pressable).find(node => node.props.onLongPress)!.props.onLongPress({ nativeEvent: { pageY: 250 } }));
  expect(tree.root.findByType(Modal).props.visible).toBe(true);
  const scroll = tree.root.findByType(ScrollView);
  const emptyArea = scroll.findAllByType(Pressable).find(node => node.props.accessible === false)!;
  act(() => emptyArea.props.onPress());
  expect(tree.root.findByType(Modal).props.visible).toBe(false);
  expect(change).not.toHaveBeenCalled();
  act(() => tree.root.findByType(Modal).props.onDismiss());
  expect(edit).not.toHaveBeenCalled();
  act(() => tree.unmount());
});
