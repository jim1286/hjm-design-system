import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { HjmProvider } from '@hjmds/react/provider';
import { ActionFeedbackPreview, UploadRecoveryPreview } from '../../../showcase/web/src/patterns/reference-adoption-previews.js';
import '../src/styles.css';
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=(ui:ReactNode)=>act(async()=>root.render(<HjmProvider reducedMotion>{ui}</HjmProvider>));
// Icon-only row actions (UploadItem cancel/retry) carry their name in aria-label, not text.
// Completion buttons keep hidden sizing copies of both labels, so match the visible label element too.
const button=(label:string)=>[...host.querySelectorAll('button')].find(n=>n.textContent===label||n.getAttribute('aria-label')===label||[...n.querySelectorAll('.hjm-button__label:not([aria-hidden])')].some(part=>part.textContent===label))!;
const click=(label:string)=>act(async()=>button(label).click());
const fill=(value:string)=>act(async()=>{const input=host.querySelector<HTMLInputElement>('input')!;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));});
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,400));});
const file=(name:string)=>new File(['image'],name,{type:'image/jpeg',lastModified:1});
function select(files:File[]){const transfer=new DataTransfer();files.forEach(file=>transfer.items.add(file));const input=host.querySelector<HTMLInputElement>('input[type=file]')!;input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));}
function drop(files:File[]){const transfer=new DataTransfer();files.forEach(file=>transfer.items.add(file));host.querySelector('.hjm-file-picker__dropzone')!.dispatchEvent(new DragEvent('drop',{dataTransfer:transfer,bubbles:true}));}
const rows=()=>host.querySelectorAll('[role=group][tabindex="-1"]');
it('distinguishes an edited draft from the old success and retries the current title after failure',async()=>{
 await render(<ActionFeedbackPreview/>);await fill('이전 제목');await click('기록 저장');await fill('현재 제목');await settle();expect(host.textContent).toContain('현재 제목은 아직 저장하지 않았어요.');expect(host.textContent).toContain('저장한 제목: 이전 제목');expect(button('✓ 다시 저장')).toBeUndefined();
 await click('다음 저장 실패시키기');await click('기록 저장');await settle();expect(host.textContent).toContain('저장하지 못했어요.');await fill('수정 제목');await click('기록 저장');await settle();expect(host.textContent).toContain('저장한 제목: 수정 제목');expect(host.querySelector('input')!.value).toBe('수정 제목');
});
it('deduplicates before capacity and admits a new file beside a previously selected duplicate',async()=>{
 await render(<UploadRecoveryPreview/>);await act(async()=>select([file('a.jpg'),file('b.jpg')]));await act(async()=>select([file('a.jpg'),file('c.jpg')]));expect(rows()).toHaveLength(3);expect(host.textContent).toContain('c.jpg');expect(host.textContent).not.toContain('추가하지 못한 파일');
});
it('enforces the latest three-file capacity across same-render selections and reports genuine rejections',async()=>{
 await render(<UploadRecoveryPreview/>);await act(async()=>{drop([file('a.jpg'),file('b.jpg')]);drop([file('c.jpg'),file('d.jpg')]);});expect(rows()).toHaveLength(3);expect(host.textContent).toContain('추가하지 못한 파일');
});
it('keeps cancellation authoritative over a same-render late response and preserves keyboard recovery',async()=>{
 await render(<UploadRecoveryPreview/>);await click('예제 사진 추가');await click('전송 시작');const cancel=button('취소'),success=button('성공 응답 보내기');cancel.focus();await act(async()=>{cancel.click();success.click();});expect(host.textContent).toContain('전송 대기');expect(host.textContent).not.toContain('전송 완료');expect(document.activeElement).toBe(rows()[0]);
 await click('전송 시작');await click('실패 응답 보내기');await click('다시 전송');await click('성공 응답 보내기');await click('선택에서 제거');expect(rows()).toHaveLength(0);expect(document.activeElement).toBe(button('사진 선택'));
});
it('retains valid selection while rejecting unsupported and oversized files without reviving them as count overflow',async()=>{
 await render(<UploadRecoveryPreview/>);await act(async()=>select([file('valid.jpg'),new File(['text'],'notes.txt',{type:'text/plain'}),new File([new Uint8Array(5*1024*1024+1)],'large.jpg',{type:'image/jpeg'})]));expect(rows()).toHaveLength(1);expect(host.textContent).toContain('valid.jpg');expect(host.textContent).not.toContain('large.jpg');expect(host.textContent).toContain('추가하지 못한 파일');
});
