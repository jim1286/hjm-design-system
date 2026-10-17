import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { HjmProvider } from '@hjmds/react/provider';
import { AccountFlowPreview, CollectionFlowPreview, EditorFlowPreview, OnboardingFlowPreview, ModerationFlowPreview } from './screen-flow-previews';
import '../../../../packages/react/src/styles.css';
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');host.style.width='390px';document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=(ui:ReactNode)=>act(async()=>root.render(<HjmProvider reducedMotion>{ui}</HjmProvider>));
const button=(label:string,scope:ParentNode=document)=>[...scope.querySelectorAll<HTMLButtonElement>('button')].find(n=>n.textContent===label||n.getAttribute('aria-label')===label)!;
// A selected Chip prefixes its decorative check mark, so chips are matched by their label element.
const chip=(label:string)=>[...document.querySelectorAll<HTMLButtonElement>('.hjm-chip')].find(n=>n.querySelector('.hjm-chip__label')?.textContent===label)!;
const click=(label:string,scope:ParentNode=document)=>act(async()=>{const target=button(label,scope);target.focus();target.click();});
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,440));});
const field=(label:string)=>{const node=[...document.querySelectorAll('label')].find(n=>n.textContent===label)!;return document.getElementById(node.htmlFor) as HTMLInputElement|HTMLTextAreaElement;};
const fill=(label:string,value:string)=>act(async()=>{const input=field(label),prototype=input instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));});
it('starts a blank record, preserves failed input, and keeps new record bodies separate after returning to the list',async()=>{
 await render(<CollectionFlowPreview tools/>);await click('새 기록');expect(field('제목').value).toBe('');await fill('제목','첫 번째 새 기록');await fill('내용','첫 번째 본문');await click('다음 저장 실패시키기');await click('저장');await settle();expect(field('내용').value).toBe('첫 번째 본문');expect(host.textContent).toContain('저장하지 못했어요.');await click('저장');await settle();expect(host.textContent).toContain('저장했어요.');await click('새 기록');expect(field('제목').value).toBe('');await fill('제목','두 번째 새 기록');await fill('내용','두 번째 본문');await click('저장');await settle();const first=[...host.querySelectorAll<HTMLButtonElement>('.hjm-list-row')].find(n=>n.textContent?.includes('첫 번째 새 기록'))!;await act(async()=>first.click());expect(host.textContent).toContain('첫 번째 본문');expect(host.textContent).not.toContain('두 번째 본문');await click('목록으로');expect(host.textContent).toContain('두 번째 새 기록');
});
it('retains collection failure notices beside filters and reveals newly saved records after an empty state',async()=>{
 await render(<CollectionFlowPreview tools/>);await click('다음 저장 실패시키기');await click('새로고침');await settle();expect(host.textContent).toContain('목록을 새로 불러오지 못했어요.');expect(chip('즐겨찾기').getAttribute('role')).toBe('radio');expect(chip('전체').getAttribute('aria-checked')).toBe('true');await render(<CollectionFlowPreview key="empty" stateKind="empty"/>);await click('새 기록');await fill('제목','빈 목록에서 작성');await fill('내용','내용');await click('저장');await settle();expect(host.textContent).toContain('빈 목록에서 작성');expect(host.textContent).not.toContain('아직 내용이 없어요');
});
it('locks editor fields during save, retries failure, and discards only unsaved edits',async()=>{
 await render(<EditorFlowPreview tools/>);await fill('제목','저장할 제목');await click('다음 저장 실패시키기');await click('저장');expect(field('제목').readOnly||field('제목').disabled).toBe(true);await settle();await click('저장');await settle();await fill('제목','버릴 제목');await click('닫기');await click('계속 작성');expect(field('제목').value).toBe('버릴 제목');await click('닫기');await click('버리고 나가기');await settle();await click('다시 열기');expect(field('제목').value).toBe('저장할 제목');
});
it('returns focus from account sheet and logout cancellation to the account menu without reopening confirmation',async()=>{
 await render(<AccountFlowPreview/>);await click('계정 메뉴');await click('로그아웃');await settle();await click('취소');await settle();expect(document.activeElement).toBe(button('계정 메뉴'));await click('계정 메뉴');await click('로그아웃');await settle();await click('로그아웃',document.querySelector('[role=alertdialog]')!);await settle();expect(host.textContent).toContain('로그아웃했어요.');await click('다시 열기');expect(document.querySelector('[role=alertdialog]')).toBeNull();
});
it('keeps account edits on failure and applies the saved profile after retry',async()=>{
 await render(<AccountFlowPreview tools/>);await click('프로필 수정');await fill('이름','새 이름');await click('다음 저장 실패시키기');await click('변경사항 저장');await settle();expect(field('이름').value).toBe('새 이름');await click('변경사항 저장');await settle();expect(host.textContent).toContain('새 이름');await click('프로필 수정');await fill('이름','취소할 이름');await click('닫기');await click('버리고 나가기');await settle();expect(host.textContent).toContain('새 이름');expect(host.textContent).not.toContain('취소할 이름');
});
it('keeps shared mutation retries working for onboarding and moderation',async()=>{
 await render(<OnboardingFlowPreview initialStep={2} tools/>);await click('다음 저장 실패시키기');await click('시작하기');await settle();expect(host.textContent).toContain('저장하지 못했어요.');await click('다시 시도');await settle();expect(host.textContent).toContain('시작할 준비가 됐어요');await render(<ModerationFlowPreview tools/>);const reason=[...host.querySelectorAll<HTMLButtonElement>('.hjm-list-row')].find(n=>n.textContent?.includes('스팸 또는 광고'))!;await act(async()=>reason.click());await click('다음 저장 실패시키기');await click('신고하기');await settle();expect(host.textContent).toContain('저장하지 못했어요.');await click('신고하기');await settle();expect(host.textContent).toContain('신고를 접수했어요');
});
