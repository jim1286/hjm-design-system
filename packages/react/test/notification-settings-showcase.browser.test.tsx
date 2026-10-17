import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import meta from "../../../showcase/web/src/patterns/NotificationSettings.stories.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
const Screen = meta.component;
beforeEach(async () => {
 (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
 host = document.createElement("div"); document.body.append(host); root = createRoot(host);
 await act(async () => root.render(<HjmProvider reducedMotion><Screen tools/></HjmProvider>));
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
// The Recovery story's failure tool lives in the PreviewTools group, outside the product screen.
const tools = () => host.querySelector<HTMLElement>('[role="group"][aria-label="미리보기 도구"]')!;
const failureTool = () => [...tools().querySelectorAll<HTMLElement>('button,input')].find(node => (node.closest('label') ?? node).textContent?.includes("다음 저장 실패시키기"))!;
const save = () => [...host.querySelectorAll<HTMLButtonElement>('button:not([role="switch"])')].find(node => !tools().contains(node))!;
const toggle = (name: string) => act(async () => {
 const input = [...host.querySelectorAll<HTMLButtonElement>('button[role="switch"]')].find(node => node.textContent?.includes(name));
 expect(input).toBeDefined(); input!.click();
});
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 400)); });
it("disables unchanged settings, restores clean state on revert and keeps submitted settings separate from newer draft", async () => {
 expect(save().disabled).toBe(true);
 await toggle("주간 모아보기"); expect(save().disabled).toBe(false);
 await toggle("주간 모아보기"); expect(save().disabled).toBe(true);
 await toggle("주간 모아보기"); await act(async () => { save().click(); save().click(); });
 expect(save().disabled).toBe(true); expect(save().textContent).toContain("저장 중");
 expect((failureTool() as HTMLButtonElement).disabled).toBe(true);
 await toggle("내 활동 알림"); await settle();
 expect(host.textContent).toContain("이전 선택을 저장했어요");
 expect(host.textContent).toContain("새로 바꾼 설정은 아직 저장하지 않았어요");
 expect(save().disabled).toBe(false);
 await act(async () => save().click()); await settle();
 expect(host.textContent).toContain("알림 설정을 저장했어요"); expect(host.textContent).toContain("내 활동 꺼짐 · 주간 모아보기 켜짐"); expect(save().disabled).toBe(true);
});
it("keeps the draft after failure and retries its latest value through the same action", async () => {
 await toggle("주간 모아보기"); await act(async () => failureTool().click());
 await act(async () => save().click()); await settle();
 expect(host.textContent).toContain("저장하지 못했어요");
 expect(save().textContent).toContain("다시 저장하기");
 await toggle("내 활동 알림"); await act(async () => save().click()); await settle();
 expect(host.textContent).not.toContain("저장하지 못했어요");
 expect(host.textContent).toContain("내 활동 꺼짐 · 주간 모아보기 켜짐");
 expect(save().disabled).toBe(true);
});
