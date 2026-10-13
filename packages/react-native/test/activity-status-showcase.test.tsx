import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AccessibilityInfo, AppState, Platform, Pressable } from 'react-native';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { Button } from '@hjmds/react-native/actions';
import { ActivityChip } from '@hjmds/react-native/activity-chip';
import { ActivityStatusPreview } from '../../../showcase/native/src/activity-status-preview';
import { activityStatusCopy as copy, activityStatusStepMs as stepMs, activityStatusResultMs as resultMs } from '../../../showcase/shared/activity-status';
let tree: ReactTestRenderer | undefined;
const originalOS = Platform.OS, originalState = AppState.currentState;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => { vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }); Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' }); Object.defineProperty(AppState, 'currentState', { configurable: true, value: 'active' }); });
afterEach(() => { act(() => tree?.unmount()); tree = undefined; vi.useRealTimers(); vi.restoreAllMocks(); Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS }); Object.defineProperty(AppState, 'currentState', { configurable: true, value: originalState }); });
const render = (initial: 'idle' | 'running' = 'idle') => act(() => { tree = create(<HjmNativeProvider reducedMotion><ActivityStatusPreview initial={initial} /></HjmNativeProvider>); });
const buttons = () => tree!.root.findAllByType(Button);
const press = (label: string) => act(() => buttons().find(node => node.props.children === label)!.props.onPress());
const chip = () => tree!.root.findByType(ActivityChip);
const panelClose = () => tree!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === copy.close);
const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

it('updates one real panel through progress, close/reopen, completion and restart', () => {
  render('running');
  const close = panelClose(); expect(close).toBeDefined();
  tick(stepMs); expect(panelClose()).toBe(close);
  act(() => close!.props.onPress()); expect(chip().props.expanded).toBe(false); expect(panelClose()).toBeUndefined();
  tick(stepMs); act(() => chip().props.onPress()); expect(chip().props.expanded).toBe(true);
  tick(stepMs); expect(chip().props.label).toBe(copy.chipDone);
  tick(resultMs); expect(chip().props.label).toBe(copy.chipDone);
  press(copy.restart); expect(chip().props.label).toBe(copy.chipRunning); expect(panelClose()).toBeDefined();
});

it('announces the chosen result and hides the completed closed chip after its grace period', () => {
  const announce = vi.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions');
  render('running'); for (let index = 0; index < 3; index++) tick(stepMs);
  announce.mockClear();
  act(() => tree!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === copy.openResult)!.props.onPress());
  expect(announce.mock.calls.some(call => call[0] === copy.resultOpened)).toBe(true);
  expect(chip().props.expanded).toBe(false); tick(resultMs - 1); expect(chip().props.label).toBe(copy.chipDone);
  tick(1); expect(tree!.root.findAllByType(ActivityChip)).toHaveLength(0);
  press(copy.start); expect(chip().props.label).toBe(copy.chipRunning);
});

it('clears progress and result timers when the actual preview unmounts', () => {
  render(); press(copy.start); tick(stepMs); act(() => tree!.unmount()); tree = undefined; expect(vi.getTimerCount()).toBe(0);
  render('running'); for (let index = 0; index < 3; index++) tick(stepMs);
  act(() => panelClose()!.props.onPress()); act(() => tree!.unmount()); tree = undefined; expect(vi.getTimerCount()).toBe(0);
});
