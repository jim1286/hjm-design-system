// HJM 1.31 screen additions on Native: header identity mark, brand loader, IconTile frame options, reaction summary,
// menu tone, composer error announcement, typing indicator and date separator.
import { AccessibilityInfo, Animated, Modal, Platform, Pressable, View } from "react-native";
import { startedAnimatedTimings } from "./react-native.mock.js";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { HjmNativeProvider } from "../src/provider.js";
import { ChatDateSeparator, ChatMessage, ChatScreen, IconTile, MessageComposer, ScreenLayout, TypingIndicator } from "../src/screens.js";
import { Spinner } from "../src/feedback.js";
import { Text } from "../src/primitives.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let tree: ReactTestRenderer | undefined;
function render(child: ReactNode, reducedMotion = false) {
  act(() => { tree = create(<HjmNativeProvider reducedMotion={reducedMotion}>{child}</HjmNativeProvider>); });
  return tree!;
}
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.restoreAllMocks(); });
const textOf = (node: ReactTestInstance) => JSON.stringify(node.props.children);
const options = [{ id: "heart", emoji: "❤️", label: "좋아요" }, { id: "laugh", emoji: "😂", label: "웃겨요" }];

describe("ScreenLayout title mark and loading indicator", () => {
  it("hides a decorative mark beside the header title and names a standalone mark by the title", () => {
    const view = render(<ScreenLayout title="LG 트윈스" titleLeading={<Text testID="logo">LG</Text>}><Text>본문</Text></ScreenLayout>);
    const logo = view.root.findByProps({ testID: "logo" });
    const wrapper = logo.parent!;
    expect(wrapper.props.accessibilityElementsHidden).toBe(true);
    expect(wrapper.props.importantForAccessibility).toBe("no-hide-descendants");
    act(() => view.update(<HjmNativeProvider><ScreenLayout title="LG 트윈스" titleVisibility="hidden" titleLeading={<Text testID="logo">LG</Text>}><Text>본문</Text></ScreenLayout></HjmNativeProvider>));
    const header = view.root.findAll(node => node.props.accessibilityRole === "header" && node.props.accessibilityLabel === "LG 트윈스");
    expect(header.length).toBeGreaterThan(0);
    // A mark needs the titled band (52), not the compact icon-only band (48).
    expect(view.root.findAllByType(View).some(node => node.props.style?.minHeight === 52)).toBe(true);
    expect(view.root.findAllByType(View).some(node => node.props.style?.minHeight === 48)).toBe(false);
  });

  it("keeps ChatScreen's avatar as its title mark", () => {
    const view = render(<ChatScreen title="서연" avatar={<Text testID="peer">S</Text>} composer={<Text>작성창</Text>} />);
    expect(view.root.findByProps({ testID: "peer" }).parent!.props.accessibilityElementsHidden).toBe(true);
  });

  it("replaces the spinner with a brand indicator inside the named busy status", () => {
    const view = render(<ScreenLayout title="홈" state={{ kind: "loading", title: "불러오는 중" }} loadingIndicator={<Text testID="flower">꽃</Text>} />);
    expect(view.root.findAllByType(Spinner)).toHaveLength(0);
    const status = view.root.find(node => node.props.accessibilityRole === "progressbar" && node.props.accessibilityLabel === "불러오는 중");
    expect(status.props.accessibilityState).toEqual({ busy: true });
    expect(status.findByProps({ testID: "flower" }).parent!.props.importantForAccessibility).toBe("no-hide-descendants");
  });
});

describe("IconTile frame options", () => {
  const frameOf = (view: ReactTestRenderer) => view.root.findAllByType(View).find(node => node.props.style?.alignItems === "center" && node.props.style?.justifyContent === "center" && node.props.style?.position === "relative")!;
  it("keeps the framed 64 squircle by default", () => {
    const view = render(<IconTile icon={<Text>A</Text>} label="기본" />);
    expect(frameOf(view).props.style).toMatchObject({ width: 64, height: 64, borderWidth: 1 });
    expect(frameOf(view).props.style.borderRadius).toBeCloseTo(64 * 0.22);
  });
  it("draws no frame for complete artwork and follows the requested shape", () => {
    const view = render(<IconTile icon={<Text>A</Text>} label="틀 없음" frame="none" shape="square" />);
    expect(frameOf(view).props.style).toMatchObject({ borderWidth: 0, backgroundColor: "transparent", borderRadius: 0 });
  });
  it("fills the cell between the recipe bounds and keeps the shape at the measured edge", () => {
    const view = render(<IconTile icon={<Text>A</Text>} label="채움" size="fill" shape="circle" />);
    const frame = frameOf(view);
    expect(frame.props.style).toMatchObject({ width: "100%", minWidth: 48, maxWidth: 68, aspectRatio: 1 });
    act(() => frame.props.onLayout({ nativeEvent: { layout: { width: 60, height: 60 } } }));
    expect(frameOf(view).props.style.borderRadius).toBe(30);
  });
});

