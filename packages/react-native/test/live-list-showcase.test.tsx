import { AccessibilityInfo, AppState, Platform, ScrollView, TextInput } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { Chip } from "@hjmds/react-native/inputs";
import { LiveListPreview } from "../../../showcase/native/src/live-list-preview";
let tree: ReactTestRenderer;
const originalPlatform = Platform.OS, originalState = AppState.currentState;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(async () => { Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' }); Object.defineProperty(AppState, 'currentState', { configurable: true, value: 'active' }); await act(async () => { tree = create(<HjmNativeProvider reducedMotion><LiveListPreview /></HjmNativeProvider>); }); });
afterEach(() => { act(() => tree?.unmount()); Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform }); Object.defineProperty(AppState, 'currentState', { configurable: true, value: originalState }); vi.restoreAllMocks(); });
const button = (label: string) => tree.root.findAllByType(Button).find(node => node.props.children === label)!;
const press = (label: string) => act(() => button(label).props.onPress());
const fields = () => tree.root.findAllByType(TextInput);
// The motion tool is an on/off PreviewTools chip with one constant label.
const toggleMotion = () => act(() => tree.root.findAllByType(Chip).find(node => node.props.label === '움직임 멈추기')!.props.onPress());

it('preserves native drafts and input hosts across queued additions, reversal and motion changes', () => {
  const original = fields()[0]!; act(() => original.props.onChangeText('계속 쓰는 메모'));
  act(() => { button('기록 추가').props.onPress(); button('3개 함께 추가').props.onPress(); });
  expect(fields()).toHaveLength(5); expect(fields().at(-1)).toBe(original);
  press('순서 뒤집기'); expect(fields()[0]).toBe(original);
  toggleMotion(); press('기록 추가'); toggleMotion();
  expect(fields()).toHaveLength(6); expect(fields()[1]).toBe(original); expect(original.props.value).toBe('계속 쓰는 메모');
  const lateEdit = fields()[0]!.props.onChangeText; press('첫 기록 삭제'); act(() => lateEdit('삭제된 기록의 늦은 변경'));
  expect(fields()).toHaveLength(5); expect(fields().some(node => node.props.value === '삭제된 기록의 늦은 변경')).toBe(false);
});
it('provides a scroll host for growing editable records', () => {
  expect(tree.root.findAllByType(ScrollView)).toHaveLength(1);
  expect(tree.root.findByType(ScrollView).props.keyboardShouldPersistTaps).toBe('handled');
});
it('announces successive updates once each and recovers from an empty list', () => {
  const announce = vi.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions');
  press('기록 추가'); press('기록 추가');
  expect(announce).toHaveBeenCalledTimes(2);
  const messages = announce.mock.calls.map(call => call[0]); expect(messages[0]).not.toBe(messages[1]);
  for (let index = 0; index < 3; index++) press('첫 기록 삭제');
  expect(fields()).toHaveLength(0); expect(button('첫 기록 삭제').props.disabled).toBe(true);
  press('기록 추가'); expect(fields()[0]!.props.value).toBe('');
});
