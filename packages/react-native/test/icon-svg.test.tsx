import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Svg: View, Path: View, Circle: View, Rect: View, Line: View, Polyline: View, Polygon: View, Ellipse: View, G: View }; });
import { semanticIconLucideNames, semanticIconNames } from "@hjmds/design-contracts/components/icon";
import { renderSemanticGlyph, semanticIconGlyphs } from "../src/icon-svg.js";
import { Icon } from "../src/primitives.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const pascal = (name: string) => name.replace(/(^|-)([a-z0-9])/gu, (_, __, letter: string) => letter.toUpperCase());

it("maps every semantic name to the Lucide icon the contract names", () => {
  for (const name of semanticIconNames) expect(semanticIconGlyphs[name].displayName).toBe(pascal(semanticIconLucideNames[name]));
});

it("draws the Lucide glyph with the size, tone and stroke Icon resolved", () => {
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(<HjmNativeProvider theme="light"><Icon descriptor={{ name: "rotate", size: "sm", weight: "strong" }} renderGlyph={renderSemanticGlyph} /></HjmNativeProvider>); });
    const glyph = tree.root.findByType(semanticIconGlyphs.rotate);
    expect(glyph.props).toMatchObject({ size: 20, strokeWidth: 2.5, accessible: false });
  } finally { act(() => tree.unmount()); }
});

it("covers reorder and unblock names and rejects product-only names", () => {
  for (const name of ["arrowUp", "arrowDown", "unblock", "visibilityOff"]) {
    expect(renderSemanticGlyph({ name, size: 24, color: "#000", strokeWidth: 2 })).not.toBeNull();
  }
  expect(() => renderSemanticGlyph({ name: "photo", size: 24, color: "#000", strokeWidth: 2 })).toThrow(/photo/u);
});
