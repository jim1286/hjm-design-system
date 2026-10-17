import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { StyleSheet, Text as NativeText } from "react-native";
import { expect, it } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import { Heading } from "../src/heading.js";

function render(fonts: "system" | "pretendard") {
  let tree: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider fonts={fonts}><Text>본문</Text><Heading level="level3">제목</Heading></HjmNativeProvider>); });
  return tree!.root.findAllByType(NativeText).map(node => StyleSheet.flatten(node.props.style));
}

it("selects the bundled Pretendard face per weight and keeps the OS font until fonts load", () => {
  const [body, heading] = render("pretendard");
  expect(body).toMatchObject({ fontFamily: "Pretendard" });
  expect(heading).toMatchObject({ fontFamily: "Pretendard-Bold" });
  expect(heading!.fontWeight).toBeUndefined();
  const [systemBody] = render("system");
  expect(systemBody!.fontFamily).toBeUndefined();
});
