import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { CommandRecordsPreview } from './command-records-preview';
import { commandCopy as copy, commandRecords } from '../../../shared/command-records';
import { profileCopy } from '../../../shared/design-profile';
import '../../../../packages/react/src/styles.css';
let root: Root, host: HTMLDivElement;
const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
let write: ReturnType<typeof vi.fn<(value: string) => Promise<void>>>;
beforeEach(async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  write = vi.fn<(value: string) => Promise<void>>().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: write } });
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  await act(async () => { root.render(<CommandRecordsPreview />); });
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard); else Reflect.deleteProperty(navigator, 'clipboard'); vi.restoreAllMocks(); });
const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === label)!;
const click = (label: string) => act(async () => page.getByRole('button', { name: label, exact: true }).click());
const tab = (label: string) => act(async () => page.getByRole('tab', { name: label, exact: true }).click());
const source = () => host.querySelector('pre')!;
const deferred = () => { let resolve!: () => void, reject!: (error: Error) => void; const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

it('keeps manual tab focus separate from selection and preserves readable source across display and theme changes', async () => {
  const original = source(), copyButton = button(copy.copy);
  await act(async () => { host.querySelector<HTMLElement>('[role="tab"]')!.focus(); await userEvent.keyboard('{ArrowRight}'); });
  expect(document.activeElement?.textContent).toBe('출력'); expect(source().textContent).toBe(commandRecords[0].code);
  await act(async () => userEvent.keyboard('{Enter}')); expect(source().textContent).toBe(commandRecords[1].code);
  expect(source()).toBe(original); expect(button(copy.copy)).toBe(copyButton);
  await act(async () => page.getByText(copy.scroll, { exact: true }).click());
  await click(profileCopy.nextTheme); expect(source().style.whiteSpace).toBe('pre'); expect(source().textContent).toBe(commandRecords[1].code);
  await act(async () => page.getByText(copy.wrap, { exact: true }).click()); expect(source().style.whiteSpace).toBe('pre-wrap');
});

it.each(['resolve', 'reject'] as const)('ignores an old clipboard %s after changing the actual record and serializes the new write', async outcome => {
  const pending = deferred(); write.mockImplementationOnce(() => pending.promise);
  const action = button(copy.copy); await click(copy.copy); expect(write).toHaveBeenCalledExactlyOnceWith(commandRecords[0].code);
  await tab('출력'); await click(profileCopy.nextTheme); expect(button(copy.copy)).toBe(action);
  await act(async () => action.click()); expect(write).toHaveBeenCalledTimes(1);
  await act(async () => { if (outcome === 'resolve') pending.resolve(); else pending.reject(new Error('old write denied')); await pending.promise.catch(() => {}); });
  expect(host.textContent).not.toContain(copy.copyError); expect(button(copy.copied)).toBeUndefined(); expect(source().textContent).toBe(commandRecords[1].code);
  await click(copy.copy); expect(write).toHaveBeenLastCalledWith(commandRecords[1].code); expect(button(copy.copied)).toBe(action);
  await tab('명령'); expect(button(copy.copy)).toBe(action); expect(host.querySelector('[role="status"]')!.textContent).toBe('');
});

it('shows a current copy rejection and dismisses only its warning back to the same copy action', async () => {
  write.mockRejectedValueOnce(new Error('current write denied'));
  const action = button(copy.copy); await click(copy.copy); expect(host.textContent).toContain(copy.copyError);
  await click(copy.dismiss); expect(host.textContent).not.toContain(copy.copyError); expect(document.activeElement).toBe(action); expect(source().textContent).toBe(commandRecords[0].code);
  await click(copy.copy); expect(button(copy.copied)).toBe(action); expect(write).toHaveBeenCalledTimes(2);
});

it('recovers the response action focus while preserving source focus and explicit blur on later responses', async () => {
  await click(copy.fail); await click(copy.refresh); await tab('출력');
  expect(source().textContent).toBe(commandRecords[1].code);
  await act(async () => { button(copy.respond).focus(); await userEvent.keyboard('{Enter}'); });
  expect(host.textContent).toContain(copy.failed); expect(document.activeElement).toBe(button(copy.retry));
  await click(copy.retry); await act(async () => { source().focus(); button(copy.respond).click(); });
  expect(host.textContent).not.toContain(copy.failed); expect(document.activeElement).toBe(source());
  await click(copy.refresh); await act(async () => { source().focus(); source().blur(); button(copy.respond).click(); });
  expect(document.activeElement).toBe(document.body); expect(source().textContent).toBe(commandRecords[1].code);
});

it('keeps keyboard focus on the refresh action while its request is pending', async () => {
  const action = button(copy.refresh);
  await act(async () => { action.focus(); await userEvent.keyboard('{Enter}'); });
  expect(action.getAttribute('aria-busy')).toBe('true'); expect(document.activeElement).toBe(action);
  await act(async () => userEvent.keyboard('{Enter}')); expect(document.activeElement).toBe(action);
  await act(async () => button(copy.respond).click()); expect(action.getAttribute('aria-busy')).toBeNull(); expect(document.activeElement).toBe(action);
});
