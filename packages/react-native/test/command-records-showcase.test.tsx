import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Text as NativeText, ScrollView } from 'react-native';
import { afterEach, expect, it } from 'vitest';
import { HjmNativeProvider } from '@hjmds/react-native/provider';
import { Button } from '@hjmds/react-native/actions';
import { Tabs, TabPanel } from '@hjmds/react-native/navigation';
import { SegmentedControl } from '@hjmds/react-native/inputs';
import { CodeBlock } from '@hjmds/react-native/code-block';
import { CommandRecordsPreview } from '../../../showcase/native/src/command-records-preview';
import { commandRecords, commandCopy as copy } from '../../../showcase/shared/command-records';
import { profileCopy, profileOptions } from '../../../showcase/shared/design-profile';
let tree: ReactTestRenderer;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => { act(() => tree?.unmount()); });
const render = () => act(async () => { tree = create(<HjmNativeProvider reducedMotion><CommandRecordsPreview /></HjmNativeProvider>); });
const button = (label: string) => tree.root.findAllByType(Button).find(node => node.props.children === label)!;
const press = (label: string) => act(() => button(label).props.onPress());
const code = () => tree.root.findByType(CodeBlock);
const display = () => tree.root.findAllByType(SegmentedControl).find(node => node.props.label === copy.display)!;
const nextTheme = () => act(() => { const control = tree.root.findAllByType(SegmentedControl).find(node => node.props.label === profileCopy.choose)!; const index = profileOptions.findIndex(option => option.id === control.props.value); control.props.onValueChange(profileOptions[(index + 1) % profileOptions.length]!.id); });

it('keeps native record ownership and exact selectable content across tabs, display and profile changes', async () => {
  await render(); const original = code();
  act(() => tree.root.findByType(Tabs).props.onValueChange('output'));
  expect(code()).toBe(original); expect(code().props.code).toBe(commandRecords[1].code); expect(tree.root.findByType(TabPanel).props.label).toBe('출력');
  act(() => display().props.onValueChange('scroll'));
  nextTheme(); expect(code().props.wrap).toBe(false); expect(code().findAllByType(ScrollView).some(node => node.props.horizontal)).toBe(true);
  expect(tree.root.findAllByType(NativeText).find(node => node.props.selectable)!.props.accessibilityLabel).toBe(`출력\n${commandRecords[1].code}`);
  act(() => display().props.onValueChange('wrap'));
  expect(code()).toBe(original); expect(code().props.wrap).toBe(true); expect(code().findAllByType(ScrollView).some(node => node.props.horizontal)).toBe(false);
});

it('keeps current record and display choices usable while the actual refresh fixture is pending', async () => {
  await render(); press(copy.refresh); const original = code();
  act(() => { tree.root.findByType(Tabs).props.onValueChange('output'); display().props.onValueChange('scroll'); });
  nextTheme(); expect(button(copy.refresh).props.loading).toBe(true); expect(code()).toBe(original); expect(code().props.code).toBe(commandRecords[1].code); expect(code().props.wrap).toBe(false);
  press(copy.respond); expect(button(copy.refresh).props.loading).toBe(false); expect(code().props.code).toBe(commandRecords[1].code); expect(tree.root.findByType(Tabs).props.value).toBe('output'); expect(display().props.value).toBe('scroll');
});
