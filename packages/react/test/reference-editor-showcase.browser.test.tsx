import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import { FirstTask, RecoverableSettings, SelectionReview } from "../../../showcase/web/src/patterns/reference-flow-previews.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT=true; host=document.createElement("div");document.body.append(host);root=createRoot(host); });
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=(Component: typeof FirstTask)=>act(async()=>root.render(<HjmProvider reducedMotion><Component/></HjmProvider>));
const button=(label:string)=>[...document.querySelectorAll<HTMLButtonElement>("button")].find(node=>(node.getAttribute("aria-label")??node.textContent)===label)!;
const click=(label:string)=>act(async()=>button(label).click());
const field=()=>host.querySelector<HTMLInputElement>("input.hjm-field__input")!;
const input=(value:string)=>act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(field(),value);field().dispatchEvent(new Event("input",{bubbles:true}));});
const settle=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,420));});
it("first task focuses invalid input, retains paused draft and navigates through completion",async()=>{
 await render(FirstTask);await click("여행");await click("이 주제로 기록하기");button("기록 확인").focus();await act(async()=>userEvent.keyboard("{Enter}"));expect(document.activeElement).toBe(field());expect(field().getAttribute("aria-invalid")).toBe("true");
 await input("여행 기록");await click("초안 남기고 쉬기");expect(host.textContent).toContain("초안이 남아 있어요");await click("이어하기");expect(field().value).toBe("여행 기록");await click("기록 확인");expect(host.textContent).toContain("여행 · 알림 켜짐");await click("기록 저장");expect(button("내용 수정").disabled).toBe(true);await settle();expect(host.textContent).toContain("첫 기록을 저장했어요");await click("저장한 기록 보기");expect(host.textContent).toContain("저장한 기록의 상세 내용입니다");await click("완료 화면으로");await click("다시 해보기");expect(host.textContent).toContain("1단계 · 주제");
});
it("settings preserves drafts on dismiss and restores saved data with a usable focus target on discard",async()=>{
 await render(RecoverableSettings);expect(button("변경 내용 저장").disabled).toBe(true);await input("변경한 이름");const leave=button("설정 나가기");await act(async()=>page.getByRole("button",{name:"설정 나가기",exact:true}).click());await act(async()=>page.getByRole("button",{name:"계속 수정",exact:true}).click());expect(field().value).toBe("변경한 이름");await expect.poll(()=>document.activeElement,{timeout:3000}).toBe(leave);
 await click("설정 나가기");await click("변경 버리고 나가기");await settle();expect(host.textContent).toContain("설정에서 나왔어요");expect(document.activeElement?.textContent).toBe("나에게 맞는 기록");await click("이어하기");expect(field().value).toBe("나의 기록");await input("저장한 이름");await click("변경 내용 저장");await settle();await click("계속 수정하기");expect(field().value).toBe("저장한 이름");expect(button("변경 내용 저장").disabled).toBe(true);
});
it("selection review recovers from failure using the edited draft and blocks pending controls",async()=>{
 await render(SelectionReview);await input("이전 제목");await click("기록 확인");await click("다음 저장 실패시키기");await act(async()=>{button("이 내용으로 확정").click();button("이 내용으로 확정").click();});expect(button("초안 남기고 쉬기").disabled).toBe(true);await settle();expect(host.textContent).toContain("저장하지 못했어요");expect(host.querySelector('[data-status="error"]')).not.toBeNull();await click("내용 수정");expect(field().value).toBe("이전 제목");await input("수정한 제목");await click("기록 확인");await click("이 내용으로 확정");await settle();expect(host.textContent).toContain("선택한 내용을 확정했어요");expect(host.textContent).toContain("수정한 제목");expect(host.textContent).not.toContain("이전 제목");
});
