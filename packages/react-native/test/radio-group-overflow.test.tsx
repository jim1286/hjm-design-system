import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Pressable, ScrollView, StyleSheet, Text as NativeText } from 'react-native';
import { afterEach, expect, it, vi } from 'vitest';
import { RadioGroup } from '../src/inputs.js';
import { Text } from '../src/primitives.js';
import { HjmNativeProvider } from '../src/provider.js';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const items = [{ value: '27', label: '27일' }, { value: '28', label: '28일', disabled: true }, { value: '29', label: '29일' }];
const layout = (x: number, width: number) => ({ nativeEvent: { layout: { x, y: 0, width, height: 80 } } });
it('reveals the selected card after layout and retains disabled dates and selection semantics', () => {
  const scrollTo = vi.fn(), onValueChange = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><RadioGroup accessibilityLabel="날짜" items={items}
    value="29" overflow="scroll" indicator="none" onValueChange={onValueChange} /></HjmNativeProvider>,
    { createNodeMock: () => ({ scrollTo }) }); });
  const rail = tree!.root.findByType(ScrollView);
  expect(rail.props.horizontal).toBe(true);
  const cards = tree!.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === 'radio');
  act(() => rail.props.onLayout(layout(0, 100)));
  cards.forEach((card, index) => act(() => card.props.onLayout(layout(index * 80, 72))));
  act(() => rail.props.onContentSizeChange(240, 80));
  expect(scrollTo).toHaveBeenCalledWith({ x: 140, animated: false });
  expect(cards[1]!.props.disabled).toBe(true);
  expect(cards[2]!.props.accessibilityState.checked).toBe(true);
  act(() => cards[0]!.props.onPress());
  expect(onValueChange).toHaveBeenCalledWith('27');
});
it('keeps a confirmed empty selected date visible and checked', () => {
  act(() => { tree = create(<HjmNativeProvider><RadioGroup accessibilityLabel="날짜" items={items} value="28" overflow="scroll" /></HjmNativeProvider>); });
  const selected = tree!.root.findAllByType(Pressable).find(node => node.props.accessibilityState?.checked);
  expect(selected!.props.disabled).toBe(true);
});

it('pairs a brand-selected card and its preview text while leaving idle cards white', () => {
  const render = (value: string) => <HjmNativeProvider brandPalette={{ light: { primary: '#006BA6', onPrimary: '#FFFFFF' } }}>
    <RadioGroup accessibilityLabel="날짜" items={items} value={value} selectionTone="brand" indicator="none"
      renderLabel={item => <Text tone="muted">{item.label}</Text>} />
  </HjmNativeProvider>;
  act(() => { tree = create(render('27')); });
  const cards = () => tree!.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === 'radio');
  const style = (index: number) => StyleSheet.flatten(cards()[index]!.props.style({ pressed: false }));
  expect(style(0).backgroundColor).toBe('#006BA6');
  expect(style(2).backgroundColor.toLowerCase()).toBe('#ffffff');
  expect(StyleSheet.flatten(cards()[0]!.findByType(NativeText).props.style).color).toBe('#FFFFFF');
  act(() => tree!.update(render('29')));
  expect(style(0).backgroundColor.toLowerCase()).toBe('#ffffff');
  expect(style(2).backgroundColor).toBe('#006BA6');
  expect(StyleSheet.flatten(cards()[2]!.findByType(NativeText).props.style).color).toBe('#FFFFFF');
});
