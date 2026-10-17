import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import { ProductBentoPreview } from "../../../showcase/web/src/patterns/reference-adoption-previews.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(async () => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host=document.createElement("div"); document.body.append(host); root=createRoot(host); await act(async () => root.render(<HjmProvider reducedMotion><ProductBentoPreview/></HjmProvider>)); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => (node.getAttribute("aria-label") ?? node.textContent) === label)!;
const click = (label: string) => act(async () => button(label).click());
const field = () => host.querySelector<HTMLInputElement>('input.hjm-field__input')!;
const input = (value: string) => act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(field(),value); field().dispatchEvent(new Event("input",{bubbles:true})); });
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve,400)); });
it("shows and hides guidance, retains a draft through the introduction and blocks whitespace", async () => {
 await click("사용 방법 보기"); expect(host.textContent).toContain("다른 사람에게 전송되지는 않아요"); await click("사용 방법 접기"); expect(host.textContent).not.toContain("다른 사람에게 전송되지는 않아요");
 await click("첫 기록 시작하기"); expect(document.activeElement).toBe(field()); expect(button("미리보기에 저장").disabled).toBe(true);
 await input("임시 제목"); await click("소개로 돌아가기"); expect(field()).toBeNull(); await click("첫 기록 시작하기"); expect(field().value).toBe("임시 제목");
 await input("   "); expect(button("미리보기에 저장").disabled).toBe(true);
});
it("saves the submitted snapshot and marks edits made while saving as unsaved", async () => {
 await click("첫 기록 시작하기"); await input(" 첫 제목 "); await act(async () => {const target=button("미리보기에 저장");target.click();target.click();});
 expect(button("소개로 돌아가기").disabled).toBe(true); expect(button("다음 저장 실패시키기").disabled).toBe(true);
 await input("다음 제목"); await settle(); expect(host.textContent).toContain("저장된 제목: 첫 제목"); expect(field().value).toBe("다음 제목");
 expect(host.textContent).toContain("현재 제목은 아직 저장하지 않았어요");
 await click("미리보기에 저장"); await settle(); expect(host.textContent).toContain("저장된 제목: 다음 제목"); expect(button("저장했어요").disabled).toBe(true);
});
it("keeps the last saved title on failure and retries the current draft", async () => {
 await click("첫 기록 시작하기"); await input("첫 제목"); await click("미리보기에 저장"); await settle();
 await input("실패할 제목"); await click("다음 저장 실패시키기"); await click("미리보기에 저장"); await settle(); expect(host.textContent).toContain("저장하지 못했어요"); expect(host.textContent).toContain("저장된 제목: 첫 제목");
 await input("다시 쓴 제목"); await click("미리보기에 저장"); await settle(); expect(host.textContent).toContain("저장된 제목: 다시 쓴 제목"); expect(host.textContent).not.toContain("저장하지 못했어요");
});
