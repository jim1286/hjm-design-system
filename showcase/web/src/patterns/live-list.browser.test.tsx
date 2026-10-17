import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { LiveListPreview } from "./live-list-preview";
import "../../../../packages/react/src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(async () => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); await act(async () => root.render(<HjmProvider reducedMotion><LiveListPreview /></HjmProvider>)); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); window.scrollTo(0, 0); });
const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === label)!;
const action = (label: string) => act(async () => button(label).click());
const fields = () => [...host.querySelectorAll<HTMLInputElement>('input')];

it("preserves row identity, drafts and focused input through queued additions, reversal and paused updates", async () => {
  await act(async () => page.getByRole('textbox', { name: '기록 1 메모', exact: true }).fill('계속 쓰는 메모'));
  const original = fields()[0]!;
  await act(async () => { button('기록 추가').click(); button('3개 함께 추가').click(); });
  expect(fields()).toHaveLength(5); expect(fields().at(-1)).toBe(original); expect(original.value).toBe('계속 쓰는 메모'); expect(document.activeElement).toBe(original);
  await action('순서 뒤집기'); expect(fields()[0]).toBe(original); expect(document.activeElement).toBe(original);
  const motion = () => act(async () => page.getByRole('checkbox', { name: '움직임 멈추기', exact: true }).click());
  await motion(); await action('기록 추가'); await motion();
  expect(fields()).toHaveLength(6); expect(fields()[1]).toBe(original); expect(original.value).toBe('계속 쓰는 메모');
  expect(new Set(fields().map(node => node.id)).size).toBe(6);
});

it("keeps a usable pointer deletion origin, reaches empty recovery and reuses no deleted draft", async () => {
  await action('기록 추가'); await act(async () => fields()[0]!.focus());
  const remove = button('첫 기록 삭제');
  await act(async () => page.getByRole('button', { name: '첫 기록 삭제', exact: true }).click());
  expect(fields()).toHaveLength(1); expect(document.activeElement).toBe(remove);
  await act(async () => page.getByRole('button', { name: '첫 기록 삭제', exact: true }).click());
  expect(fields()).toHaveLength(0); expect(remove.disabled).toBe(true); expect(button('순서 뒤집기').disabled).toBe(true);
  expect(host.textContent).toContain('기록이 없어요'); expect(document.activeElement).toBe(button('기록 추가'));
  await action('기록 추가'); expect(fields()).toHaveLength(1); expect(fields()[0]!.value).toBe('');
});

it("keeps added records reachable by document scrolling and editable", async () => {
  await act(async () => { for (let index = 0; index < 5; index++) button('3개 함께 추가').click(); });
  expect(fields()).toHaveLength(16); expect(document.documentElement.scrollHeight).toBeGreaterThan(window.innerHeight);
  await act(async () => page.getByRole('textbox', { name: '기록 1 메모', exact: true }).fill('스크롤 끝의 메모'));
  const last = fields().at(-1)!;
  await act(async () => { last.scrollIntoView({ block: 'center' }); await new Promise(requestAnimationFrame); });
  expect(window.scrollY).toBeGreaterThan(0); expect(last.getBoundingClientRect().top).toBeGreaterThanOrEqual(0); expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
  expect(last.value).toBe('스크롤 끝의 메모');
});
