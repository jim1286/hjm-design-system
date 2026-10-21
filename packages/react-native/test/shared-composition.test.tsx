import { TopBar } from "../src/navigation.js";
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
    aside={<Text>보조 그림</Text>} footerAside={<Text>전달 완료</Text>}
    footer={<Text>닫기</Text>}><Text>보존할 초안</Text></CompositionLayout></HjmNativeProvider>;
  act(() => { tree = create(render(false)); });
  expect(tree!.root.findAllByType(ScrollView)).toHaveLength(0);
  expect(JSON.stringify(tree!.toJSON())).toContain("보존할 초안");
  act(() => tree!.update(render(true)));
  expect(JSON.stringify(tree!.toJSON())).not.toContain("보존할 초안");
  expect(JSON.stringify(tree!.toJSON())).toContain("닫기");
  expect(JSON.stringify(tree!.toJSON())).toContain("보조 그림");
  expect(JSON.stringify(tree!.toJSON())).toContain("전달 완료");
  act(() => tree!.unmount());
});
it("connects shared row actions to the actual item and renders the common screen badge", () => {
  let tree: ReactTestRenderer; const like = vi.fn(), reply = vi.fn();
  const item = {id: "one", parentId: null, author: "작성자", body: <Text>내용</Text>, timeLabel: "방금", likeCountLabel: "3", likeIcon: <Text>♡</Text>, likeLabel: "좋아요"};
  act(() => { tree = create(<HjmNativeProvider><ScreenLayout title="댓글" titleBadge={<Text>배지</Text>} scroll="content"><CommentThreadRow item={item} onLike={like} onReply={reply} replyLabel="답글"/></ScreenLayout></HjmNativeProvider>); });
  act(() => tree!.root.findByType(IconButton).props.onPress());
  act(() => tree!.root.find(node => node.props.accessibilityRole === "button" && node.props.accessibilityLabel === "답글" && !!node.props.onPress).props.onPress());
  expect(like).toHaveBeenCalledWith("one"); expect(reply).toHaveBeenCalledWith("one");
  expect(JSON.stringify(tree!.toJSON())).toContain("배지");
  expect(tree!.root.findAllByType(ScrollView)).toHaveLength(0);
  act(() => tree!.unmount());
});
it("keeps prompt semantics and forwards host drag callbacks without nesting a scroller", () => {
  let tree: ReactTestRenderer; const begin = vi.fn(), end = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><ScreenLayout title="안내" titleVisibility="hidden" surface="transparent" contentAlignment="center" scrollProps={{onScrollBeginDrag:begin,onScrollEndDrag:end,scrollEventThrottle:16,automaticallyAdjustKeyboardInsets:true}}><Text>로그인</Text></ScreenLayout></HjmNativeProvider>); });
  const scrolls=tree!.root.findAllByType(ScrollView); expect(scrolls).toHaveLength(1);
  act(() => {scrolls[0]!.props.onScrollBeginDrag({nativeEvent:{contentOffset:{y:10}}});scrolls[0]!.props.onScrollEndDrag({nativeEvent:{contentOffset:{y:0}}});});
  expect(begin).toHaveBeenCalledOnce();expect(end).toHaveBeenCalledOnce();
  expect(JSON.stringify(tree!.toJSON())).toContain('"backgroundColor":"transparent"');
  act(() => tree!.update(<HjmNativeProvider><CompositionLayout state={{kind:"loading",title:"찾는 중"}} loadingIndicator={<Text>브랜드 그림</Text>} /></HjmNativeProvider>));
  expect(tree!.root.findAll(node=>node.props.accessibilityRole==="progressbar" && node.props.accessibilityLabel==="찾는 중").length).toBeGreaterThan(0);
  expect(tree!.root.findAllByType(ScrollView)).toHaveLength(0);
  act(() => tree!.unmount());
});
it("preserves a title action while omitting the retired toolbar subtitle", () => {
  let tree: ReactTestRenderer; const open=vi.fn();
  act(() => {tree=create(<HjmNativeProvider><TopBar title="도구" subtitle="설명" onTitlePress={open} /></HjmNativeProvider>);});
  const action=tree!.root.findAll(node=>node.props.accessibilityRole==="button" && node.props.accessibilityLabel==="도구")[0]!;
  act(()=>action.props.onPress()); expect(open).toHaveBeenCalledOnce();
  expect(JSON.stringify(tree!.toJSON())).not.toContain("설명");act(()=>tree!.unmount());
});

import { ProfileSummary } from '../src/screen-flows.js';
import { NotificationRow } from '../src/screens.js';
it('preserves independent profile actions and hides duplicate notification semantics from the host target', () => {
  let tree: ReactTestRenderer; const followers = vi.fn(), edit = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><ProfileSummary name="Person" avatar={<Text>portrait</Text>}
    stats={[{id:'followers',value:'12',label:'Followers',onPress:followers}]}
    nameActions={<Button onPress={edit}>Edit</Button>} />
    <NotificationRow preview={<Text>Person replied</Text>} metadata="Now" avatar={<Text>portrait</Text>} unread /></HjmNativeProvider>); });
  const count = tree!.root.findAllByType(Button).find(node => node.props.accessibilityLabel === '12 Followers')!;
  act(() => count.props.onPress()); expect(followers).toHaveBeenCalledOnce(); expect(edit).not.toHaveBeenCalled();
  expect(tree!.root.findAll(node => node.props.testID === 'hjm-unread-dot').length).toBeGreaterThan(0);
  expect(tree!.root.findAll(node => node.props.importantForAccessibility === 'no-hide-descendants').length).toBeGreaterThan(0);
  act(() => tree!.unmount());
});
