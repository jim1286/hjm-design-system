import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ScrollView, StyleSheet, Text } from "react-native";
import { afterEach, expect, it } from "vitest";
import { collectionRailRecipe } from "@hjmds/design-contracts/collection-rail";
import { spacing } from "@hjmds/design-contracts/foundations";
import { CollectionRail } from "../src/collection-rail.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined;
afterEach(() => { if (renderer) act(() => renderer!.unmount()); renderer = undefined; });

it("sizes chip items to the chip step with the xs gap", () => {
  const items = Array.from({ length: 6 }, (_, index) => ({ id: `g${index}`, label: `경기 ${index}` }));
  act(() => { renderer = create(<HjmNativeProvider reducedMotion>
    <CollectionRail density="chip" showNavigation={false} label="오늘 경기" items={items} labels={{ previous: "이전", next: "다음", navigation: "경기 탐색" }}
      renderItem={item => <Text>{item.label}</Text>} />
  </HjmNativeProvider>, { createNodeMock: () => ({ scrollTo: () => {} }) }); });
  const track = renderer!.root.findByType(ScrollView);
  act(() => track.props.onLayout({ nativeEvent: { layout: { width: 390 } } }));
  const content = StyleSheet.flatten(renderer!.root.findByType(ScrollView).props.contentContainerStyle);
  expect(content.gap).toBe(spacing.xs);
  const cell = renderer!.root.findAll(node => node.props.onFocus && StyleSheet.flatten(node.props.style)?.width !== undefined)[0]!;
  expect(StyleSheet.flatten(cell.props.style).width).toBe(collectionRailRecipe.itemMaxWidth.chip);
});
