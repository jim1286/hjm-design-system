import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { HjmProvider } from '@hjmds/react/provider';
import DateMeta from './DateEntry.stories';
import TimeMeta from './TimeSelection.stories';
import '@hjmds/react/styles.css';
const DateDemo = DateMeta.component, TimeDemo = TimeMeta.component;
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (kind: 'date' | 'time') => act(async () => { root.render(<HjmProvider>{kind === 'date' ? <DateDemo /> : <TimeDemo />}</HjmProvider>); });
const click = (label: string) => act(async () => page.getByRole('button', { name: label, exact: true }).click());
// 입력 순서 바꾸기 is a 미리보기 도구 selection chip (checkbox role), not a product button.
const tool = (label: string) => act(async () => page.getByRole('checkbox', { name: label, exact: true }).click());
const fill = (label: string, value: string) => act(async () => page.getByRole('textbox', { name: label, exact: true }).fill(value));

it('confirms a date, preserves it through reordering, then recovers an invalid edited date', async () => {
  await render('date'); await fill('연도', '2024'); await fill('월', 'Feb'); await fill('일', '29'); await click('날짜 확인');
  expect(host.textContent).toContain('확인한 날짜: 2024-02-29'); await tool('입력 순서 바꾸기');
  expect([...host.querySelectorAll('input')].map(node => node.value)).toEqual(['29', 'Feb', '2024']);
  expect(host.textContent).toContain('확인한 날짜: 2024-02-29');
  await fill('연도', '2023'); expect(host.textContent).not.toContain('확인한 날짜:'); await click('날짜 확인');
  expect(host.textContent).toContain('실제로 존재하는 날짜를 입력해 주세요.'); expect(host.querySelector<HTMLInputElement>('input')!.value).toBe('29');
  await fill('일', '28'); await click('날짜 확인'); expect(host.textContent).toContain('확인한 날짜: 2023-02-28');
});

it('requires both time parts and removes a previous result on clear, edit and reset', async () => {
  await render('time'); const confirm = () => page.getByRole('button', { name: '선택 완료', exact: true }).element();
  const choose = async (label: string, option: string) => { await act(async () => page.getByRole('combobox', { name: label, exact: true }).click()); await act(async () => page.getByRole('option', { name: option, exact: true }).click()); };
  expect(confirm()).toBeDisabled(); await choose('시', '0시'); expect(confirm()).toBeDisabled();
  await choose('분', '0분'); await click('선택 완료'); expect(host.textContent).toContain('시간을 정했어요'); expect(host.textContent).toContain('00:00');
  await choose('분', '분 선택 해제'); expect(confirm()).toBeDisabled(); expect(host.textContent).not.toContain('시간을 정했어요');
  await choose('분', '30분'); await click('선택 완료'); expect(host.textContent).toContain('00:30');
  await click('다시 고르기'); expect(confirm()).toBeDisabled(); expect(host.textContent).not.toContain('시간을 정했어요');
  expect(page.getByRole('combobox', { name: '시', exact: true }).element().textContent).toContain('시 선택');
  expect(page.getByRole('combobox', { name: '분', exact: true }).element().textContent).toContain('분 선택');
});
