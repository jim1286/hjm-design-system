import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text, View } from "react-native";
import { expect, it } from "vitest";
import { ScreenLayout } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const flatten = (value: unknown): Record<string, unknown> => Array.isArray(value) ? Object.assign({}, ...value.map(flatten)) : (value ?? {}) as Record<string, unknown>;

// 2026-10-23: the title row wraps, so a long title dropped under a lone title mark (same fault as CompositionLayout).
it.each(["center", "start"] as const)("keeps the %s title mark and a shrinkable heading in one non-wrapping group", (headerAlignment) => {
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ScreenLayout headerAlignment={headerAlignment} title={"아주 긴 화면 제목 ".repeat(4)} titleLeading={<View testID="mark" />}
    titleBadge={<View testID="badge" />}><Text>본문</Text></ScreenLayout></HjmNativeProvider>); });
  const mark = tree.root.findByProps({ testID: "mark" });
  const group = (() => { for (let node = mark.parent; node; node = node.parent) if (flatten(node.props.style).flexDirection === "row") return node; throw new Error("no row"); })();
  expect(flatten(group.props.style).flexWrap).not.toBe("wrap");
  expect(flatten(group.props.style)).toMatchObject({ flexShrink: 1, minWidth: 0 });
  expect(group.findAll(node => flatten(node.props.style).flexShrink === 1 && flatten(node.props.style).minWidth === 0 && node !== group).length).toBeGreaterThan(0);
  // The badge still wraps after the group instead of being squeezed into it.
  expect(group.findAllByProps({ testID: "badge" })).toHaveLength(0);
  act(() => tree.unmount());
});
