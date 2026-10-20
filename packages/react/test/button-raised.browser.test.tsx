import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "../src/provider.js";
import { Button, type ButtonProps } from "../src/actions.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
const profile = defineHjmDesignProfile({ controls: { button: { appearance: 'raised', shape: 'pill' } } });
beforeEach(() => { host = document.createElement('div'); host.style.width='360px'; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
async function render(props: Partial<ButtonProps> = {}) {
  await act(async () => root.render(<HjmProvider minimumVisualTarget designProfile={profile}><Button {...props}>Send</Button></HjmProvider>));
  return host.querySelector('button')!;
}
it('uses brand defaults and reserves the raised underside outside the face', async () => {
  const button = await render({ fullWidth: true });
  const face = button.querySelector<HTMLElement>('.hjm-button__face')!;
  expect(button.dataset.shape).toBe('pill');
  expect(button.dataset.appearance).toBe('raised');
  expect(button.getBoundingClientRect().height - face.getBoundingClientRect().height).toBeCloseTo(4);
  expect(button.getBoundingClientRect().width).toBeCloseTo(360);
  expect(face.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
});
it('keeps the real button, width, focus and painted face while busy blocks the action', async () => {
  const click=vi.fn();
  const button=await render({ onClick: click }); button.focus();
  const width=button.getBoundingClientRect().width;
  await render({ loading: true, disabled: true, onClick: click });
  expect(host.querySelector('button')).toBe(button);
  expect(document.activeElement).toBe(button);
  expect(button.disabled).toBe(false);
  expect(button.getAttribute('aria-busy')).toBe('true');
  expect(button.getBoundingClientRect().width).toBeCloseTo(width);
  expect(getComputedStyle(button.querySelector('.hjm-button__face')!).opacity).toBe('1');
  expect(getComputedStyle(button.querySelector('.hjm-button__label')!).opacity).toBe('0');
  await act(async () => button.click()); expect(click).not.toHaveBeenCalled();
  await render({ onClick: click }); await act(async () => button.click()); expect(click).toHaveBeenCalledOnce();
});
it('honors an explicit flat override and keeps ghost actions frameless under the same profile', async () => {
  let button=await render({ appearance: 'flat' }); expect(button.querySelector('.hjm-button__face')).toBeNull();
  button=await render({ tone: 'ghost', selected: true }); expect(button.querySelector('.hjm-button__face')).toBeNull();
  expect(button.getAttribute('aria-pressed')).toBe('true');
});
