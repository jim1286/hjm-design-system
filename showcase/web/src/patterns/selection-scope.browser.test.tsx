import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import meta from "./SelectionScope.stories";
import "../../../../packages/react/src/styles.css";
const Preview = meta.component;
let host: HTMLDivElement, root: Root;
beforeEach(async () => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); await act(async () => root.render(<HjmProvider reducedMotion><Preview /></HjmProvider>)); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const action = () => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => node.textContent?.includes("공유 대상으로 정하기"))!;
const status = () => host.querySelector('[role="status"]')!.textContent;
const checked = () => host.querySelector<HTMLInputElement>('input:checked')!.value;
const click = (label: string) => act(async () => page.getByRole("button", { name: label, exact: true }).click());
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 420)); });

it("preserves scope through failure and retry, keeps keyboard focus and clears old success on a new choice", async () => {
  expect(checked()).toBe("cover"); expect(action().textContent).toBe("1개 공유 대상으로 정하기");
  await act(async () => host.querySelector<HTMLInputElement>('input:checked')!.focus());
  await act(async () => userEvent.keyboard("{ArrowRight}"));
  expect(checked()).toBe("group"); expect(action().textContent).toBe("3개 공유 대상으로 정하기");
  await click("다음 적용 실패시키기"); const apply = action();
  await act(async () => { apply.focus(); apply.click(); apply.click(); });
  expect(status()).toBe("3개 공유 대상을 확인하고 있어요.");
  expect(apply.getAttribute("aria-disabled")).toBe("true"); expect(document.activeElement).toBe(apply);
  expect([...host.querySelectorAll('input')].every(node => node.matches(":disabled"))).toBe(true);
  await act(async () => host.querySelector<HTMLInputElement>('input[value="cover"]')!.click()); expect(checked()).toBe("group");
  await settle(); expect(status()).toContain("정하지 못했어요"); expect(checked()).toBe("group"); expect(document.activeElement).toBe(apply);
  await act(async () => userEvent.keyboard("{Enter}")); await settle();
  expect(status()).toContain("3개를 공유 대상으로 정했어요"); expect(document.activeElement).toBe(apply);
  await act(async () => host.querySelector<HTMLInputElement>('input:checked')!.focus());
  await act(async () => userEvent.keyboard("{ArrowLeft}"));
  expect(checked()).toBe("cover"); expect(status()).toBe("범위를 고른 뒤 적용하세요."); expect(action().textContent).toBe("1개 공유 대상으로 정하기");
});
it("does not steal an external focus when a submitted scope finishes", async () => {
  const outside = document.createElement("button"); outside.textContent = "Outside"; document.body.append(outside);
  try { await click("1개 공유 대상으로 정하기"); await act(async () => outside.focus()); await settle(); expect(status()).toContain("1개를 공유 대상으로 정했어요"); expect(document.activeElement).toBe(outside); }
  finally { outside.remove(); }
});
