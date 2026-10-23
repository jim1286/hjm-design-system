import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { afterEach, expect, it } from "vitest";
import { Badge } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
function flat(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
}

it.each(["light", "dark"] as const)("paints a product category color with an AA label (%s)", theme => {
  const strokes: number[] = [];
  act(() => { tree = create(<HjmNativeProvider theme={theme}>
    <Badge label="시범" categoryColor={{ light: "#C2185B", dark: "#C2185B" }} leading={({ strokeWidth }) => { strokes.push(strokeWidth); return null; }} />
    <Badge label="포스트" variant="outline" categoryColor={{ light: "#1762A0", dark: "#7FB8F0" }} />
  </HjmNativeProvider>); });
  const [filled, outline] = tree!.root.findAll(node => node.props.accessibilityLabel === "시범" || node.props.accessibilityLabel === "포스트").filter(node => node.type === View);
  expect(flat(filled!.props.style)).toMatchObject({ backgroundColor: "#C2185B", borderWidth: 0 });
  expect(flat(outline!.props.style)).toMatchObject({ backgroundColor: "transparent", borderColor: theme === "light" ? "#1762A0" : "#7FB8F0", borderWidth: 1 });
  const labelColors = tree!.root.findAllByType(Text).map(node => flat(node.props.style).color);
  expect(labelColors).toEqual(["#ffffff", theme === "light" ? "#1762A0" : "#7FB8F0"]);
  expect(strokes).toEqual([2]);
});

it("rejects tone together with categoryColor and unreadable category colors", () => {
  expect(() => act(() => { tree = create(<HjmNativeProvider><Badge label="x" tone="brand" categoryColor={{ light: "#C2185B", dark: "#C2185B" }} /></HjmNativeProvider>); })).toThrow(TypeError);
  tree = undefined;
  expect(() => act(() => { tree = create(<HjmNativeProvider theme="dark"><Badge label="x" variant="outline" categoryColor={{ light: "#1762A0", dark: "#1762A0" }} /></HjmNativeProvider>); })).toThrow(RangeError);
  tree = undefined;
});

it("lets a long label shrink beside a leading glyph so it wraps inside the pill", () => {
  // 2026-10-23 flex audit: at its natural width the label plus the glyph overran the pill (badge.md: labels wrap).
  const label = "아주 긴 배지 라벨이 좁은 폭에서 줄바꿈되어야 해요";
  act(() => { tree = create(<HjmNativeProvider><Badge label={label} leading={<View testID="glyph" />} /></HjmNativeProvider>); });
  const text = tree!.root.findAllByType(Text).find(node => node.props.children === label)!;
  expect(flat(text.props.style).flexShrink).toBe(1);
});
