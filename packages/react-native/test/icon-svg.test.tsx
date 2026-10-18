import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Svg: View, Path: View }; });
import { semanticIconPaths } from "@hjmds/design-contracts/components/icon";
import { renderSemanticGlyph } from "../src/icon-svg.js";
import { Icon } from "../src/primitives.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("draws the shared semantic path with the size, tone and stroke Icon resolved", () => {
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(<HjmNativeProvider theme="light"><Icon descriptor={{ name: "rotate", size: "sm", weight: "strong" }} renderGlyph={renderSemanticGlyph} /></HjmNativeProvider>); });
    const path = tree.root.find(node => typeof node.type === "string" && node.props.d !== undefined);
    expect(path.props.d).toBe(semanticIconPaths.rotate);
    const svg = tree.root.find(node => typeof node.type === "string" && node.props.viewBox === "0 0 24 24");
    expect(svg.props).toMatchObject({ width: 20, height: 20, strokeWidth: 2.5, fill: "none", strokeLinecap: "round", accessible: false });
  } finally { act(() => tree.unmount()); }
});

it("covers reorder and unblock names and rejects product-only names", () => {
  for (const name of ["arrowUp", "arrowDown", "unblock", "visibilityOff"]) {
    expect(renderSemanticGlyph({ name, size: 24, color: "#000", strokeWidth: 2 })).not.toBeNull();
  }
  expect(() => renderSemanticGlyph({ name: "photo", size: 24, color: "#000", strokeWidth: 2 })).toThrow(/photo/u);
});
