import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { afterEach, expect, it } from "vitest";
import { nativeElevationFallback, shadow } from "@hjmds/design-contracts/foundations";
import { IconButton } from "../src/actions.js";
import { Surface } from "../src/primitives.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
const mount = (node: React.ReactNode) => { act(() => { tree = create(<HjmNativeProvider>{node}</HjmNativeProvider>); }); return tree!; };
const rootStyle = (t: ReactTestRenderer) => StyleSheet.flatten(t.root.findAllByType(View)[0]!.props.style);

it("lifts Surface by shadow step and stops clipping while elevated", () => {
  const floating = rootStyle(mount(<Surface elevation="floating"><Text>a</Text></Surface>));
  expect(floating).toMatchObject({ shadowOpacity: shadow.floating.opacity, shadowRadius: shadow.floating.radius, elevation: nativeElevationFallback.floating, overflow: "visible" });
  const flat = rootStyle(mount(<Surface tone="raised" elevation="none"><Text>a</Text></Surface>));
  expect(flat.shadowOpacity).toBeUndefined();
  const raised = rootStyle(mount(<Surface tone="raised"><Text>a</Text></Surface>));
  expect(raised).toMatchObject({ shadowOpacity: shadow.raised.opacity, elevation: nativeElevationFallback.raised });
});

it("lifts a filled IconButton and rejects an elevated ghost", () => {
  const t = mount(<IconButton label="번뚝" tone="primary" elevation="floating"><Text>⚡</Text></IconButton>);
  const style = StyleSheet.flatten(t.root.findByType(Pressable).props.style({ pressed: false }));
  expect(style).toMatchObject({ shadowOpacity: shadow.floating.opacity, elevation: nativeElevationFallback.floating });
  const flat = mount(<IconButton label="닫기" tone="primary"><Text>×</Text></IconButton>);
  expect(StyleSheet.flatten(flat.root.findByType(Pressable).props.style({ pressed: false })).shadowOpacity).toBeUndefined();
  expect(() => mount(<IconButton label="x" elevation="raised"><Text>x</Text></IconButton>)).toThrow(TypeError);
});
