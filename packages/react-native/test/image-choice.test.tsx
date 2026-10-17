import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text } from "react-native";
import { expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { ImageChoiceGroup } from "../src/image-choice.js";

// 2026-10-16: picking by picture is a real control, not ghost Buttons with `selected`.
// This proof file is listed by test/executed-scenarios.json and registered by evidence.ts for native-actions.
// componentId: "image-choice-group"
const items = [{ id: "a", label: "웃는 얼굴", image: <Text>A</Text> }, { id: "b", label: "윙크", image: <Text>B</Text> }];
const tiles = (tree: ReactTestRenderer) => {
  const seen = new Set<string>();
  return tree.root.findAll(node => typeof node.props.onPress === "function" && (node.props.accessibilityRole === "radio" || node.props.accessibilityRole === "checkbox"))
    .filter(node => !seen.has(node.props.accessibilityLabel) && !!seen.add(node.props.accessibilityLabel));
};

it("single mode exposes radios and reports the pressed id", () => {
  const change = vi.fn();
  let tree: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ImageChoiceGroup label="얼굴" selectionMode="single" value="a" onValueChange={change} items={items} /></HjmNativeProvider>); });
  const [first, second] = tiles(tree!);
  expect(first!.props.accessibilityRole).toBe("radio");
  expect(first!.props.accessibilityState).toEqual({ checked: true, disabled: false });
  act(() => second!.props.onPress());
  expect(change).toHaveBeenCalledExactlyOnceWith("b");
  act(() => tree!.unmount());
});

it("multiple mode toggles membership and rejects unnamed items", () => {
  const change = vi.fn();
  let tree: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ImageChoiceGroup label="사진" selectionMode="multiple" value={["a"]} onValueChange={change} items={items} /></HjmNativeProvider>); });
  const [first, second] = tiles(tree!);
  expect(first!.props.accessibilityRole).toBe("checkbox");
  act(() => first!.props.onPress());
  expect(change).toHaveBeenLastCalledWith([]);
  act(() => second!.props.onPress());
  expect(change).toHaveBeenLastCalledWith(["a", "b"]);
  act(() => tree!.unmount());
  expect(() => act(() => { create(<HjmNativeProvider><ImageChoiceGroup label="사진" selectionMode="multiple" value={[]} onValueChange={change} items={[{ id: "x", label: " ", image: null }]} /></HjmNativeProvider>); })).toThrow(TypeError);
});
