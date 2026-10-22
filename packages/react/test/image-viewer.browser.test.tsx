import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { HjmProvider } from '../src/provider.js';
import { ImageViewer } from '../src/image-viewer.js';
import '../src/styles.css';
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const items = [{ id: 'a', uri: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"/>', label: 'Photo A' }, { id: 'b', uri: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="40"/>', label: 'Photo B' }];
function Fixture() {
  const [open, setOpen] = useState(false);
  return <HjmProvider><button onClick={() => setOpen(true)}>Open photo</button><ImageViewer open={open} onClose={() => setOpen(false)} items={items}
    actions={<button type="button">Report photo</button>}
    closeLabel="Close" previousLabel="Previous" nextLabel="Next" loadingLabel="Loading" errorLabel="Failed" retryLabel="Retry" /></HjmProvider>;
}
it('fills a black viewport, preserves image ratio, resets zoom on page changes and restores focus on Escape', async () => {
  await act(async () => root.render(<Fixture />));
  const opener = host.querySelector('button')!; opener.focus(); await act(async () => opener.click());
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
  expect(dialog.getBoundingClientRect().width).toBe(window.innerWidth);
  expect(dialog.getBoundingClientRect().height).toBe(window.innerHeight);
  expect(getComputedStyle(dialog).backgroundColor).toBe('rgb(0, 0, 0)');
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Close');
  expect(dialog.querySelector('.hjm-image-viewer__actions')?.textContent).toBe('Report photo');
  expect(document.querySelectorAll('img').length).toBe(1);
  expect(getComputedStyle(dialog.querySelector('img')!).objectFit).toBe('contain');
  const stage = dialog.querySelector('.hjm-image-viewer__stage')!;
  await act(async () => stage.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })));
  expect(dialog.querySelector<HTMLElement>('.hjm-image-viewer__image')!.style.transform).toContain('scale(2)');
  await act(async () => dialog.querySelector<HTMLButtonElement>('[aria-label="Next"]')!.click());
  expect(dialog.querySelector('img')!.alt).toBe('Photo B');
  expect(dialog.querySelector<HTMLElement>('.hjm-image-viewer__image')!.style.transform).toContain('scale(1)');
  expect(dialog.querySelector<HTMLButtonElement>('[aria-label="Next"]')!.disabled).toBe(true);
  await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  await act(async () => { await Promise.resolve(); });
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(opener);
});
