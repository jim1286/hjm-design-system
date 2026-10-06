import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
import { ProgressiveBlur } from '../src/progressive-blur.js';
import { HjmNativeProvider } from '../src/provider.js';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it('removes host layers at the boundary and during input without adding a gesture responder', () => {
 let tree!: ReactTestRenderer;
 const render = (offset: number, focused: boolean) => <HjmNativeProvider><ProgressiveBlur descriptor={{ edge: 'bottom', extent: 64, strength: .5, content: { kind: 'scroll', metrics: { offset, contentSize: 300, viewportSize: 100 }, focused } }} renderLayer={() => <View testID="blur-host"/>}/></HjmNativeProvider>;
 try {
  act(() => { tree = create(render(0, false)); }); expect(tree.root.findAllByProps({ testID: 'blur-host' }).length).toBeGreaterThan(0);
  expect(tree.root.findAll(node => node.props.pointerEvents === 'none').length).toBeGreaterThan(0);
  act(() => tree.update(render(0, true))); expect(tree.root.findAllByProps({ testID: 'blur-host' })).toHaveLength(0);
  act(() => tree.update(render(200, false))); expect(tree.root.findAllByProps({ testID: 'blur-host' })).toHaveLength(0);
 } finally { act(() => tree.unmount()); }
});
it('isolates an unavailable blur host while preserving the sibling content state', () => {
 let tree!: ReactTestRenderer; let failed = false;
 function Demo() { const [count, setCount] = useState(0); return <HjmNativeProvider><Pressable onPress={() => setCount(v => v + 1)}><Text>{count}</Text></Pressable><ProgressiveBlur descriptor={{ edge: 'bottom', extent: 64, strength: .5, content: { kind: 'decoration' } }} renderLayer={() => { if (failed) throw new Error('host unavailable'); return <View/>; }}/></HjmNativeProvider>; }
 const error = vi.spyOn(console, 'error').mockImplementation(() => {});
 try {
  act(() => { tree = create(<Demo/>); }); act(() => tree.root.findByType(Pressable).props.onPress());
  failed = true; act(() => tree.update(<Demo/>)); expect(tree.root.findByType(Text).props.children).toBe(1);
  act(() => tree.root.findByType(Pressable).props.onPress()); expect(tree.root.findByType(Text).props.children).toBe(2);
 } finally { act(() => tree.unmount()); error.mockRestore(); }
});
