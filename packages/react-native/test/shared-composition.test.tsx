import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { ScrollView } from "react-native";
import { HjmNativeProvider } from "../src/provider.js";
import { CompositionLayout, ScreenLayout } from "../src/screens.js";
import { CommentThreadRow } from "../src/screen-flows.js";
import { Text } from "../src/primitives.js";
import { Button, IconButton } from "../src/actions.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("keeps composition content on notice, replaces it on restriction, and creates no nested scroller", () => {
  let tree: ReactTestRenderer;
  const render = (restricted: boolean) => <HjmNativeProvider><CompositionLayout title="구성"
    badge={<Text>배지</Text>} notice={<Text>저장 실패</Text>}
    state={restricted ? {kind: "restricted", title: "접근 제한"} : {kind: "ready"}}
    footer={<Text>닫기</Text>}><Text>보존할 초안</Text></CompositionLayout></HjmNativeProvider>;
  act(() => { tree = create(render(false)); });
  expect(tree!.root.findAllByType(ScrollView)).toHaveLength(0);
  expect(JSON.stringify(tree!.toJSON())).toContain("보존할 초안");
  act(() => tree!.update(render(true)));
  expect(JSON.stringify(tree!.toJSON())).not.toContain("보존할 초안");
  expect(JSON.stringify(tree!.toJSON())).toContain("닫기");
  act(() => tree!.unmount());
});
it("connects shared row actions to the actual item and renders the common screen badge", () => {
  let tree: ReactTestRenderer; const like = vi.fn(), reply = vi.fn();
  const item = {id: "one", parentId: null, author: "작성자", body: <Text>내용</Text>, timeLabel: "방금", likeCountLabel: "3", likeIcon: <Text>♡</Text>, likeLabel: "좋아요"};
  act(() => { tree = create(<HjmNativeProvider><ScreenLayout title="댓글" titleBadge={<Text>배지</Text>} scroll="content"><CommentThreadRow item={item} onLike={like} onReply={reply} replyLabel="답글"/></ScreenLayout></HjmNativeProvider>); });
  act(() => tree!.root.findByType(IconButton).props.onPress());
  act(() => tree!.root.findByType(Button).props.onPress());
  expect(like).toHaveBeenCalledWith("one"); expect(reply).toHaveBeenCalledWith("one");
  expect(JSON.stringify(tree!.toJSON())).toContain("배지");
  expect(tree!.root.findAllByType(ScrollView)).toHaveLength(0);
  act(() => tree!.unmount());
});
