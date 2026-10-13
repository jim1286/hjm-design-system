import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { AdaptiveContentPreview, ContextToolbarPreview, SelectionMotionPreview } from "../../../showcase/web/src/patterns/reference-adoption-previews.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const memo = () => host.querySelector<HTMLInputElement>('input.hjm-field__input')!;
const type = (value: string) => act(async () => { memo().focus(); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(memo(), value); memo().dispatchEvent(new Event("input", { bubbles: true })); });
const selectedRadio = (group: string) => [...host.querySelectorAll("fieldset")].find(node => node.querySelector("legend")?.textContent === group)!.querySelector<HTMLInputElement>("input:checked")!;
const checked = (group: string) => selectedRadio(group).value;

it("keeps the adaptive memo while rapidly changing panels and cancelling motion during input", async () => {
  const view = (reducedMotion = false) => <HjmProvider reducedMotion={reducedMotion}><AdaptiveContentPreview /></HjmProvider>;
  await act(async () => root.render(view()));
  await type("남겨 둔 메모"); const original = memo();
  await act(async () => page.getByRole("radio", { name: "상세", exact: true }).click());
  expect(host.textContent).toContain("나중에 다시 걷고 싶은 길");
  // Safari pointer activation leaves focus outside radios; establish the keyboard origin explicitly.
  await act(async () => selectedRadio("기록 정보").focus());
  await act(async () => userEvent.keyboard("{ArrowLeft}"));
  expect(checked("기록 정보")).toBe("summary");
  await act(async () => userEvent.keyboard("{ArrowRight}"));
  await type("전환 중 이어 쓴 메모");
  await act(async () => root.render(view(true)));
  expect(memo()).toBe(original); expect(memo().value).toBe("전환 중 이어 쓴 메모"); expect(document.activeElement).toBe(original);
  expect(checked("기록 정보")).toBe("details");
  expect(host.textContent).toContain("나중에 다시 걷고 싶은 길");
});

it("keeps the toolbar draft and choice through keyboard selection and pointer close/reopen", async () => {
  await act(async () => root.render(<HjmProvider><ContextToolbarPreview /></HjmProvider>));
  await type("작성 중인 초안"); const original = memo();
  await act(async () => page.getByRole("button", { name: /표현 도구/ }).click());
  // Establish keyboard focus on the radio; pointer activation does not focus controls on every browser.
  await act(async () => selectedRadio("기록 표현").focus());
  await act(async () => userEvent.keyboard("{ArrowRight}"));
  expect(checked("기록 표현")).toBe("인용"); expect(host.textContent).toContain("선택한 표현: 인용");
  const trigger = host.querySelector<HTMLButtonElement>('.hjm-collapsible__trigger')!;
  await act(async () => page.getByRole("button", { name: /표현 도구/ }).click());
  expect(host.querySelector("fieldset")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(checked("기록 표현")).toBe("인용"); expect(memo()).toBe(original); expect(memo().value).toBe("작성 중인 초안");
});

it("synchronizes both period selectors in both directions while preserving the memo", async () => {
  await act(async () => root.render(<HjmProvider><SelectionMotionPreview /></HjmProvider>));
  await type("기간이 바뀌어도 남는 메모"); const original = memo();
  await act(async () => page.getByRole("group", { name: "연결형 기간 선택" }).getByRole("radio", { name: "일주일", exact: true }).click());
  expect(checked("연결형 기간 선택")).toBe("week"); expect(checked("필터형 기간 선택")).toBe("week");
  await act(async () => page.getByRole("group", { name: "필터형 기간 선택" }).getByRole("radio", { name: "한 달", exact: true }).click());
  expect(checked("연결형 기간 선택")).toBe("month"); expect(checked("필터형 기간 선택")).toBe("month");
  await act(async () => selectedRadio("필터형 기간 선택").focus());
  await act(async () => userEvent.keyboard("{ArrowLeft}"));
  expect(checked("연결형 기간 선택")).toBe("week"); expect(checked("필터형 기간 선택")).toBe("week");
  expect(host.textContent).toContain("이번 주 기록"); expect(memo()).toBe(original); expect(memo().value).toBe("기간이 바뀌어도 남는 메모");
});
