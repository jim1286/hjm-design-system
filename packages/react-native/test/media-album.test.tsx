import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, Text } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { IconButton } from "../src/actions.js";
import { ChatMessage } from "../src/screens.js";
import { CommentThreadRow, type CommentThreadItem } from "../src/screen-flows.js";
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }) }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// 2026-10-18 Utilverse: a paged album mounts only the shown photo so the product fetches one authorized image at a time.
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const album = (renderPage: (index: number) => React.ReactNode) => ({ count: 3, renderPage, pageLabel: (index: number, count: number) => `사진 ${index + 1}/${count}`, previousLabel: "이전 사진", nextLabel: "다음 사진" });
const nav = (label: string) => tree!.root.findAllByType(IconButton).find(node => node.props.label === label)!;
const pages = () => tree!.root.findAll(node => node.props.testID?.startsWith?.("page-") && typeof node.type === "string").map(node => node.props.testID);

it("ChatMessage renders only the shown page and pages with the counter buttons", () => {
  const renderPage = vi.fn((index: number) => <Text testID={`page-${index}`}>{index}</Text>);
  act(() => { tree = create(<HjmNativeProvider><ChatMessage direction="incoming" author="서연" timestamp="14:32" mediaAlbum={album(renderPage)}>{null}</ChatMessage></HjmNativeProvider>); });
  expect(new Set(renderPage.mock.calls.map(([index]) => index))).toEqual(new Set([0]));
  expect(tree!.root.findAll(node => node.props.accessibilityRole === "image" && node.props.accessibilityLabel === "사진 1/3").length).toBeGreaterThan(0);
  expect(nav("이전 사진").props.disabled).toBe(true);
  act(() => nav("다음 사진").props.onPress());
  expect(new Set(pages())).toEqual(new Set(["page-1"]));
  expect(renderPage.mock.calls.some(([index]) => index === 2)).toBe(false);
});

it("a controlled album reports index changes and opens the shown page", () => {
  const onIndexChange = vi.fn(), onPress = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><ChatMessage direction="outgoing" author="나" timestamp="14:32" mediaAlbum={{ ...album(index => <Text testID={`page-${index}`}>{index}</Text>), index: 2, onIndexChange, onPress }}>{null}</ChatMessage></HjmNativeProvider>); });
  expect(nav("다음 사진").props.disabled).toBe(true);
  act(() => tree!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "사진 3/3")!.props.onPress());
  expect(onPress).toHaveBeenCalledExactlyOnceWith(2);
  act(() => nav("이전 사진").props.onPress());
  expect(onIndexChange).toHaveBeenCalledExactlyOnceWith(1);
});

it("CommentThreadRow renders the album lazily and rejects two photo sets", () => {
  const base: CommentThreadItem = { id: "c1", parentId: null, author: "서연", body: <Text>본문</Text>, timeLabel: "1분", likeCountLabel: "", likeIcon: <Text>♥</Text>, likeLabel: "좋아요" };
  const renderPage = vi.fn((index: number) => <Text testID={`page-${index}`}>{index}</Text>);
  act(() => { tree = create(<HjmNativeProvider><CommentThreadRow item={{ ...base, mediaAlbum: album(renderPage) }} onLike={() => {}} onReply={() => {}} replyLabel="답글" /></HjmNativeProvider>); });
  expect(new Set(renderPage.mock.calls.map(([index]) => index))).toEqual(new Set([0]));
  act(() => tree!.unmount()); tree = undefined;
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => act(() => { create(<HjmNativeProvider><CommentThreadRow item={{ ...base, media: <Text>사진</Text>, mediaAlbum: album(renderPage) }} onLike={() => {}} onReply={() => {}} replyLabel="답글" /></HjmNativeProvider>); })).toThrow(TypeError);
  spy.mockRestore();
});
