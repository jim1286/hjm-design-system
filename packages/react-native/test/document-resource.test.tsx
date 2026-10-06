import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import type { DocumentResourceDescriptor } from "@hjmds/design-contracts/document-resource";
import { DocumentResource } from "../src/document-resource.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { Surface, Text } from "../src/primitives.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(()=>{if(tree)act(()=>tree!.unmount());tree=undefined;});
const labels = { preview: "미리보기", previewLoading: "그림 로딩", previewUnavailable: "미리보기 없음", retryPreview: "그림 재시도", save: "저장", saving: "저장 중", started: "다운로드 시작", saved: "저장 완료", cancelled: "저장 취소", retrySave: "저장 재시도" };
const descriptor: DocumentResourceDescriptor = { id: "a", name: "보고서.pdf", formatLabel: "PDF", sizeLabel: "2 MB", preview: { status: "ready" }, save: { status: "idle" } };

it("keeps file actions independently accessible and preview failure independent of saving",()=>{
 const preview=vi.fn(), save=vi.fn(), retry=vi.fn();
 act(()=>{tree=create(<HjmNativeProvider><DocumentResource descriptor={{...descriptor,preview:{status:"error",message:"그림 오류",retryable:true}}} labels={labels} onPreview={preview} onSave={save} onRetryPreview={retry}/></HjmNativeProvider>);});
 expect(tree!.root.findByType(Surface).props.accessible).toBe(false);
 const buttons=tree!.root.findAllByType(Button);
 expect(buttons.map(button=>button.props.disabled)).toEqual([true,false,false]);
 act(()=>buttons[1]!.props.onPress());act(()=>buttons[2]!.props.onPress());
 expect(retry).toHaveBeenCalledOnce();expect(save).toHaveBeenCalledOnce();expect(preview).not.toHaveBeenCalled();
 expect(tree!.root.findAllByType(Text).map(node=>node.props.children)).toContain("보고서.pdf");
});
it("preserves one save button across pending and failure, and distinguishes initiation from receipt",()=>{
 const render=(save:DocumentResourceDescriptor["save"]) => <HjmNativeProvider><DocumentResource descriptor={{...descriptor,save}} labels={labels} onSave={()=>{}}/></HjmNativeProvider>;
 act(()=>{tree=create(render({status:"idle"}));});const button=tree!.root.findByType(Button);
 act(()=>tree!.update(render({status:"pending"})));
 expect(tree!.root.findByType(Button)).toBe(button);expect(button.props.loading).toBe(true);expect(button.props.disabled).toBe(true);
 act(()=>tree!.update(render({status:"error",message:"결과 불확실",retryable:false})));
 expect(button.props.disabled).toBe(true);
 act(()=>tree!.update(render({status:"started"})));
 let texts=tree!.root.findAllByType(Text).map(node=>node.props.children);
 expect(texts).toContain("다운로드 시작");expect(texts).not.toContain("저장 완료");
 act(()=>tree!.update(render({status:"saved"})));
 texts=tree!.root.findAllByType(Text).map(node=>node.props.children);expect(texts).toContain("저장 완료");
});

it("keeps preview available when product review locks export",()=>{
 const preview=vi.fn();
 const render=(locked:boolean)=><HjmNativeProvider><DocumentResource descriptor={{...descriptor,saveDisabled:locked}} labels={labels} onPreview={preview} onSave={()=>{}}/></HjmNativeProvider>;
 act(()=>{tree=create(render(true));});
 const buttons=tree!.root.findAllByType(Button);
 expect(buttons.map(button=>button.props.disabled)).toEqual([false,true]);
 act(()=>buttons[0]!.props.onPress());expect(preview).toHaveBeenCalledOnce();
 act(()=>tree!.update(render(false)));
 expect(tree!.root.findAllByType(Button)[1]!.props.disabled).toBe(false);
});
