import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { StyleSheet, Text, View } from "react-native";
import { afterEach, expect, it } from "vitest";
import { avatarRecipe } from "@hjmds/design-contracts/recipes";
import { Avatar } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
const mount = (node: React.ReactNode) => { act(() => { tree = create(<HjmNativeProvider>{node}</HjmNativeProvider>); }); return tree!; };
const frameOf = (t: ReactTestRenderer) => t.root.findAll(n => n.type === View && StyleSheet.flatten(n.props.style)?.overflow === "hidden")[0]!;

it("sizes from the named steps, keeps numeric points for existing callers and accepts 22", () => {
  for (const [step, points] of Object.entries(avatarRecipe.sizes)) {
    const t = mount(<Avatar decorative name="Kim" size={step as keyof typeof avatarRecipe.sizes} />);
    expect(StyleSheet.flatten(frameOf(t).props.style)).toMatchObject({ width: points, height: points });
  }
  expect(StyleSheet.flatten(frameOf(mount(<Avatar decorative name="Kim" size={22} />)).props.style).width).toBe(22);
  expect(StyleSheet.flatten(frameOf(mount(<Avatar decorative name="Kim" />)).props.style).width).toBe(44);
  expect(() => mount(<Avatar decorative name="Kim" size={21} />)).toThrow(RangeError);
});

it("draws a decorative avatar without a name as a hidden frame", () => {
  const t = mount(<Avatar decorative size="xsmall" />);
  const root = t.root.findAll(n => n.type === View)[0]!;
  expect(root.props.accessible).toBe(false);
  expect(t.root.findAllByType(Text)).toHaveLength(0);
  expect(() => mount(<Avatar accessibilityLabel="이름" name="  " />)).toThrow(TypeError);
});

it("applies the rounded shape and the recipe frames", () => {
  const rounded = StyleSheet.flatten(frameOf(mount(<Avatar decorative name="Kim" shape="rounded" />)).props.style);
  expect(rounded.borderRadius).toBeLessThan(44 / 2);
  expect(StyleSheet.flatten(frameOf(mount(<Avatar decorative name="Kim" />)).props.style).borderWidth).toBe(1);
  const none = StyleSheet.flatten(frameOf(mount(<Avatar decorative name="Kim" frame="none" />)).props.style);
  expect(none).toMatchObject({ borderWidth: 0, backgroundColor: "transparent" });
  expect(StyleSheet.flatten(frameOf(mount(<Avatar decorative name="Kim" frame="surface" />)).props.style).borderWidth).toBe(0);
});

it("places the accessory on the requested corner outside the clipping frame", () => {
  const t = mount(<Avatar accessibilityLabel="Kim" name="Kim" accessory={<View testID="team" />} accessoryPlacement="top-end" />);
  const mark = t.root.findByProps({ testID: "team" });
  const holder = StyleSheet.flatten(mark.parent!.props.style);
  expect(holder).toMatchObject({ position: "absolute", top: avatarRecipe.accessory.offset, end: avatarRecipe.accessory.offset });
  expect(frameOf(t).findAllByProps({ testID: "team" })).toHaveLength(0);
  const bottom = mount(<Avatar decorative name="Kim" accessory={<View testID="team" />} />);
  expect(StyleSheet.flatten(bottom.root.findByProps({ testID: "team" }).parent!.props.style).bottom).toBe(avatarRecipe.accessory.offset);
});
