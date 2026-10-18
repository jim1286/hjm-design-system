import type { ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { StyleSheet, Text as NativeText } from "react-native";
import { expect, it } from "vitest";
import { Text, useHjmTextFace, type HjmTextFaceOptions } from "../src/primitives.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderInProvider(node: ReactNode, fonts: "pretendard" | "system" = "pretendard") {
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider theme="light" fonts={fonts}>{node}</HjmNativeProvider>); });
  return tree;
}

it("keeps the bundled face while a product color and tabular digits replace tone and spacing", () => {
  const tree = renderInProvider(<Text variant="bodyLarge" emphasis="medium" tone="muted" color="#c8102e" numeric="tabular">12</Text>);
  try {
    const style = StyleSheet.flatten(tree.root.findByType(NativeText).props.style);
    expect(style).toMatchObject({ color: "#c8102e", fontVariant: ["tabular-nums"], fontFamily: "Pretendard-Medium" });
    expect(style.fontWeight).toBeUndefined();
  } finally { act(() => tree.unmount()); }
});

function FaceProbe(props: HjmTextFaceOptions & { onFace: (face: object) => void }) {
  const { onFace, ...options } = props;
  onFace(useHjmTextFace(options));
  return null;
}

it("resolves the same face for product-drawn text that cannot be a Text", () => {
  let face: object = {};
  const bundled = renderInProvider(<FaceProbe weight="800" onFace={value => { face = value; }} />);
  expect(face).toEqual({ fontFamily: "Pretendard-ExtraBold" });
  act(() => bundled.unmount());
  const system = renderInProvider(<FaceProbe weight="700" onFace={value => { face = value; }} />, "system");
  // The neutral system stack keeps the OS family and passes the weight through.
  expect(face).toEqual({ fontWeight: "700" });
  act(() => system.unmount());
});
