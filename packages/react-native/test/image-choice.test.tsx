import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { FlatList, Text } from "react-native";
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

// 2026-10-18 BurnTok share recipients: names under the faces, inside the same press target, not read twice.
it("shows item labels inside each tile only when asked", () => {
  let tree: ReactTestRenderer;
  const visible = (root: ReactTestRenderer) => root.root.findAll(node => node.props.numberOfLines === 1 && node.props.importantForAccessibility === "no" && typeof node.type !== "string");
  act(() => { tree = create(<HjmNativeProvider><ImageChoiceGroup label="보낼 사람" selectionMode="multiple" value={[]} onValueChange={() => {}} items={items} /></HjmNativeProvider>); });
  expect(visible(tree!)).toHaveLength(0);
  act(() => tree!.update(<HjmNativeProvider><ImageChoiceGroup label="보낼 사람" showItemLabels selectionMode="multiple" value={[]} onValueChange={() => {}} items={items} /></HjmNativeProvider>));
  const [first] = tiles(tree!);
  expect(first!.props.accessibilityLabel).toBe("웃는 얼굴");
  expect(first!.findAll(node => node.props.numberOfLines === 1 && node.props.children === "웃는 얼굴").length).toBeGreaterThan(0);
  act(() => tree!.unmount());
});

// 2026-10-18 BurnTok share/creation starters: a status line read as the hint, and two-line labels.
it("shows a description line as the tile hint and wraps labels to the requested lines", () => {
  let tree: ReactTestRenderer;
  const described = [{ id: "a", label: "서연", description: "보냄", image: <Text>A</Text> }, { id: "b", label: "민준", image: <Text>B</Text> }];
  act(() => { tree = create(<HjmNativeProvider><ImageChoiceGroup label="보낼 사람" showItemLabels itemLabelLines={2} selectionMode="multiple" value={[]} onValueChange={() => {}} items={described} /></HjmNativeProvider>); });
  const [first, second] = tiles(tree!);
  expect(first!.props.accessibilityHint).toBe("보냄");
  expect(second!.props.accessibilityHint).toBeUndefined();
  expect(first!.findAll(node => node.props.numberOfLines === 2 && node.props.children === "서연").length).toBeGreaterThan(0);
  expect(first!.findAll(node => node.props.numberOfLines === 1 && node.props.children === "보냄" && node.props.importantForAccessibility === "no").length).toBeGreaterThan(0);
  act(() => tree!.unmount());
  expect(() => act(() => { create(<HjmNativeProvider><ImageChoiceGroup label="x" itemLabelLines={3 as 2} selectionMode="single" value={null} onValueChange={() => {}} items={items} /></HjmNativeProvider>); })).toThrow(RangeError);
});

// 2026-10-18 BurnTok share sheet: long recipient lists recycle rows in a FlatList that stays the named group.
it("virtualizes rows of tiles once the width is known and keeps selection working", () => {
  const change = vi.fn();
  const people = Array.from({ length: 200 }, (_, index) => ({ id: `p${index}`, label: `친구 ${index}`, image: <Text>{index}</Text> }));
  let tree: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ImageChoiceGroup label="보낼 사람" virtualized={{ height: 300 }} selectionMode="multiple" value={["p1"]} onValueChange={change} items={people} /></HjmNativeProvider>); });
  expect(tree!.root.findAllByType(FlatList)).toHaveLength(0);
  const slot = tree!.root.find(node => typeof node.props.onLayout === "function" && node.props.style?.height === 300);
  // 400 wide: tiles of 80 with 8 gaps → 4 per row, 50 rows.
  act(() => slot.props.onLayout({ nativeEvent: { layout: { width: 400, height: 300, x: 0, y: 0 } } }));
  const list = tree!.root.findByType(FlatList);
  expect(list.props.data).toHaveLength(50);
  expect(list.props.accessibilityRole).toBe("list");
  expect(list.props.accessibilityLabel).toBe("보낼 사람");
  expect(list.props.getItemLayout(null, 2).offset).toBe(list.props.getItemLayout(null, 1).length * 2);
  // The test renderer's FlatList mock draws every row; recycling is React Native's. The window is declared up front:
  // 300 tall / 88 stride (80 tile + 8 gap, no captions) → 4 rows + 3 overscan.
  expect(list.props.getItemLayout(null, 0).length).toBe(88);
  expect(list.props.initialNumToRender).toBe(7);
  const mounted = tiles(tree!);
  expect(mounted[1]!.props.accessibilityState).toEqual({ checked: true, disabled: false });
  act(() => mounted[0]!.props.onPress());
  expect(change).toHaveBeenCalledExactlyOnceWith(["p1", "p0"]);
  act(() => tree!.unmount());
});
