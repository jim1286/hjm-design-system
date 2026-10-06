import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Dialog } from '../src/overlays.js';
import { HjmProvider } from '../src/provider.js';
import '../src/styles.css';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('keeps one subtree through exit, cancels stale completion on reopen and restores focus after final exit', async () => {
 const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
 const settled = vi.fn(); let change: (value: boolean) => void = () => {};
 function Demo() {
  const [open, setOpen] = useState(false); change = setOpen;
  return <HjmProvider reducedMotion={false}><Dialog open={open} onOpenChange={setOpen} title="Edit" closeLabel="Close"
   trigger={<button>Open</button>} motionOrigin={{ x: 20, y: 40, width: 100, height: 44 }} onDismissComplete={settled}>
   <input aria-label="Draft" defaultValue="keep me"/>
  </Dialog></HjmProvider>;
 }
 try {
  await act(() => root.render(<Demo/>));
  const trigger = host.querySelector('button')!;
  await act(() => { trigger.focus(); trigger.click(); });
  const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
  expect(dialog.getAnimations()).toHaveLength(1);
  await act(async () => { dialog.getAnimations()[0]!.finish(); await Promise.resolve(); });
  const input = dialog.querySelector('input')!; input.value = 'retained';
  await act(() => change(false));
  expect(document.querySelector('[role="dialog"]')).toBe(dialog);
  expect(dialog.inert).toBe(true); expect(settled).not.toHaveBeenCalled();
  await act(() => change(true));
  expect(document.querySelector('[role="dialog"]')).toBe(dialog);
  expect(input.value).toBe('retained'); expect(dialog.inert).toBe(false);
  await act(async () => { dialog.getAnimations()[0]!.finish(); await Promise.resolve(); });
  expect(settled).not.toHaveBeenCalled();
  await act(() => dialog.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click());
  await act(async () => { dialog.getAnimations()[0]!.finish(); await Promise.resolve(); });
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger); expect(settled).toHaveBeenCalledExactlyOnceWith({ reason: 'close-action' });
 } finally { await act(() => root.unmount()); host.remove(); }
});

it('keeps reduced-motion Dialog immediate even with measured origin bounds', async () => {
 const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
 try {
  await act(() => root.render(<HjmProvider reducedMotion><Dialog defaultOpen trigger={<button>Static trigger</button>} title="Static" closeLabel="Close" motionOrigin={{ x: 5, y: 6, width: 100, height: 44 }}/></HjmProvider>));
  const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
  expect(dialog.getAnimations()).toHaveLength(0);
  await act(() => dialog.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click());
  expect(document.querySelector('[role="dialog"]')).toBeNull();
 } finally { await act(() => root.unmount()); host.remove(); }
});
