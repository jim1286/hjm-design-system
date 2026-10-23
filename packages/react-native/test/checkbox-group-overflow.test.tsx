import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { afterEach, expect, it } from "vitest";
import { selectionGroupRecipe } from "@hjmds/design-contracts/recipes";
import { CheckboxGroup } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });

const teams = ["LG", "두산", "KT", "NC", "SSG", "롯데"].map(label => ({ id: label, label }));
const layout = (x: number, width: number) => ({ nativeEvent: { layout: { x, y: 0, width, height: 36 } } });

it("keeps multi-select chips on one inset scrolling line and reveals a focused chip", () => {
  const scrolls: number[] = [];
  act(() => { tree = create(<HjmNativeProvider>
    <CheckboxGroup label="팀" presentation="chips" size="small" overflow="scroll" items={teams} defaultValue={new Set(["KT"])} />
  </HjmNativeProvider>, { createNodeMock: () => ({ scrollTo: ({ x }: { x: number }) => scrolls.push(x) }) }); });
  const inset = selectionGroupRecipe.overflow.scrollInset;
  const rail = tree!.root.findByType(ScrollView);
  expect(rail.props.horizontal).toBe(true);
  expect(StyleSheet.flatten(rail.props.contentContainerStyle).padding).toBe(inset);
  expect(StyleSheet.flatten(rail.props.style).margin).toBe(-inset);
  const row = rail.findAllByType(View).find(node => StyleSheet.flatten(node.props.style)?.flexWrap === "nowrap")!;
  expect(StyleSheet.flatten(row.props.style).flexDirection).toBe("row");

  const chips = tree!.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "checkbox");
  expect(chips).toHaveLength(teams.length);
  act(() => rail.props.onLayout(layout(0, 200)));
  chips.forEach((chip, index) => act(() => chip.props.onLayout(layout(index * 68, 60))));
  // Last chip: content start 340 + inset, end + inset meets the 200 viewport end.
  act(() => chips.at(-1)!.props.onFocus());
  expect(scrolls.at(-1)).toBe(340 + inset + 60 + inset - 200);
  act(() => rail.props.onScroll({ nativeEvent: { contentOffset: { x: scrolls.at(-1)! } } }));
  act(() => chips[0]!.props.onFocus());
  expect(scrolls.at(-1)).toBe(0);
  act(() => chips[1]!.props.onPress());
  expect(chips[1]!.props.accessibilityState.checked).toBe(true);
});

it("wraps by default and rejects scroll outside chips", () => {
  act(() => { tree = create(<HjmNativeProvider><CheckboxGroup label="팀" presentation="chips" items={teams} /></HjmNativeProvider>); });
  expect(tree!.root.findAllByType(ScrollView)).toHaveLength(0);
  act(() => tree!.unmount()); tree = undefined;
  expect(() => act(() => { tree = create(<HjmNativeProvider><CheckboxGroup label="팀" overflow="scroll" items={teams} /></HjmNativeProvider>); })).toThrow(TypeError);
});
