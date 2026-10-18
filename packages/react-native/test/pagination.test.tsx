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

it('shows previous, the composed current page label and next when the total is unknown', () => {
  const change = vi.fn();
  const render = (page: number, hasNext: boolean) => <HjmNativeProvider><Pagination label="Result pages"
    descriptor={{ currentPage: page, hasNext }} labels={{ previous: 'Previous results', next: 'Next results' }}
    composeCurrentPageLabel={({ page }) => `Page ${page}`} onPageChange={change} /></HjmNativeProvider>;
  act(() => { renderer = create(render(1, true)); });
  const buttons = () => renderer.root.findAllByType(Pressable);
  const press = (label: string) => act(() => buttons().find(node => node.props.accessibilityLabel === label)!.props.onPress());
  // Only the two steps are buttons; the current page is a selected text label.
  expect(buttons().map(node => node.props.accessibilityLabel)).toEqual(['Previous results', 'Next results']);
  const pageLabel = renderer.root.find(node => node.props.accessibilityLabel === 'Page 1' && node.props.accessibilityRole === 'text');
  expect(pageLabel.props.accessibilityState).toEqual({ selected: true });
  press('Previous results'); expect(change).not.toHaveBeenCalled();
  press('Next results'); expect(change).toHaveBeenLastCalledWith(2, 'next');
  act(() => renderer.update(render(4, false)));
  change.mockClear(); press('Next results'); expect(change).not.toHaveBeenCalled();
  press('Previous results'); expect(change).toHaveBeenLastCalledWith(3, 'previous');
  expect(buttons().find(node => node.props.accessibilityLabel === 'Next results')!.props.accessibilityState.disabled).toBe(true);
});
