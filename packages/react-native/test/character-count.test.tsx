import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, Text, TextInput, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { characterCountRecipe, type CharacterCountOptions } from "@hjmds/design-contracts/character-count";
import { HjmNativeProvider } from "../src/provider.js";
import { TextArea, TextField } from "../src/inputs.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.restoreAllMocks(); });
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;

const options: CharacterCountOptions = {
  min: 2, max: 10, nearLimit: 3, overflow: "allow", locale: "ko-KR",
  messages: {
    range: ({ min, max }) => `${min}–${max}자`,
    remaining: ({ count }) => `${count}자 남음`,
    needed: ({ count }) => `${count}자 더`,
    over: ({ count }) => `${count}자 초과`,
  },
};

it("draws the counter row hidden from the tree, reads it in the hint and announces status changes once", () => {
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibility").mockImplementation(() => {});
  act(() => { tree = create(<HjmNativeProvider theme="light"><TextArea label="본문" description="앞뒤 공백 제외" characterCount={options} /></HjmNativeProvider>); });
  const input = () => tree!.root.findByType(TextInput);
  const row = () => tree!.root.findByProps({ testID: "hjm-field-character-count" });
  const texts = () => row().findAllByType(Text).map(node => node.props.children).filter(child => typeof child === "string");
  expect(texts()).toEqual(["2–10자", "0/10"]);
  expect(row().props.importantForAccessibility).toBe("no-hide-descendants");
  expect(input().props.accessibilityHint).toBe("앞뒤 공백 제외, 2–10자, 0/10");
  expect(input().props.maxLength).toBeUndefined();

  act(() => input().props.onChangeText("가"));
  expect(texts()).toEqual(["1자 더", "1/10"]);
  expect(announce).toHaveBeenLastCalledWith("1자 더");
  act(() => input().props.onChangeText("가".repeat(8)));
  act(() => input().props.onChangeText("가".repeat(9)));
  expect(announce.mock.calls.map(call => call[0])).toEqual(["1자 더", "2자 남음"]);

  act(() => input().props.onChangeText("가".repeat(12)));
  expect(announce).toHaveBeenLastCalledWith("2자 초과");
  const counter = row().findAllByType(Text).find(node => node.props.children === "12/10")!;
  expect(flatten(counter.props.style).fontWeight).toBe(characterCountRecipe.counterFontWeight.invalid);
  const frame = tree!.root.findAllByType(View).find(node => typeof flatten(node.props.style).minHeight === "number" && typeof flatten(node.props.style).borderWidth === "number")!;
  expect(flatten(frame.props.style).borderWidth).toBe(2);
});

it("blocks typing at max by default and rejects a second maxLength", () => {
  act(() => { tree = create(<HjmNativeProvider><TextField label="닉네임" defaultValue="하늘" characterCount={{ max: 12, locale: "ko-KR" }} /></HjmNativeProvider>); });
  expect(tree!.root.findByType(TextInput).props.maxLength).toBe(12);
  expect(tree!.root.findByType(TextInput).props.accessibilityHint).toBe("2/12");
  act(() => tree!.unmount()); tree = undefined;
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => act(() => { tree = create(<HjmNativeProvider><TextField label="닉네임" maxLength={5} characterCount={{ max: 12, locale: "ko-KR" }} /></HjmNativeProvider>); })).toThrow(TypeError);
});
