import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { expect, it } from "vitest";
import { CompositionLayout } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const flatten = (value: unknown): Record<string, unknown> => Array.isArray(value) ? Object.assign({}, ...value.map(flatten)) : (value ?? {}) as Record<string, unknown>;

// 2026-10-23: the copy could not shrink, so a long title dropped under a lone leading glyph.
it("keeps the leading glyph and a shrinkable copy in one non-wrapping group", () => {
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><CompositionLayout title={"아주 긴 제목 ".repeat(8)} leading={<View testID="glyph" />} actions={<View testID="action" />} /></HjmNativeProvider>); });
  const glyph = tree.root.findByProps({ testID: "glyph" });
  const group = (() => { for (let node = glyph.parent; node; node = node.parent) if (flatten(node.props.style).flexDirection === "row") return node; throw new Error("no row"); })();
  expect(flatten(group.props.style).flexWrap).not.toBe("wrap");
  expect(group.findAll(node => flatten(node.props.style).minWidth === 0 && flatten(node.props.style).flexShrink === 1).length).toBeGreaterThan(0);
  expect(group.findAllByProps({ testID: "action" })).toHaveLength(0);
  act(() => tree.unmount());
});