describe("ChatMessage reaction summary and menu tone", () => {
  it("opens the same hold menu from the summary and draws a danger-toned delete row", () => {
    const remove = vi.fn();
    const view = render(<ChatMessage direction="outgoing" author="" timestamp="오후 3:04"
      reactions={{ label: "메시지 반응", closeLabel: "닫기", value: "heart", onValueChange: () => {}, options,
        menuActions: [{ id: "delete", label: "삭제", tone: "danger", onPress: remove }],
        summary: { label: "반응 ❤️ 2개, 😂 1개. 반응 메뉴 열기", items: [{ id: "heart", emoji: "❤️", count: 2 }, { id: "laugh", emoji: "😂", count: 1 }] } }}>
      <Text>주말에 같이 가요</Text>
    </ChatMessage>);
    const summary = view.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "반응 ❤️ 2개, 😂 1개. 반응 메뉴 열기")!;
    // 24pt pill reaches the 44pt touch target through hitSlop.
    expect(summary.props.hitSlop).toEqual({ top: 10, bottom: 10 });
    // A single reaction shows its emoji alone.
    expect(summary.findAllByType(Text).map(node => node.props.children)).toEqual(["❤️", "2", "😂"]);
    expect(view.root.findByType(Modal).props.visible).toBe(false);
    act(() => summary.props.onPress());
    expect(view.root.findByType(Modal).props.visible).toBe(true);
    const deleteRow = view.root.findAll(node => node.props.accessibilityLabel === "삭제" && typeof node.props.onPress === "function")[0]!;
    expect(deleteRow.findAllByType(Text).find(node => node.props.children === "삭제")!.props.tone).toBe("danger");
  });

  it("does not open from a disabled summary", () => {
    const view = render(<ChatMessage direction="incoming" author="서연" timestamp="지금"
      reactions={{ label: "메시지 반응", closeLabel: "닫기", value: null, onValueChange: () => {}, options, disabled: true, summary: { label: "반응 보기", items: [{ id: "heart", emoji: "❤️", count: 3 }] } }}>
      <Text>안녕</Text>
    </ChatMessage>);
    const summary = view.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "반응 보기")!;
    expect(summary.props.disabled).toBe(true);
    act(() => summary.props.onPress());
    expect(view.root.findByType(Modal).props.visible).toBe(false);
  });
});

describe("MessageComposer error announcement", () => {
  it("keeps the assertive field message and announces each new error on iOS", () => {
    const previous = Platform.OS;
    Platform.OS = "ios";
    const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
    const composer = (error?: string) => <MessageComposer value="안녕" label="메시지" sendLabel="전송" onValueChange={() => {}} onSend={() => {}} {...(error ? { error } : {})} />;
    const view = render(composer());
    expect(announce).not.toHaveBeenCalled();
    act(() => view.update(<HjmNativeProvider>{composer("전송하지 못했어요")}</HjmNativeProvider>));
    expect(announce).toHaveBeenCalledWith("전송하지 못했어요");
    expect(view.root.findAll(node => node.props.accessibilityLiveRegion === "assertive" && textOf(node).includes("전송하지 못했어요")).length).toBeGreaterThan(0);
    Platform.OS = previous;
  });
});

describe("TypingIndicator", () => {
  it("is one polite named element whose dots pulse, and static under reduced motion", () => {
    startedAnimatedTimings.length = 0;
    const view = render(<TypingIndicator label="서연님이 입력 중" />);
    const status = view.root.find(node => node.props.accessibilityLabel === "서연님이 입력 중");
    expect(status.props.accessible).toBe(true);
    expect(status.props.accessibilityLiveRegion).toBe("polite");
    expect(status.findAllByType(Animated.View)).toHaveLength(3);
    expect(startedAnimatedTimings.length).toBeGreaterThan(0);
    act(() => tree!.unmount()); tree = undefined;
    startedAnimatedTimings.length = 0;
    render(<TypingIndicator label="입력 중" />, true);
    expect(startedAnimatedTimings).toHaveLength(0);
  });

  it("requires a localized label", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TypingIndicator label=" " />)).toThrow(TypeError);
  });
});

describe("ChatDateSeparator", () => {
  it("centers the product-formatted date as muted caption text", () => {
    const view = render(<ChatDateSeparator label="10월 18일 토요일" dateTime="2026-10-18" />);
    const text = view.root.findAllByType(Text).find(node => node.props.children === "10월 18일 토요일")!;
    expect(text.props).toMatchObject({ variant: "caption", tone: "muted", align: "center" });
    expect(text.parent!.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ alignItems: "center", paddingTop: 12, paddingBottom: 4 })]));
  });
});
