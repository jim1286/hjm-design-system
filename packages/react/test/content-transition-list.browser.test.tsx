import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { ContentTransition } from '../src/content-transition.js';
import { HjmProvider } from '../src/provider.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it('shows all arriving data immediately, preserves keyed inputs through insert/reorder, and removes deleted targets', async () => {
 const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
 const render = (ids: string[], reduced = false) => act(() => root.render(<HjmProvider reducedMotion={reduced}>
  {ids.map(id => <ContentTransition key={id} stateKey={id} enterOnMount={id !== 'a'} preset="rise"><input aria-label={id}/></ContentTransition>)}
 </HjmProvider>));
 try {
  await render(['a']); const original = host.querySelector('input')!;
  original.value = 'draft'; original.focus();
  await render(['b', 'c', 'a']);
  expect(host.querySelectorAll('input')).toHaveLength(3);
  expect(host.querySelector('[aria-label="a"]')).toBe(original);
  expect(original.value).toBe('draft'); expect(document.activeElement).toBe(original);
  const added = host.querySelector('[aria-label="b"]')!.parentElement!;
  expect(Number(getComputedStyle(added).opacity)).toBeLessThan(1);
  await render(['a', 'c', 'b']);
  expect(host.querySelector('[aria-label="a"]')).toBe(original); expect(document.activeElement).toBe(original);
  await render(['a', 'c'], true);
  expect(host.querySelector('[aria-label="b"]')).toBeNull();
  await render(['a', 'c', 'd'], true);
  const reduced = host.querySelector('[aria-label="d"]')!.parentElement!;
  expect(Number(getComputedStyle(reduced).opacity)).toBe(1);
  expect(host.querySelectorAll('input')).toHaveLength(3);
 } finally { await act(() => root.unmount()); host.remove(); }
});
