import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';
import { Pressable } from 'react-native';
import { HjmNativeProvider } from '../src/provider.js';
import { Pagination } from '../src/pagination.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer;
afterEach(() => { if (renderer) act(() => renderer.unmount()); });
it('keeps pages controlled, guards boundaries and pending requests, and reports reasons', () => {
  const change = vi.fn();
  const render = (page: number, disabled = false) => <HjmNativeProvider><Pagination label="Pages"
    descriptor={{ currentPage: page, totalPages: 20 }} labels={{ previous: 'Previous', next: 'Next' }}
    composeAccessibleName={({ page, current }) => `${current ? 'Current' : 'Go'} ${page}`}
    disabled={disabled} onPageChange={change} /></HjmNativeProvider>;
  act(() => { renderer = create(render(1)); });
  const press = (label: string) => act(() => renderer.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === label)!.props.onPress());
  press('Previous'); press('Current 1'); expect(change).not.toHaveBeenCalled();
  press('Next'); expect(change).toHaveBeenLastCalledWith(2, 'next');
  press('Go 20'); expect(change).toHaveBeenLastCalledWith(20, 'page');
  act(() => renderer.update(render(20, true)));
  change.mockClear(); press('Previous'); press('Next'); expect(change).not.toHaveBeenCalled();
  expect(renderer.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === 'Current 20')!.props.accessibilityState.selected).toBe(true);
  act(() => renderer.update(render(20)));
  press('Previous'); expect(change).toHaveBeenLastCalledWith(19, 'previous');
  change.mockClear(); press('Next'); expect(change).not.toHaveBeenCalled();
});
