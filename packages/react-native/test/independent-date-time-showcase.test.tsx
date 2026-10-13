import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AccessibilityInfo, AppState, Platform } from 'react-native';
import { afterEach, expect, it, vi } from 'vitest';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { DateEntry } from '@hjmds/react-native/date-entry';
import { Select } from '@hjmds/react-native/forms';
import { Button } from '@hjmds/react-native/actions';
import { Notice } from '@hjmds/react-native/feedback';
import DateMeta from '../../../showcase/native/src/DateEntry.stories';
import TimeMeta from '../../../showcase/native/src/TimeSelection.stories';
const DateDemo = DateMeta.component, TimeDemo = TimeMeta.component;
let tree: ReactTestRenderer | undefined;
const os = Platform.OS, appState = AppState.currentState;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; vi.restoreAllMocks(); Object.assign(Platform, { OS: os }); Object.defineProperty(AppState, 'currentState', { configurable: true, value: appState }); });
const render = (kind: 'date' | 'time') => act(() => { tree = create(<HjmNativeProvider>{kind === 'date' ? <DateDemo /> : <TimeDemo />}</HjmNativeProvider>); });
const button = (label: string) => tree!.root.findAllByType(Button).find(node => node.props.children === label)!;
const press = (label: string) => act(() => button(label).props.onPress());
const date = () => tree!.root.findByType(DateEntry);

it('keeps a confirmed date through reordering and invalidates it on a new draft', () => {
  render('date');
  act(() => date().props.onValueChange({ year: '2024', month: 'Feb', day: '29' })); press('날짜 확인');
  expect(JSON.stringify(tree!.toJSON())).toContain('확인한 날짜: 2024-02-29');
  press('입력 순서 바꾸기'); expect(date().props.order).toEqual(['day', 'month', 'year']);
  expect(date().props.value).toEqual({ year: '2024', month: 'Feb', day: '29' });
  expect(JSON.stringify(tree!.toJSON())).toContain('확인한 날짜: 2024-02-29');
  act(() => date().props.onValueChange({ year: '2023', month: 'Feb', day: '29' })); press('날짜 확인');
  expect(JSON.stringify(tree!.toJSON())).not.toContain('확인한 날짜:');
  expect(date().props.value.day).toBe('29'); expect(date().props.showErrors).toBe(true);
});

it('announces the newly confirmed date once on active iOS', () => {
  Object.assign(Platform, { OS: 'ios' }); Object.defineProperty(AppState, 'currentState', { configurable: true, value: 'active' });
  const announce = vi.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions'); render('date');
  act(() => date().props.onValueChange({ year: '2024', month: 'Feb', day: '29' })); press('날짜 확인');
  expect(announce).toHaveBeenCalledWith('확인한 날짜: 2024-02-29', { queue: true });
  announce.mockClear(); press('입력 순서 바꾸기'); expect(announce).not.toHaveBeenCalled();
});

it('requires both time parts, invalidates confirmation when cleared and resets both fields', () => {
  render('time'); const selects = () => tree!.root.findAllByType(Select);
  expect(button('선택 완료').props.disabled).toBe(true);
  act(() => selects()[0]!.props.onSelectionChange('00')); expect(button('선택 완료').props.disabled).toBe(true);
  act(() => selects()[1]!.props.onSelectionChange('00')); press('선택 완료');
  expect(tree!.root.findByType(Notice).props.description).toBe('00:00');
  act(() => selects()[1]!.props.onSelectionChange(null)); expect(button('선택 완료').props.disabled).toBe(true);
  expect(tree!.root.findAllByType(Notice)).toHaveLength(0);
  act(() => selects()[1]!.props.onSelectionChange('30')); press('선택 완료'); press('다시 고르기');
  expect(selects().map(node => node.props.selectedKey)).toEqual([null, null]); expect(tree!.root.findAllByType(Notice)).toHaveLength(0);
});
