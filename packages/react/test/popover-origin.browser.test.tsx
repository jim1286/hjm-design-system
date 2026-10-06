import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Popover } from '../src/popover.js';
import { HjmProvider } from '../src/provider.js';
import '../src/styles.css';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('measures the placed surface, keeps the draft on rapid reopen and preserves non-modal outside focus', async () => {
 const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
 const changes = vi.fn(); let change: (open: boolean) => void = () => {};
 function Demo() {
  const [open, setOpen] = useState(false); change = setOpen;
  return <HjmProvider reducedMotion={false}><Popover title="Editor" closeLabel="Close" open={open}
   onOpenChange={(next, details) => { changes(next, details); setOpen(next); }}
   trigger={<button style={{ margin: 150 }}>Open</button>} motionOrigin={{ x: 150, y: 150, width: 100, height: 44 }}>
   <input aria-label="Draft" defaultValue="keep me"/>
  </Popover><button>Outside</button></HjmProvider>;
 }
 try {
  await act(() => root.render(<Demo/>));
  const trigger = host.querySelector('button')!;
  await act(() => { trigger.focus(); trigger.click(); });
  const panel = document.querySelector<HTMLElement>('[data-hjm-popover-content]')!;
  await expect.poll(() => panel.getAnimations().some(a => a.effect instanceof KeyframeEffect && a.effect.getKeyframes().some(frame => frame.transform))).toBe(true);
  expect(panel.style.visibility).toBe('visible'); expect(Number.parseFloat(panel.style.top)).toBeGreaterThan(150);
  expect(panel.hasAttribute('aria-modal')).toBe(false);
  const spatial = () => panel.getAnimations().find(a => a.effect instanceof KeyframeEffect && a.effect.getKeyframes().some(frame => frame.transform))!;
  // A scroll/resize while scaled must not feed the visual bounds back into placement.
  const left = panel.style.left; const top = panel.style.top;
  spatial().pause(); spatial().currentTime = 0;
  await act(() => window.dispatchEvent(new Event('resize')));
  await new Promise(resolve => requestAnimationFrame(resolve));
  expect(panel.style.left).toBe(left); expect(panel.style.top).toBe(top);
  await act(async () => { spatial().finish(); await Promise.resolve(); });
  const input = panel.querySelector('input')!; input.value = 'retained';
  await act(() => change(false));
  expect(panel.inert).toBe(true);
  await act(() => change(true));
  expect(document.querySelector('[data-hjm-popover-content]')).toBe(panel);
  expect(input.value).toBe('retained'); expect(panel.inert).toBe(false);
  await act(async () => { spatial().finish(); await Promise.resolve(); });
  const outside = [...host.querySelectorAll('button')].find(b => b.textContent === 'Outside')!;
  await act(() => { outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); outside.focus(); outside.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); });
  expect(document.activeElement).toBe(outside); expect(panel.inert).toBe(true);
  expect(changes).toHaveBeenLastCalledWith(false, { reason: 'outside-pointer' });
  await act(async () => { spatial().finish(); await new Promise(resolve => setTimeout(resolve, 250)); });
  expect(document.querySelector('[data-hjm-popover-content]')).toBeNull(); expect(document.activeElement).toBe(outside);
 } finally { await act(() => root.unmount()); host.remove(); }
});

it('keeps reduced-motion dismissal immediate and restores trigger focus on Escape', async () => {
 const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
 try {
  await act(() => root.render(<HjmProvider reducedMotion><Popover title="Static" closeLabel="Close" trigger={<button>Open</button>}
   motionOrigin={{ x: 10, y: 10, width: 100, height: 44 }}><input aria-label="Draft"/></Popover></HjmProvider>));
  const trigger = host.querySelector('button')!;
  await act(() => { trigger.focus(); trigger.click(); });
  await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('Draft');
  const panel = document.querySelector<HTMLElement>('[data-hjm-popover-content]')!;
  expect(panel.getAnimations().some(a => a.effect instanceof KeyframeEffect && a.effect.getKeyframes().some(frame => frame.transform))).toBe(false);
  await act(() => document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(document.querySelector('[data-hjm-popover-content]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
 } finally { await act(() => root.unmount()); host.remove(); }
});
