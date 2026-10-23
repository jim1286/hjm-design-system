import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { afterEach, expect, it } from "vitest";
import { dividerRecipe } from "@hjmds/design-contracts/recipes";
import { Divider } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
function flat(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
}

it.each([["horizontal", "width", 50], ["vertical", "height", 34]] as const)("draws a %s dashed line as recipe segments over the measured length", (orientation, axis, length) => {
  act(() => { tree = create(<HjmNativeProvider><Divider orientation={orientation} lineStyle="dashed" /></HjmNativeProvider>); });
  const root = tree!.root.findAllByType(View)[0]!;
  const { dash, gap } = dividerRecipe.lineStyles.dashed;
  expect(flat(root.props.style)).toMatchObject({ gap, overflow: "hidden", backgroundColor: undefined });
  act(() => root.props.onLayout({ nativeEvent: { layout: { width: axis === "width" ? length : 1, height: axis === "height" ? length : 1, x: 0, y: 0 } } }));
  const segments = tree!.root.findAllByType(View).slice(1).filter(node => flat(node.props.style)[axis] === dash);
  // 50 / (4 + 4) → 7 segments, clipped at the end; 34 → 5.
  expect(segments).toHaveLength(Math.ceil(length / (dash + gap)));
  expect(flat(segments[0]!.props.style)[axis === "width" ? "height" : "width"]).toBe(dividerRecipe.thickness);
});

it("keeps the solid line as one filled view and rejects unknown line styles", () => {
  act(() => { tree = create(<HjmNativeProvider><Divider /></HjmNativeProvider>); });
  const views = tree!.root.findAllByType(View);
  expect(flat(views[0]!.props.style).backgroundColor).toBeTruthy();
  expect(views[0]!.props.onLayout).toBeUndefined();
  expect(() => act(() => tree!.update(<HjmNativeProvider><Divider lineStyle={"dotted" as "dashed"} /></HjmNativeProvider>))).toThrow(/Unsupported Divider lineStyle/);
});
