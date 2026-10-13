import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { HjmProvider } from '@hjmds/react/provider';
import { ActivityStatusPreview } from './activity-status-preview';
import { activityStatusCopy as copy, activityStatusStepMs as stepMs, activityStatusResultMs as resultMs } from '../../../shared/activity-status';
import '../../../../packages/react/src/styles.css';
let root: Root, host: HTMLDivElement;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.useRealTimers(); });
const render = (initial: 'idle' | 'running' = 'idle', reducedMotion = true) => act(async () => root.render(<HjmProvider reducedMotion={reducedMotion}><ActivityStatusPreview initial={initial} /></HjmProvider>));
const chip = () => host.querySelector<HTMLButtonElement>('.hjm-activity-chip');
const panel = () => document.querySelector<HTMLElement>('.hjm-toast');
const button = (label: string) => [...document.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === label || node.getAttribute('aria-label') === label)!;
const click = (label: string) => act(async () => page.getByRole('button', { name: label, exact: true }).click());
const tick = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const complete = async () => { for (let index = 0; index < 3; index++) await tick(stepMs); };

it('updates the same panel and step nodes through completion and a new run', async () => {
  await render('running'); const original = panel(); const close = button(copy.close);
  expect(chip()!.getAttribute('aria-expanded')).toBe('true');
  await tick(stepMs); expect(panel()).toBe(original); expect(button(copy.close)).toBe(close); expect(original!.querySelector('[aria-current="step"]')!.textContent).toBe('다듬기');
  await tick(stepMs); await tick(stepMs); expect(panel()).toBe(original); expect(original!.querySelector('[aria-current="step"]')).toBeNull(); expect(button(copy.openResult)).toBeDefined();
  await tick(resultMs); expect(chip()!.textContent).toContain(copy.chipDone);
  await click(copy.restart); expect(panel()).toBe(original); expect(original!.querySelector('[aria-current="step"]')!.textContent).toBe('읽기');
});

it('keeps the task running across panel dismissal and reopens at its current step', async () => {
  await render('running'); await click(copy.close); await tick(0); expect(panel()).toBeNull(); expect(chip()!.getAttribute('aria-expanded')).toBe('false');
  await tick(stepMs); await click(copy.chipRunningSpoken); expect(panel()!.querySelector('[aria-current="step"]')!.textContent).toBe('다듬기');
  await act(async () => { button(copy.close).focus(); button(copy.close).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
  await tick(0); expect(panel()).toBeNull(); expect(document.activeElement).toBe(chip());
  await tick(stepMs); await tick(stepMs); await tick(resultMs - 1); expect(chip()).not.toBeNull();
  await act(async () => chip()!.focus()); await tick(1); expect(chip()).toBeNull(); expect(document.activeElement).toBe(button(copy.start));
});

it('announces a chosen keyboard result and returns its removed focus to the chip without stealing outside focus', async () => {
  await render('running'); await complete(); await act(async () => { button(copy.openResult).focus(); await userEvent.keyboard('{Enter}'); }); await tick(0);
  expect(panel()).toBeNull(); expect(host.querySelector('[role="status"]')?.textContent).toBe(copy.resultOpened); expect(document.activeElement).toBe(chip());
  await click(copy.chipDoneSpoken); const outside = button(copy.restart); await act(async () => outside.focus());
  await act(async () => button(copy.close).click()); await tick(0); expect(document.activeElement).toBe(outside);
  await tick(resultMs); expect(document.activeElement).toBe(outside);
});

it('cancels progress and completed-chip timers when the preview is removed', async () => {
  await render(); await click(copy.start); await tick(stepMs); await act(async () => root.render(null)); await tick(0); expect(vi.getTimerCount()).toBe(0); expect(panel()).toBeNull();
  await render('running'); await complete(); await click(copy.close); await act(async () => root.render(null)); await tick(0); expect(vi.getTimerCount()).toBe(0);
});

it('settles a closing panel before reopening without duplicating it or resetting progress', async () => {
  await render('running', false); await tick(stepMs);
  await click(copy.close); expect(panel()!.dataset.state).toBe('closing');
  // Exercise a queued activation while the exiting toast still occupies its hit area.
  await act(async () => chip()!.click()); expect(chip()!.getAttribute('aria-expanded')).toBe('true');
  await tick(160); expect(panel()).toBeNull(); expect(chip()!.getAttribute('aria-expanded')).toBe('false');
  await click(copy.chipRunningSpoken); expect(document.querySelectorAll('.hjm-toast')).toHaveLength(1);
  expect(panel()!.querySelector('[aria-current="step"]')!.textContent).toBe('다듬기');
});

it('preserves an explicit blur while a panel is closing and does not infer focus ownership from body', async () => {
  await render('running', false);
  await act(async () => { button(copy.close).focus(); button(copy.close).click(); button(copy.close).blur(); });
  expect(document.activeElement).toBe(document.body);
  await tick(160); expect(panel()).toBeNull(); expect(document.activeElement).toBe(document.body);
  await click(copy.chipRunningSpoken);
  await act(async () => { button(copy.close).focus(); button(copy.close).click(); button(copy.close).blur(); });
  await tick(160); expect(panel()).toBeNull(); expect(document.activeElement).toBe(document.body);
  await tick(stepMs); await tick(stepMs); await tick(stepMs); await tick(resultMs);
  expect(chip()).toBeNull(); expect(document.activeElement).toBe(document.body);

  await act(async () => root.render(null)); await tick(0); await render('running');
  expect(document.activeElement).toBe(document.body);
  await act(async () => button(copy.close).click()); await tick(0);
  expect(panel()).toBeNull(); expect(document.activeElement).toBe(document.body);
});

it('preserves platform pointer focus ownership when an initially open result is chosen', async () => {
  await render('running'); await complete(); await click(copy.openResult);
  const pointerFocus = document.activeElement;
  await tick(0); expect(panel()).toBeNull(); expect(host.querySelector('[role="status"]')?.textContent).toBe(copy.resultOpened);
  // WebKit may keep body focused on pointer activation. That is not a lost focus.
  expect(document.activeElement).toBe(pointerFocus === document.body ? document.body : chip());
});
