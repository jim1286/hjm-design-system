import { Animated, Pressable, TextInput } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { AdaptiveContentPreview, ContextToolbarPreview, SelectionMotionPreview } from "../../../showcase/native/src/reference-adoption-previews.js";
let tree: ReactTestRenderer;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => { vi.spyOn(Animated, "timing").mockImplementation(() => ({ start: vi.fn(), stop: vi.fn(), reset: vi.fn() })); });
afterEach(() => { act(() => tree?.unmount()); vi.restoreAllMocks(); });
const memo = () => tree.root.findByType(TextInput);
const type = (value: string) => act(() => memo().props.onChangeText(value));
const select = (label: string, group = 0) => act(() => tree.root.findAllByType(SegmentedControl)[group]!.findAllByType(Pressable).find(node => node.props.accessibilityLabel === label)!.props.onPress());
const choice = (group = 0) => tree.root.findAllByType(SegmentedControl)[group]!.props.value;

it("keeps adaptive input through rapid state changes and interrupted native motion", async () => {
  const view = (reducedMotion = false) => <HjmNativeProvider reducedMotion={reducedMotion}><AdaptiveContentPreview /></HjmNativeProvider>;
  await act(async () => { tree = create(view()); });
  type("남겨 둔 메모"); const original = memo();
  select("상세"); select("요약"); select("상세");
  type("전환 중 이어 쓴 메모");
  await act(async () => tree.update(view(true)));
  expect(memo()).toBe(original); expect(memo().props.value).toBe("전환 중 이어 쓴 메모"); expect(choice()).toBe("details");
  expect(JSON.stringify(tree.toJSON())).toContain("나중에 다시 걷고 싶은 길");
});

it("retains toolbar draft and exclusive choice when tools close and reopen", async () => {
  await act(async () => { tree = create(<HjmNativeProvider><ContextToolbarPreview /></HjmNativeProvider>); });
  type("작성 중인 초안"); const original = memo();
  const trigger = () => tree.root.findByType(Collapsible).findAllByType(Pressable)[0]!;
  act(() => trigger().props.onPress()); select("인용");
  expect(choice()).toBe("인용"); expect(JSON.stringify(tree.toJSON())).toContain("선택한 표현: ");
  act(() => trigger().props.onPress());
  expect(trigger().props.accessibilityState.expanded).toBe(false);
  expect(tree.root.findAllByType(SegmentedControl)).toHaveLength(0);
  act(() => trigger().props.onPress()); expect(choice()).toBe("인용");
  expect(memo()).toBe(original); expect(memo().props.value).toBe("작성 중인 초안");
});

it("keeps both period selector owners synchronized and preserves input", async () => {
  await act(async () => { tree = create(<HjmNativeProvider><SelectionMotionPreview /></HjmNativeProvider>); });
  type("기간이 바뀌어도 남는 메모"); const original = memo();
  select("일주일", 0); expect(choice(0)).toBe("week"); expect(choice(1)).toBe("week");
  select("한 달", 1); expect(choice(0)).toBe("month"); expect(choice(1)).toBe("month");
  expect(JSON.stringify(tree.toJSON())).toContain("이번 달 기록");
  expect(memo()).toBe(original); expect(memo().props.value).toBe("기간이 바뀌어도 남는 메모");
});
