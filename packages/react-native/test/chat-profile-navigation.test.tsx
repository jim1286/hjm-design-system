import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, Text } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { ChatMessage, ChatScreen } from "../src/screens.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
afterEach(() => act(() => tree?.unmount()));
it("exposes the header and first message avatar as named profile controls without duplicate grouped targets", () => {
 const open = vi.fn();
 act(() => { tree = create(<HjmNativeProvider><ChatScreen title="서연" composer={null} avatar={<Text>S</Text>} avatarAction={{label:"서연 프로필",onPress:open}}>
  <ChatMessage direction="incoming" author="민준" timestamp="지금" avatar={<Text>M</Text>} avatarAction={{label:"민준 프로필",onPress:()=>open("minjun")}}>안녕</ChatMessage>
  <ChatMessage direction="incoming" author="민준" timestamp="지금" groupPosition="last" avatar={<Text>M</Text>} avatarAction={{label:"민준 프로필",onPress:open}}>계속</ChatMessage>
 </ChatScreen></HjmNativeProvider>); });
 const controls = tree.root.findAllByType(Pressable).filter(node => String(node.props.accessibilityLabel).endsWith("프로필"));
 expect(controls.map(node=>node.props.accessibilityLabel)).toEqual(["서연 프로필", "민준 프로필"]);
 for (const control of controls) {
  for (let parent=control.parent;parent;parent=parent.parent) {
   expect(parent.props.accessibilityElementsHidden).not.toBe(true);
   expect(parent.props.onMoveShouldSetResponder).toBeUndefined();
   expect(parent.props.importantForAccessibility).not.toBe("no-hide-descendants");
  }
 }
 act(()=>controls[1]!.props.onPress({stopPropagation(){}})); expect(open).toHaveBeenCalledExactlyOnceWith("minjun");
});
