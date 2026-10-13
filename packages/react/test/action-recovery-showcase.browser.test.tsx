import { act } from "react";
import { page } from "vitest/browser";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import { SaveRecoveryPreview, OptimisticRecoveryPreview, UndoRecoveryPreview } from "../../../showcase/web/src/patterns/action-recovery-previews.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT=true; host=document.createElement("div"); document.body.append(host); root=createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render=(kind: "save"|"optimistic"|"undo") => act(async () => root.render(<HjmProvider reducedMotion>{kind==="save"?<SaveRecoveryPreview/>:kind==="optimistic"?<OptimisticRecoveryPreview/>:<UndoRecoveryPreview/>}</HjmProvider>));
const button=(label:string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node=>node.textContent===label)!;
const click=(label:string) => act(async () => { const target=button(label); expect(target).toBeDefined(); target.focus(); target.click(); });
const settle=() => act(async () => { await new Promise(resolve=>setTimeout(resolve,400)); });
const fill=(value:string) => act(async () => { const input=host.querySelector("input")!; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,value); input.dispatchEvent(new Event("input",{bubbles:true})); });
it("separates the submitted snapshot from edits made during saving",async()=>{
 await render("save"); await fill("제출 A"); await click("저장"); await fill("편집 B"); await settle();
 expect(host.textContent).toContain("저장된 내용: 제출 A"); expect(host.querySelector("input")!.value).toBe("편집 B"); expect(host.querySelector('[role="status"]')!.textContent).toContain("현재 입력은 아직 저장하지 않았어요");
 await click("저장"); await settle(); expect(host.textContent).toContain("저장된 내용: 편집 B"); expect(host.querySelector('[role="status"]')!.textContent).toBe("저장했어요.");
});
it("retries the failed snapshot, preserves the new draft and keeps a usable focus target",async()=>{
 await render("save"); await fill("실패 A"); await click("다음 요청 실패시키기"); await click("저장"); await settle(); await fill("현재 B");
 await act(async () => page.getByRole("button",{name:"실패한 내용 다시 저장",exact:true}).click()); expect(document.activeElement).toBe(button("저장"));
 const editedInput=host.querySelector("input")!; await act(async () => editedInput.focus()); await settle(); expect(document.activeElement).toBe(editedInput);
 expect(host.textContent).toContain("저장된 내용: 실패 A"); expect(host.querySelector("input")!.value).toBe("현재 B");
 await click("다음 요청 실패시키기"); await click("저장"); await settle(); await fill(""); await click("실패한 내용 다시 저장"); expect(document.activeElement).toBe(host.querySelector("input")); await settle(); expect(host.textContent).toContain("저장된 내용: 현재 B");
});
it("keeps optimistic retry focus and ignores the response superseded by a refresh",async()=>{
 await render("optimistic"); await click("다음 요청 실패시키기"); await click("북마크 추가"); expect(button("북마크 해제").getAttribute("aria-pressed")).toBe("true"); await click("북마크 해제"); expect(button("북마크 해제").getAttribute("aria-pressed")).toBe("true"); await settle(); expect(button("북마크 추가").getAttribute("aria-pressed")).toBe("false");
 await click("북마크 다시 반영"); expect(document.activeElement).toBe(button("북마크 해제")); await click("서버에서 새 상태 불러오기"); await settle(); expect(button("북마크 추가").getAttribute("aria-pressed")).toBe("false"); expect(button("북마크 다시 반영")).toBeUndefined();
 await click("북마크 추가"); await settle(); expect(button("북마크 해제").getAttribute("aria-pressed")).toBe("true");
});
it("keeps the confirmed archive state on failed undo and returns retry focus to its action",async()=>{
 await render("undo"); await click("보관"); expect(host.textContent).toContain("목록: 리서치 메모"); await settle(); expect(host.textContent).toContain("보관함: 리서치 메모");
 await click("다음 요청 실패시키기"); await click("실행 취소"); await settle(); expect(host.textContent).toContain("보관함: 리서치 메모");
 await click("실패한 작업 다시 시도"); expect(document.activeElement).toBe(button("실행 취소")); await settle(); expect(host.textContent).toContain("목록: 리서치 메모"); expect(document.activeElement).toBe(button("보관"));
});
