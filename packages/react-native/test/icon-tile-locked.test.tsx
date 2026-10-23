import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, StyleSheet, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { iconTileRecipe } from "@hjmds/design-contracts/screen-patterns";
import { IconTile } from "../src/screens.js";
import { Text } from "../src/primitives.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
const mount = (node: React.ReactNode) => { act(() => { tree = create(<HjmNativeProvider>{node}</HjmNativeProvider>); }); return tree!; };

it("keeps a locked tile pressable, dims the frame and label, and names the lock", () => {
  const activate = vi.fn();
  const t = mount(<IconTile label="날씨" icon={<Text>☀</Text>} onActivate={activate} locked lockedLabel="로그인 필요" accessory={<View testID="lock" />} />);
  const pressable = t.root.findByType(Pressable);
  expect(pressable.props.disabled).toBe(false);
  expect(pressable.props.accessibilityLabel).toBe("날씨, 로그인 필요");
  act(() => pressable.props.onPress());
  expect(activate).toHaveBeenCalledTimes(1);
  const dimmed = t.root.findAll(n => n.type === View && StyleSheet.flatten(n.props.style)?.opacity === iconTileRecipe.locked.opacity);
  expect(dimmed.length).toBeGreaterThan(0);
  expect(dimmed.some(n => n.findAllByProps({ testID: "lock" }).length > 0)).toBe(false);
  const holder = StyleSheet.flatten(t.root.findByProps({ testID: "hjm-icon-tile-accessory" }).props.style);
  expect(holder).toMatchObject({ position: "absolute", top: -iconTileRecipe.accessory.offset, end: -iconTileRecipe.accessory.offset });
  const overlay = StyleSheet.flatten(t.root.findByProps({ testID: "hjm-icon-tile-accessory" }).parent!.props.style);
  expect(overlay).toMatchObject({ width: iconTileRecipe.iconSize, height: iconTileRecipe.iconSize, marginLeft: -iconTileRecipe.iconSize / 2 });
});

it("places a bottom-end accessory and rejects a lock without onActivate or a reason", () => {
  const t = mount(<IconTile label="도구" icon={<Text>A</Text>} accessory={<View />} accessoryPlacement="bottom-end" />);
  expect(StyleSheet.flatten(t.root.findByProps({ testID: "hjm-icon-tile-accessory" }).props.style).bottom).toBe(-iconTileRecipe.accessory.offset);
  expect(() => mount(<IconTile label="x" icon={<Text>x</Text>} onActivate={() => {}} locked />)).toThrow(TypeError);
  expect(() => mount(<IconTile label="x" icon={<Text>x</Text>} locked lockedLabel="잠김" />)).toThrow(TypeError);
});
