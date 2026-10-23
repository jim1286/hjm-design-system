import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { expect, it } from "vitest";
import { Chip } from "../src/inputs.js";
import { Text } from "../src/primitives.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const flatten = (value: unknown): Record<string, unknown> => Array.isArray(value) ? Object.assign({}, ...value.map(flatten)) : (value ?? {}) as Record<string, unknown>;

it("lets a long label shrink beside the leading glyph and selection mark so it wraps inside the chip", () => {
  // 2026-10-23 flex audit: at its natural width the label plus the glyphs overran the chip (chip.md: labels wrap).
  const label = "아주 긴 추천 검색어가 좁은 폭에서 줄바꿈되어야 해요";
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><Chip label={label} selectionMode="multiple" selected leading={<View testID="glyph" />} onPress={() => {}} /></HjmNativeProvider>); });
  const text = tree.root.findAllByType(Text).find(node => node.props.children === label)!;
  expect(flatten(text.props.style).flexShrink).toBe(1);
  act(() => tree.unmount());
});
