import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { PanResponder, Pressable, ScrollView, Text, View, type GestureResponderEvent, type PanResponderGestureState } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { ScreenLayout, type ScreenLayoutProps } from "../src/screens.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; vi.restoreAllMocks(); });
function render(props: Partial<ScreenLayoutProps> = {}) {
  const node = <HjmNativeProvider reducedMotion><ScreenLayout title="Letter" titleVisibility="hidden" pullToDismiss
    exit={{ kind: 'close', label: 'Close', onPress: vi.fn() }} {...props}><Text>Existing draft</Text></ScreenLayout></HjmNativeProvider>;
  act(() => { if (tree) tree.update(node); else tree = create(node); });
  return tree!;
}
const event = {} as GestureResponderEvent;
const gesture = (dy: number, vy = 0, dx = 0) => ({ dx, dy, vy }) as PanResponderGestureState;
function pan() {
  const spy = vi.spyOn(PanResponder, 'create');
  const close = vi.fn();
  render({ exit: { kind: 'close', label: 'Close', onPress: close } });
  return { close, config: spy.mock.calls.at(-1)![0] };
}

it('rejects ordinary bounce and incidental fast movement, then accepts a deliberate handle flick once', () => {
  const { close, config } = pan();
  expect(config.onStartShouldSetPanResponderCapture?.(event, gesture(0))).toBe(true);
  expect(config.onMoveShouldSetPanResponder?.(event, gesture(20, 0, 100))).toBe(false);
  act(() => { config.onPanResponderGrant?.(event, gesture(0)); });
  act(() => { config.onPanResponderRelease?.(event, gesture(100, 0, 200)); });
  expect(close).not.toHaveBeenCalled();
  act(() => { config.onPanResponderGrant?.(event, gesture(0)); });
  act(() => { config.onPanResponderRelease?.(event, gesture(8, 2)); });
  act(() => { config.onPanResponderGrant?.(event, gesture(0)); });
  act(() => { config.onPanResponderRelease?.(event, gesture(20)); });
  expect(close).not.toHaveBeenCalled();
  act(() => { config.onPanResponderGrant?.(event, gesture(0)); });
  act(() => { config.onPanResponderRelease?.(event, gesture(40, 0.8)); });
  act(() => { config.onPanResponderRelease?.(event, gesture(100)); });
  expect(close).toHaveBeenCalledTimes(1);
});

it('retires a terminated handle gesture, but permits the next deliberate pull', () => {
  const { close, config } = pan();
  act(() => { config.onPanResponderGrant?.(event, gesture(0)); });
  act(() => { config.onPanResponderMove?.(event, gesture(60)); });
  act(() => { config.onPanResponderTerminate?.(event, gesture(60)); });
  act(() => { config.onPanResponderRelease?.(event, gesture(100)); });
  expect(close).not.toHaveBeenCalled();
  act(() => { config.onPanResponderGrant?.(event, gesture(0)); });
  act(() => { config.onPanResponderRelease?.(event, gesture(100)); });
  expect(close).toHaveBeenCalledTimes(1);
});

it('only dismisses a new scroll pull begun at the top and preserves host scrolling callbacks', () => {
  const close = vi.fn(), begin = vi.fn(), end = vi.fn();
  render({ exit: { kind: 'close', label: 'Close', onPress: close }, scrollProps: { keyboardDismissMode: 'interactive', onScrollBeginDrag: begin, onScrollEndDrag: end } });
  const scroll = tree!.root.findByType(ScrollView);
  const at = (y: number) => ({ nativeEvent: { contentOffset: { x: 0, y } } });
  for (const [start, finish] of [[100, -100], [0, -25], [0, 100]]) {
    act(() => scroll.props.onScrollBeginDrag(at(start!)));
    act(() => scroll.props.onScrollEndDrag(at(finish!)));
  }
  expect(close).not.toHaveBeenCalled();
  act(() => scroll.props.onScrollBeginDrag(at(0)));
  act(() => scroll.props.onScrollEndDrag(at(-85)));
  act(() => scroll.props.onScrollEndDrag(at(-85)));
  expect(close).toHaveBeenCalledTimes(1);
  expect(begin).toHaveBeenCalledTimes(4);
  expect(end).toHaveBeenCalledTimes(5);
  expect(scroll.props.keyboardDismissMode).toBe('interactive');
});

it('retains one accessible close action and cancels held input when exit becomes disabled', () => {
  const { close, config } = pan();
  const handle = tree!.root.findAllByType(Pressable).find(node => node.props.testID === 'hjm-screen-dismiss-handle')!;
  expect(handle.props.accessible).toBe(false);
  expect(handle.props.accessibilityElementsHidden).toBe(true);
  expect(tree!.root.findAllByType(Pressable).filter(node => node.props.accessibilityLabel === 'Close')).toHaveLength(1);
  act(() => { config.onPanResponderGrant?.(event, gesture(0)); });
  render({ exit: { kind: 'close', label: 'Close', onPress: close, disabled: true } });
  act(() => { config.onPanResponderRelease?.(event, gesture(100)); });
  expect(close).not.toHaveBeenCalled();
  expect(tree!.root.findAllByType(Pressable).filter(node => node.props.testID === 'hjm-screen-dismiss-handle')).toHaveLength(0);
  expect(tree!.root.findAllByType(Text).some(node => node.props.children === 'Existing draft')).toBe(true);
});

it('keeps the gesture off ordinary screens', () => {
  const spy = vi.spyOn(PanResponder, 'create');
  render({ pullToDismiss: false });
  expect(spy).not.toHaveBeenCalled();
  expect(tree!.root.findAllByType(View).some(node => node.props.testID === 'hjm-screen-dismiss-handle')).toBe(false);
});

it('preserves a tap on the dedicated handle as the close request', () => {
  const { close, config } = pan();
  act(() => { config.onPanResponderGrant?.(event, gesture(0)); });
  act(() => { config.onPanResponderRelease?.(event, gesture(0)); });
  expect(close).toHaveBeenCalledTimes(1);
});
