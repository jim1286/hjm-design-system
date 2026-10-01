import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Svg: View, Circle: View, Path: View, G: View, Rect: View, Line: View, Polyline: View, Polygon: View, Ellipse: View }; });
import { Search } from "lucide-react-native";
import { createLucideGlyph } from "../src/icon-lucide.js";
import { Icon } from "../src/primitives.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("keeps one semantic accessible frame and mirrors the selected Lucide artwork", () => {
  let tree!: ReactTestRenderer;
  try {
    act(()=>{tree=create(<HjmNativeProvider direction="rtl"><Icon descriptor={{name:'back',decorative:false,accessibilityLabel:'뒤로'}} renderGlyph={createLucideGlyph({back:Search})}/></HjmNativeProvider>);});
    const namedHosts=tree.root.findAll(n=>typeof n.type==='string' && n.props.accessibilityRole==='image');
    expect(namedHosts).toHaveLength(1);expect(namedHosts[0]!.props.accessibilityLabel).toBe('뒤로');
    expect(namedHosts[0]!.props.style.flat().some((style: {transform?: unknown})=>JSON.stringify(style.transform)==='[{"scaleX":-1}]')).toBe(true);
    expect(tree.root.findAll(n=>typeof n.type==='string' && n.props.d).length).toBeGreaterThan(0);
  } finally {act(()=>tree.unmount());}
});
