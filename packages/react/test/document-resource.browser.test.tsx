import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import type { DocumentResourceDescriptor } from "@hjmds/design-contracts/document-resource";
import { DocumentResource } from "../src/internal/document-resource.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); host.style.width = "320px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const labels = { preview: "미리보기", previewLoading: "그림 로딩", previewUnavailable: "미리보기 없음", retryPreview: "그림 재시도", save: "저장", saving: "저장 중", started: "다운로드 시작", saved: "저장 완료", cancelled: "저장 취소", retrySave: "저장 재시도" };
const descriptor: DocumentResourceDescriptor = { id: "a", name: "보고서.pdf", formatLabel: "PDF", sizeLabel: "2 MB", preview: { status: "ready" }, save: { status: "idle" } };

it("keeps preview, save and menu as independent targets and preserves metadata on preview failure", async () => {
 const preview = vi.fn(), save = vi.fn(), menu = vi.fn(), retry = vi.fn();
 const render = (failed: boolean) => <HjmProvider><DocumentResource descriptor={{...descriptor, preview: failed ? {status:"error",message:"그림 오류",retryable:true}:descriptor.preview}}
 labels={labels} onPreview={preview} onSave={save} onRetryPreview={retry} moreAction={<button onClick={menu}>메뉴</button>} /></HjmProvider>;
 await act(async()=>root.render(render(false)));
 for (const name of ["미리보기","저장","메뉴"]) await act(async()=>page.getByRole("button",{name,exact:true}).click());
 expect(preview).toHaveBeenCalledOnce();expect(save).toHaveBeenCalledOnce();expect(menu).toHaveBeenCalledOnce();
 expect(host.querySelector("button button")).toBeNull();
 await act(async()=>root.render(render(true)));
 expect(host.textContent).toContain("보고서.pdf");expect(host.textContent).toContain("2 MB");
 await act(async()=>page.getByRole("button",{name:"그림 재시도",exact:true}).click());expect(retry).toHaveBeenCalledOnce();
 await expect.element(page.getByRole("button",{name:"저장",exact:true})).toBeEnabled();
});
it("does not present initiation as saved and blocks unsafe retry while keeping one save target", async () => {
 const save = vi.fn(), retry = vi.fn();
 for (const state of [{status:"pending"},{status:"error",message:"결과 불확실",retryable:false},{status:"error",message:"재시도 가능",retryable:true},{status:"started"},{status:"saved"}] as const) {
  await act(async()=>root.render(<HjmProvider><DocumentResource descriptor={{...descriptor,save:state}} labels={labels} onSave={save} onRetrySave={retry}/></HjmProvider>));
  expect(host.querySelectorAll("button")).toHaveLength(1);
  const button=host.querySelector("button")!;
  expect(button.disabled).toBe(state.status==="pending" || state.status==="error"&&!state.retryable);
  expect(host.textContent!.includes("저장 완료")).toBe(state.status==="saved");
  if(state.status==="error"&&state.retryable) await act(async()=>page.getByRole("button",{name:"저장 재시도",exact:true}).click());
 }
 expect(save).not.toHaveBeenCalled();expect(retry).toHaveBeenCalledOnce();
});
it("wraps a long unbroken name and actions at large text in both themes and directions", async()=>{
 for(const theme of ["light","dark"] as const) for(const direction of ["ltr","rtl"] as const){
  await act(async()=>root.render(<HjmProvider theme={theme} direction={direction} textScale={2}><DocumentResource descriptor={{...descriptor,name:"long_filename_".repeat(20)+".pdf"}} labels={labels} onSave={()=>{}}/></HjmProvider>));
  expect(host.scrollWidth).toBeLessThanOrEqual(320);
 }
});
