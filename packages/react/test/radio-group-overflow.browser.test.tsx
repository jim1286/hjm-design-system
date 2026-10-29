import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { RadioGroup } from '../src/selection.js';
import { HjmProvider } from '../src/provider.js';
import '../src/styles.css';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it('scrolls date cards in one row and reveals a selected disabled date', async () => {
  const host = document.createElement('div'); host.style.width = '280px'; document.body.append(host);
  const root = createRoot(host);
  const items = Array.from({ length: 31 }, (_, index) => ({ value: String(index + 1), label: `${index + 1}일`, disabled: index === 27 }));
  try {
    await act(async () => root.render(<HjmProvider><RadioGroup accessibilityLabel="날짜" items={items} value="28" overflow="scroll" indicator="none" /></HjmProvider>));
    const scroller = host.querySelector<HTMLElement>('.hjm-checkbox-group__scroller')!;
    const dates = [...host.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    expect(scroller.scrollLeft).toBeGreaterThan(0);
    expect(dates[27]!.checked).toBe(true);
    expect(dates[27]!.disabled).toBe(true);
    expect(dates[0]!.closest('label')!.getBoundingClientRect().top).toBe(dates[30]!.closest('label')!.getBoundingClientRect().top);
    const rect = dates[27]!.closest('label')!.getBoundingClientRect();
    expect(rect.right).toBeLessThanOrEqual(scroller.getBoundingClientRect().right + 1);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

it('uses the brand contrast pair for a selected card and restores the idle canvas on change', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  const render = (value: string) => <HjmProvider brandPalette={{ light: { primary: '#006BA6', onPrimary: '#FFFFFF' } }}>
    <RadioGroup accessibilityLabel="날짜" items={[{ value: '27', label: '27일' }, { value: '29', label: '오늘' }]}
      value={value} selectionTone="brand" indicator="none" />
  </HjmProvider>;
  try {
    await act(async () => root.render(render('27')));
    const cards = () => [...host.querySelectorAll<HTMLElement>('.hjm-choice')];
    expect(getComputedStyle(cards()[0]!).backgroundColor).toBe('rgb(0, 107, 166)');
    expect(getComputedStyle(cards()[0]!.querySelector('.hjm-choice__copy')!).color).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(cards()[1]!).backgroundColor).toBe('rgb(255, 255, 255)');
    await act(async () => root.render(render('29')));
    expect(getComputedStyle(cards()[0]!).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(cards()[1]!).backgroundColor).toBe('rgb(0, 107, 166)');
  } finally { await act(async () => root.unmount()); host.remove(); }
});

it('keeps selected outline cards white and uses the brand border', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(<HjmProvider brandPalette={{ light: { primary: '#006BA6', onPrimary: '#FFFFFF' } }}>
      <RadioGroup accessibilityLabel="날짜" items={[{ value: '27', label: '27일' }]} value="27" selectionTone="brand-outline" />
    </HjmProvider>));
    const style = getComputedStyle(host.querySelector('.hjm-choice')!);
    expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(style.borderColor).toBe('rgb(0, 107, 166)');
  } finally { await act(async () => root.unmount()); host.remove(); }
});
