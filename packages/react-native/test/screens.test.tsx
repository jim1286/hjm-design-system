import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { ScrollView } from "react-native";
import { HjmNativeProvider } from "../src/provider.js";
import { ChatScreen, MessageComposer, NotificationInboxScreen, NotificationItem, ScreenLayout, SettingsScreen } from "../src/screens.js";
import { TextArea } from "../src/inputs.js";
import { Button } from "../src/actions.js";
import { Text } from "../src/primitives.js";
import { ListRow } from "../src/data-display.js";
import type { ReactNode } from "react";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
function render(child: ReactNode) {
  let tree: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider theme="dark" textScale={2} direction="rtl">{child}</HjmNativeProvider>); });
  return tree!;
}
describe("native screen composition", () => {
  it("does not nest a virtualized timeline in ScrollView and hides private content and composer", () => {
    const tree = render(<ChatScreen title="채팅" composer={<Text>작성창</Text>}><Text>메시지</Text></ChatScreen>);
    expect(tree.root.findAllByType(ScrollView)).toHaveLength(0);
    act(() => tree.update(<HjmNativeProvider><ChatScreen title="채팅" state={{ kind: "restricted", title: "로그인 필요" }} composer={<Text>작성창</Text>}><Text>메시지</Text></ChatScreen></HjmNativeProvider>));
    expect(tree.root.findAllByType(ScrollView)).toHaveLength(1);
    expect(JSON.stringify(tree.toJSON())).not.toContain("작성창");
    expect(JSON.stringify(tree.toJSON())).not.toContain("메시지");
    act(() => tree.unmount());
  });
  it("retains filters beside a replacing state and exposes unread metadata without a write", () => {
    const read = vi.fn();
    const tree = render(<NotificationInboxScreen title="알림" filters={<Text>모두</Text>}><NotificationItem title="답글" read={false} statusLabel="읽지 않음" timestamp="방금" onPress={read} /></NotificationInboxScreen>);
    expect(read).not.toHaveBeenCalled();
    expect(tree.root.findByType(ListRow).props.description).toContain("읽지 않음 · 방금");
    act(() => tree.root.findByType(ListRow).props.onPress());
    expect(read).toHaveBeenCalledTimes(1);
    act(() => tree.update(<HjmNativeProvider><NotificationInboxScreen title="알림" filters={<Text>모두</Text>} state={{ kind: "empty", title: "소식 없음" }}>{null}</NotificationInboxScreen></HjmNativeProvider>));
    expect(JSON.stringify(tree.toJSON())).toContain("모두");
    act(() => tree.unmount());
  });
  it("delivers the exact draft only when enabled and never clears it implicitly", () => {
    const send = vi.fn(), change = vi.fn();
    const props = { label: "메시지", sendLabel: "보내기", value: " 첫 줄\n둘째 줄 ", onSend: send, onValueChange: change };
    const tree = render(<MessageComposer {...props} />);
    act(() => tree.root.findByType(Button).props.onPress());
    expect(send).toHaveBeenCalledWith(props.value); expect(change).not.toHaveBeenCalled();
    expect(tree.root.findByType(TextArea).props.value).toBe(props.value);
    act(() => tree.update(<HjmNativeProvider><MessageComposer {...props} pending /></HjmNativeProvider>));
    expect(tree.root.findByType(Button).props.disabled).toBe(true);
    act(() => tree.root.findByType(Button).props.onPress());
    expect(send).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
  it("supports grouped settings and all replacement announcements", () => {
    const tree = render(<SettingsScreen title="설정" sections={[{ id: "account", title: "계정", children: <Text>계정 내용</Text> }]} />);
    expect(JSON.stringify(tree.toJSON())).toContain("계정 내용");
    for (const kind of ["loading", "empty", "error", "restricted"] as const) {
      act(() => tree.update(<HjmNativeProvider><ScreenLayout title="설정" state={{ kind, title: "안내" }}><Text>숨겨진 내용</Text></ScreenLayout></HjmNativeProvider>));
      expect(JSON.stringify(tree.toJSON())).not.toContain("숨겨진 내용");
      expect(tree.root.findByType(ScrollView).props.accessibilityState.busy).toBe(kind === "loading");
    }
    act(() => tree.unmount());
  });
});

it("native photo-only composer keeps attachments on send and locks removal while pending", async () => {
  const {IconButton} = await import("../src/actions.js");
  const send = vi.fn(), remove = vi.fn();
  const props = {label:"메시지",sendLabel:"전송",value:"",onValueChange:vi.fn(),onSend:send,sendIcon:<Text>↑</Text>,attachments:[{id:"one",removeLabel:"사진 삭제",preview:<Text>사진</Text>}],onRemoveAttachment:remove};
  const tree = render(<MessageComposer {...props}/>);
  act(() => tree.root.findAllByType(IconButton).find(node => node.props.label === "전송")!.props.onPress());
  expect(send).toHaveBeenCalledWith("");
  expect(remove).not.toHaveBeenCalled();
  expect(tree.root.findByType(TextArea).props.value).toBe("");
  act(() => tree.update(<HjmNativeProvider><MessageComposer {...props} pending/></HjmNativeProvider>));
  expect(tree.root.findAllByType(IconButton).every(node => node.props.disabled)).toBe(true);
  act(() => tree.unmount());
});

it("native hold opens a controlled reaction, same choice removes it and disabling cannot reopen a stale modal", async () => {
  const {ChatMessage} = await import("../src/screens.js");
  const {Pressable,Modal} = await import("react-native");
  const change = vi.fn();
  const fixture = (disabled = false) => <ChatMessage direction="incoming" author="서연" timestamp="지금" reactions={{label:"메시지 반응",closeLabel:"닫기",options:[{id:"heart",emoji:"❤️",label:"좋아요"}],value:"heart",onValueChange:change,disabled}}><Text>안녕</Text></ChatMessage>;
  const tree = render(fixture());
  const hold = () => act(() => tree.root.findAllByType(Pressable).find(node => node.props.onLongPress)!.props.onLongPress({nativeEvent:{pageY:250}}));
  hold();
  expect(tree.root.findByType(Modal).props.visible).toBe(true);
  act(() => tree.root.findByType(Button).props.onPress());
  expect(change).toHaveBeenCalledWith(null);
  expect(tree.root.findByType(Modal).props.visible).toBe(false);
  hold();
  act(() => tree.update(<HjmNativeProvider>{fixture(true)}</HjmNativeProvider>));
  act(() => tree.update(<HjmNativeProvider>{fixture(false)}</HjmNativeProvider>));
  expect(tree.root.findByType(Modal).props.visible).toBe(false);
  act(() => tree.unmount());
});

it("native plus expands additional reactions and selecting collapses the catalog", async () => {
  const {ReactionPicker} = await import("../src/reaction-picker.js");
  const change = vi.fn();
  const tree = render(<ReactionPicker label="반응" options={[{id:"heart",emoji:"❤️",label:"하트"}]} more={{label:"더 많은 이모지",options:[{id:"party",emoji:"🎉",label:"축하"}]}} value={null} onValueChange={change}/>);
  act(() => tree.root.findAllByType(Button).find(node => node.props.accessibilityLabel === "더 많은 이모지")!.props.onPress());
  act(() => tree.root.findAllByType(Button).find(node => node.props.accessibilityLabel === "축하")!.props.onPress());
  expect(change).toHaveBeenCalledWith("party");
  expect(tree.root.findAllByType(Button).some(node => node.props.accessibilityLabel === "축하")).toBe(false);
  act(() => tree.unmount());
});

it("native reply gesture preserves timeline scrolling and routes quote taps separately", async () => {
  const {ChatMessage} = await import("../src/screens.js");
  const {View} = await import("react-native");
  const reply=vi.fn(),jump=vi.fn();
  const tree=render(<ChatMessage direction="incoming" author="서연" timestamp="지금" replyAction={{label:"답장",onPress:reply}} reply={<Text>원문</Text>} replyLink={{label:"원문으로 이동",onPress:jump}}><Text>메시지</Text></ChatMessage>);
  expect(tree.root.findAllByType(Button).some(node=>node.props.children === "답장")).toBe(false);
  const gesture=tree.root.findAllByType(View).find(node=>node.props.onMoveShouldSetResponder)!;
  expect(gesture.props.onMoveShouldSetResponder({}, {dx:5,dy:80})).toBe(false);
  expect(gesture.props.onMoveShouldSetResponder({}, {dx:80,dy:5})).toBe(true);
  act(()=>gesture.props.onResponderRelease({}, {dx:80,dy:5}));
  expect(reply).toHaveBeenCalledTimes(1);
  act(()=>gesture.props.onResponderRelease({}, {dx:-80,dy:5}));
  expect(reply).toHaveBeenCalledTimes(2);
  act(()=>tree.root.findAllByType(Button).find(node=>node.props.accessibilityLabel === "원문으로 이동")!.props.onPress());
  expect(jump).toHaveBeenCalledTimes(1);
  act(()=>tree.unmount());
});

it("retains host header, zero gutters and pull-to-refresh ownership", () => {
  const refresh = <Text>Refresh control</Text>;
  const tree = render(<ScreenLayout title="Shared header" header={<Text>Host header</Text>} contentInset="none" scrollProps={{refreshControl:refresh,keyboardDismissMode:"interactive"}}><Text>Body</Text></ScreenLayout>);
  const scroll = tree.root.findByType(ScrollView);
  expect(scroll.props.refreshControl).toBe(refresh);
  expect(scroll.props.keyboardDismissMode).toBe("interactive");
  expect(scroll.props.contentContainerStyle.padding).toBe(0);
  expect(JSON.stringify(tree.toJSON())).not.toContain("Shared header");
  expect(JSON.stringify(tree.toJSON())).toContain("Host header");
  act(()=>tree.unmount());
});

it("allows a tool-only send while preserving host validation and input maximum", async () => {
  const {IconButton}=await import("../src/actions.js");
  const send=vi.fn();
  const props={label:"메시지",sendLabel:"공유",value:"",onValueChange:vi.fn(),onSend:send,additionalContent:true,maxLength:1000,leadingAction:<Text>도구 선택</Text>,sendIcon:<Text>↑</Text>};
  const tree=render(<MessageComposer {...props}/>);
  expect(tree.root.findByType(TextArea).props.maxLength).toBe(1000);
  act(()=>tree.root.findAllByType(IconButton).find(node=>node.props.label==="공유")!.props.onPress());
  expect(send).toHaveBeenCalledWith("");
  act(()=>tree.update(<HjmNativeProvider><MessageComposer {...props} sendDisabled/></HjmNativeProvider>));
  expect(tree.root.findAllByType(IconButton).find(node=>node.props.label==="공유")!.props.disabled).toBe(true);
  act(()=>tree.unmount());
});

it("opens the host menu only after the iOS reaction modal dismisses", async()=>{
 const {ChatMessage}=await import("../src/screens.js");
 const {Pressable,Modal,Platform}=await import("react-native");
 const previousOS=Platform.OS; Platform.OS="ios";
 const menu=vi.fn();
 const tree=render(<ChatMessage direction="incoming" author="서연" timestamp="지금" reactions={{label:"반응",closeLabel:"닫기",options:[{id:"heart",emoji:"❤️",label:"하트"}],value:null,onValueChange:()=>{},menuAction:{label:"메뉴",onPress:menu}}}><Text>내용</Text></ChatMessage>);
 act(()=>tree.root.findAllByType(Pressable).find(node=>node.props.onLongPress)!.props.onLongPress({nativeEvent:{pageY:250}}));
 act(()=>tree.root.findAllByType(Button).find(node=>node.props.children==="메뉴")!.props.onPress());
 expect(menu).not.toHaveBeenCalled();
 expect(tree.root.findByType(Modal).props.visible).toBe(false);
 act(()=>tree.root.findByType(Modal).props.onDismiss());
 expect(menu).toHaveBeenCalledOnce();
 act(()=>tree.root.findByType(Modal).props.onDismiss());
 expect(menu).toHaveBeenCalledOnce();
 act(()=>tree.unmount());
 Platform.OS=previousOS;
});
