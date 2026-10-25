import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Pressable } from 'react-native';
import { expect, it, vi } from 'vitest';
vi.mock('react-native-svg', async () => { const { View } = await import('react-native'); return { default: View, Defs: View, LinearGradient: View, Pattern: View, Rect: View, Stop: View }; });
import { ColorPicker, ColorSwatchPicker } from '../src/color-picker.js';
import { TextField } from '../src/inputs.js';
import { Slider } from '../src/slider.js';
import { HjmNativeProvider } from '../src/provider.js';
const labels = { hex: 'HEX', hue: '색조', saturation: '채도', brightness: '밝기', opacity: '불투명도', invalid: '유효한 색을 입력하세요', presets: '추천 색' };
const area = (tree: ReactTestRenderer) => tree.root.find(node => node.props.accessibilityRole === 'adjustable' && node.props.accessibilityLabel === `${labels.brightness}, ${labels.saturation}` && !!node.props.onResponderGrant);
it('keeps an invalid HEX draft local, then commits a normalized corrected value', () => {
  const change = vi.fn(); let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ColorPicker label="색상" labels={labels} value="#123456" onValueChange={change} /></HjmNativeProvider>); });
  act(() => tree.root.findByType(TextField).props.onValueChange('invalid'));
  act(() => tree.root.findByType(TextField).props.onBlur());
  expect(change).not.toHaveBeenCalled(); expect(tree.root.findByType(TextField).props.error).toBe(labels.invalid);
  act(() => tree.root.findByType(TextField).props.onValueChange('#ABC'));
  act(() => tree.root.findByType(TextField).props.onSubmitEditing());
  expect(change).toHaveBeenCalledWith('#aabbcc');
  act(() => tree.unmount());
});
it('edits HSV through the area and hue bar, keeping alpha and the hue through black', () => {
  const change = vi.fn(); let tree!: ReactTestRenderer;
  function Example() { return <ColorPicker label="색상" labels={labels} value="#ff000080" alpha onValueChange={change} />; }
  act(() => { tree = create(<HjmNativeProvider><Example /></HjmNativeProvider>); });
  act(() => area(tree).props.onLayout({ nativeEvent: { layout: { width: 200, height: 150 } } }));
  // The area never yields its touch to a parent scroll view.
  expect(area(tree).props.onResponderTerminationRequest()).toBe(false);
  act(() => area(tree).props.onResponderGrant({ nativeEvent: { locationX: 0, locationY: 150, touches: [] }, touchHistory: { touchBank: [], numberActiveTouches: 1, indexOfSingleActiveTouch: 0, mostRecentTimeStamp: 0 } }));
  expect(change).toHaveBeenLastCalledWith('#00000080');
  act(() => { tree.update(<HjmNativeProvider><ColorPicker label="색상" labels={labels} value="#00000080" alpha onValueChange={change} /></HjmNativeProvider>); });
  expect(tree.root.findAllByType(Slider)[0]!.props.value).toBe(0);
  act(() => area(tree).props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } }));
  expect(change).toHaveBeenLastCalledWith('#1a1a1a80');
  act(() => tree.root.findAllByType(Slider)[0]!.props.onValueChange(240));
  expect(change.mock.lastCall![0].slice(7)).toBe('80');
  act(() => tree.unmount());
});
it('blocks every editing path while disabled', () => {
  const change = vi.fn(); let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ColorPicker label="색상" labels={labels} value="#123456" disabled presets={['#f00']} onValueChange={change} /></HjmNativeProvider>); });
  act(() => tree.root.findAllByType(Slider)[0]!.props.onValueChange(255));
  act(() => tree.root.findByType(TextField).props.onValueChange('#abc'));
  act(() => tree.root.findByType(TextField).props.onSubmitEditing());
  expect(change).not.toHaveBeenCalled();
  expect(tree.root.findByType(TextField).props.disabled).toBe(true);
  act(() => tree.unmount());
});
it('selects one swatch with radio semantics and reports nothing for the current swatch', () => {
  const change = vi.fn(); let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><ColorSwatchPicker label="펜 색" labelVisibility="hidden" layout="scroll" colors={['#333d4b', '#E03131', '#e03131']} value="#e03131" getColorLabel={color => `색 ${color}`} onValueChange={change} /></HjmNativeProvider>); });
  const radios = tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === 'radio');
  expect(radios.map(radio => radio.props.accessibilityLabel)).toEqual(['색 #333d4b', '색 #e03131']);
  expect(radios.map(radio => radio.props.accessibilityState.checked)).toEqual([false, true]);
  act(() => radios[1]!.props.onPress());
  act(() => radios[0]!.props.onPress());
  expect(change).toHaveBeenCalledExactlyOnceWith('#333d4b');
  act(() => tree.unmount());
});
