import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Pressable, Switch as NativeSwitch } from 'react-native';
import { expect, it, vi } from 'vitest';
import { Switch } from '../src/inputs.js';
import { HjmNativeProvider } from '../src/provider.js';

vi.mock('react-native', async original => {
  const native = await original<typeof import('react-native')>();
  return { ...native, Platform: { ...native.Platform, OS: 'web' } };
});
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('exposes one named checked switch and toggles once on Space without a nested input', () => {
  let tree!: ReactTestRenderer;
  const change = vi.fn();
  const element = {};
  const event = { key: ' ', repeat: false, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false,
    defaultPrevented: false, target: element, currentTarget: element, preventDefault: vi.fn() };
  try {
    act(() => { tree = create(<HjmNativeProvider><Switch label="사용 통계" description="설명" defaultChecked onCheckedChange={change} /></HjmNativeProvider>); });
    const controls = () => tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === 'switch');
    expect(controls()).toHaveLength(1);
    expect(tree.root.findAllByType(NativeSwitch)).toHaveLength(0);
    expect(controls()[0]!.props).toMatchObject({ accessibilityLabel: '사용 통계', accessibilityHint: '설명', 'aria-checked': true });
    act(() => controls()[0]!.props.onKeyDown(event));
    expect(change).toHaveBeenCalledExactlyOnceWith(false);
    expect(controls()[0]!.props['aria-checked']).toBe(false);
    // Controlled and uncontrolled modes are separate mounts under the public state contract.
    act(() => tree.update(<HjmNativeProvider><Switch key="controlled-disabled" label="사용 통계" checked disabled onCheckedChange={change} /></HjmNativeProvider>));
    expect(controls()[0]!.props).toMatchObject({ 'aria-checked': true, 'aria-disabled': true, disabled: true });
    act(() => controls()[0]!.props.onKeyDown(event));
    expect(change).toHaveBeenCalledTimes(1);
  } finally { act(() => tree?.unmount()); }
});
