import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
vi.mock('react-native-svg', async () => {
  const { createElement, forwardRef, useImperativeHandle } = await import('react');
  const Svg = forwardRef((props: Record<string, unknown>, ref) => {
    useImperativeHandle(ref, () => ({ toDataURL: (done: (base64: string) => void) => done('cG5n') }));
    return createElement('Svg', props, props.children as never);
  });
  const shape = (name: string) => (props: Record<string, unknown>) => createElement(name, props, props.children as never);
  return { default: Svg, Path: shape('Path'), Rect: shape('Rect'), Circle: shape('Circle'), Defs: shape('Defs'), Pattern: shape('Pattern'), LinearGradient: shape('LinearGradient'), Stop: shape('Stop') };
});
vi.mock('lucide-react-native', async () => {
  const { View } = await import('react-native');
  return { PaintBucket: View, Palette: View, Redo2: View, Trash2: View, Undo2: View };
});
import type { DrawingImage } from '@hjmds/design-contracts/components/drawing-editor';
import { DrawingEditor } from '../src/drawing-editor.js';
import { EditorScreen } from '../src/screen-flows.js';
import { HjmNativeProvider } from '../src/provider.js';
import { drawingEditorLabels as labels } from '../../../showcase/shared/drawing-editor.js';

function mount(save = vi.fn(async (_image: DrawingImage) => {})) {
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><DrawingEditor labels={labels} cropPreview="circle" onSave={save} onCancel={() => {}} /></HjmNativeProvider>); });
  const stage = tree.root.find(node => node.props.style?.minHeight === 160 && !!node.props.onLayout);
  act(() => stage.props.onLayout({ nativeEvent: { layout: { width: 320, height: 320 } } }));
  return tree;
}
function canvas(tree: ReactTestRenderer) { return tree.root.find(node => node.props.testID === 'drawing-editor-canvas' && !!node.props.onResponderGrant); }
function draw(tree: ReactTestRenderer) {
  act(() => canvas(tree).props.onResponderGrant({ nativeEvent: { identifier: 1, locationX: 20, locationY: 30 } }));
  act(() => canvas(tree).props.onResponderMove({ nativeEvent: { identifier: 1, locationX: 80, locationY: 90 } }));
  act(() => canvas(tree).props.onResponderEnd({ nativeEvent: { identifier: 1 } }));
}
const ink = (tree: ReactTestRenderer) => tree.root.findAll(node => node.type === 'Path' && node.props.strokeLinecap === 'round');

it('keeps the owning finger and supports undo without yielding a vertical stroke', () => {
  const tree = mount();
  expect(canvas(tree).props.onResponderTerminationRequest()).toBe(false);
  act(() => canvas(tree).props.onResponderGrant({ nativeEvent: { identifier: 1, locationX: 20, locationY: 30 } }));
  act(() => canvas(tree).props.onResponderMove({ nativeEvent: { identifier: 2, locationX: 200, locationY: 200 } }));
  act(() => canvas(tree).props.onResponderEnd({ nativeEvent: { identifier: 2 } }));
  expect(tree.root.findByType(EditorScreen).props.submit.disabled).toBe(true);
  act(() => canvas(tree).props.onResponderEnd({ nativeEvent: { identifier: 1 } }));
  expect(ink(tree)).toHaveLength(1);
  expect(ink(tree)[0]!.props.d).not.toContain('160.0');
  act(() => tree.root.find(node => node.props.label === labels.undo && !!node.props.onPress).props.onPress());
  expect(ink(tree)).toHaveLength(0);
  expect(tree.root.findByType(EditorScreen).props.submit.disabled).toBe(true);
  act(() => tree.unmount());
});

it('retains the picture after rejected upload and exports PNG through the supplied callback', async () => {
  const save = vi.fn(async (_image: DrawingImage) => {}); save.mockRejectedValueOnce(new Error('offline'));
  const tree = mount(save); draw(tree);
  await act(async () => tree.root.findByType(EditorScreen).props.submit.onAction());
  expect(ink(tree)).toHaveLength(1);
  expect(tree.root.findAll(node => node.props.title === labels.failed).length).toBeGreaterThan(0);
  await act(async () => tree.root.findByType(EditorScreen).props.submit.onAction());
  expect(save).toHaveBeenLastCalledWith({ base64: 'cG5n', mimeType: 'image/png' });
  act(() => tree.unmount());
});
