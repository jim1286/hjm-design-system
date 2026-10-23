import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Top } from "../src/top.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
const title = "아이디어를 제품으로,\n제품을 오래 쓰이는 구조로.";
const heading = () => tree!.root.findAll(node => node.props.accessibilityRole === "header" && typeof node.type !== "string")[0]!;

it.each([
  ["preserve", "아이디어를 제품으로,\n제품을 오래 쓰이는 구조로."],
  ["collapse", "아이디어를 제품으로, 제품을 오래 쓰이는 구조로."],
] as const)("draws %s title text and speaks one sentence", (titleLineBreaks, text) => {
  act(() => { tree = create(<HjmNativeProvider><Top descriptor={{ title, titleLineBreaks }} /></HjmNativeProvider>); });
  expect(heading().props.children).toBe(text);
  expect(heading().props.accessibilityLabel).toBe("아이디어를 제품으로, 제품을 오래 쓰이는 구조로.");
});
