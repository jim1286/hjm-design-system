import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text as RNText } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { CommentThreadRow, type CommentThreadItem } from "../src/screen-flows.js";
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }) }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// 2026-10-18: Spint's flower body keeps the time with Reply under the body; Utilverse opens edit/report/block forms in-row.
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const base: CommentThreadItem = { id: "c1", parentId: null, author: "서연", body: <RNText testID="body">꽃</RNText>, timeLabel: "3분 전", likeCountLabel: "", likeIcon: <RNText>♥</RNText>, likeLabel: "좋아요" };
// Document order of host text nodes, so placement is asserted without depending on wrapper structure.
const order = (item: CommentThreadItem) => {
  act(() => { tree = create(<HjmNativeProvider><CommentThreadRow item={item} onLike={() => {}} onReply={() => {}} replyLabel="답글" /></HjmNativeProvider>); });
  const texts: string[] = [];
  const walk = (node: ReturnType<ReactTestRenderer["toJSON"]>) => { if (!node) return; if (Array.isArray(node)) { node.forEach(walk); return; } if (typeof node === "string") { texts.push(node); return; } if (node.props.testID) texts.push(`#${node.props.testID}`); node.children?.forEach(child => walk(child as never)); };
  walk(tree!.toJSON());
  return texts;
};

it("keeps the time beside the author by default and moves it under a rich body with timePlacement", () => {
  const auto = order(base);
  expect(auto.indexOf("3분 전")).toBeLessThan(auto.indexOf("#body"));
  act(() => tree!.unmount()); tree = undefined;
  const moved = order({ ...base, timePlacement: "actions" });
  expect(moved.indexOf("3분 전")).toBeGreaterThan(moved.indexOf("#body"));
  expect(moved.indexOf("3분 전")).toBeLessThan(moved.indexOf("답글"));
  expect(moved.filter(text => text === "3분 전")).toHaveLength(1);
});

it("renders the inline panel after the reply line", () => {
  const texts = order({ ...base, panel: <RNText testID="panel">신고 양식</RNText> });
  expect(texts.indexOf("#panel")).toBeGreaterThan(texts.indexOf("답글"));
});

// 2026-10-29 Spint translation: "See original" sits after Reply in the same line, also on replies without Reply.
it("draws product text actions after Reply in the action line", () => {
  const onPress = vi.fn();
  const texts = order({ ...base, timePlacement: "actions", textActions: [{ id: "original", label: "원본 보기", onPress }] });
  expect(texts.indexOf("원본 보기")).toBeGreaterThan(texts.indexOf("답글"));
  act(() => tree!.root.findByProps({ accessibilityLabel: "원본 보기" }).props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
  act(() => tree!.unmount()); tree = undefined;
  expect(order({ ...base, parentId: "p", textActions: [{ id: "original", label: "원본 보기", onPress }] })).toContain("원본 보기");
});

// 2026-10-29: the nickname opens the same member profile as the picture; without the action it stays text.
it("makes the author name the avatar's profile action", () => {
  const onPress = vi.fn();
  order({ ...base, avatar: <RNText>사진</RNText>, avatarAction: { label: "서연 프로필 열기", onPress } });
  const name = tree!.root.findAll(node => node.props.accessibilityLabel === "서연 프로필 열기" && typeof node.props.onPress === "function" && node.props.suppressHighlighting === true)[0]!;
  act(() => name.props.onPress({ stopPropagation() {} }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
