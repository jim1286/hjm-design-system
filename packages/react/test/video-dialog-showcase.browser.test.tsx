import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { HjmProvider } from '@hjmds/react/provider';
import { VideoDialogPreview } from '../../../showcase/web/src/patterns/video-dialog-preview.js';
import '../src/styles.css';
let host:HTMLDivElement,root:Root;
const paused=new WeakMap<HTMLMediaElement,boolean>();
beforeEach(async()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;vi.spyOn(HTMLMediaElement.prototype,'paused','get').mockImplementation(function(this:HTMLMediaElement){return paused.get(this)??true;});vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(function(this:HTMLMediaElement){paused.set(this,true);this.dispatchEvent(new Event('pause'));});vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'play').mockImplementation(async function(this:HTMLMediaElement){paused.set(this,false);this.dispatchEvent(new Event('play'));});host=document.createElement('div');document.body.append(host);root=createRoot(host);await act(async()=>root.render(<HjmProvider reducedMotion><VideoDialogPreview/></HjmProvider>));});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();});
const button=(label:string)=>[...document.querySelectorAll('button')].find(n=>n.textContent===label||n.getAttribute('aria-label')===label)!;
const click=(label:string)=>act(async()=>{button(label).focus();button(label).click();});
const video=()=>document.querySelector('video')!;
const closed=()=>act(async()=>{await new Promise(r=>setTimeout(r,80));});
it('keeps the outside memo and returns focus while immediately releasing and recreating the video host',async()=>{
 const input=host.querySelector('input')!;await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'초안');input.dispatchEvent(new Event('input',{bubbles:true}));});expect(document.querySelector('video')).toBeNull();await click('영상 미리보기');const first=video();await click('재생');expect(button('일시 정지')).toBeDefined();await click('일시 정지');expect(button('재생')).toBeDefined();await click('영상 닫기');expect(document.querySelector('video')).toBeNull();expect(first.hasAttribute('src')).toBe(false);expect(HTMLMediaElement.prototype.load).toHaveBeenCalled();await closed();expect(document.activeElement).toBe(button('영상 미리보기'));expect(input.value).toBe('초안');await click('영상 미리보기');expect(video()).not.toBe(first);expect(button('재생')).toBeDefined();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
});
it('admits one pending play request and permits a fresh retry after rejection',async()=>{
 let reject!:(error:Error)=>void;vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(()=>new Promise((_resolve,fail)=>{reject=fail;}));await click('영상 미리보기');const play=button('재생');await act(async()=>{play.click();play.click();});expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);await act(async()=>reject(new Error('blocked')));expect(document.body.textContent).toContain('재생을 시작하지 못했어요.');await click('재생');expect(button('일시 정지')).toBeDefined();expect(document.body.textContent).not.toContain('재생을 시작하지 못했어요.');
});
it('moves lost player-control focus to error retry and restores play focus after replacing the host',async()=>{
 await click('영상 미리보기');const first=video();button('재생').focus();await act(async()=>first.dispatchEvent(new Event('error')));expect(document.activeElement).toBe(button('다시 시도'));expect(document.body.textContent).toContain('영상 설명: 여러 색의 패턴이 6초 동안 움직입니다. 소리는 없습니다.');await click('다시 시도');expect(video()).not.toBe(first);expect(document.activeElement).toBe(button('재생'));expect(first.hasAttribute('src')).toBe(false);
});
it('does not steal close-button focus on a media error and pauses on document hiding without auto-resume',async()=>{
 await click('영상 미리보기');await click('재생');const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true);await act(async()=>document.dispatchEvent(new Event('visibilitychange')));expect(button('재생')).toBeDefined();hidden.mockReturnValue(false);await act(async()=>document.dispatchEvent(new Event('visibilitychange')));expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);button('영상 닫기').focus();await act(async()=>video().dispatchEvent(new Event('error')));expect(document.activeElement).toBe(button('영상 닫기'));
});
it('ignores a pending request rejection after close and keeps the reopened player clean',async()=>{
 let reject!:(error:Error)=>void;vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(()=>new Promise((_resolve,fail)=>{reject=fail;}));await click('영상 미리보기');await click('재생');await click('영상 닫기');await closed();await click('영상 미리보기');await act(async()=>reject(new Error('old')));expect(document.body.textContent).not.toContain('재생을 시작하지 못했어요.');expect(button('재생')).toBeDefined();
});
it('invalidates pending play on hiding without turning its later abort into a user-visible failure',async()=>{
 let reject!:(error:Error)=>void;vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(()=>new Promise((_resolve,fail)=>{reject=fail;}));await click('영상 미리보기');await click('재생');expect(button('재생 준비 중').getAttribute('aria-disabled')).toBe('true');const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true);await act(async()=>{document.dispatchEvent(new Event('visibilitychange'));reject(new Error('interrupted'));});expect(document.body.textContent).not.toContain('재생을 시작하지 못했어요.');expect(button('재생').disabled).toBe(false);hidden.mockReturnValue(false);await act(async()=>document.dispatchEvent(new Event('visibilitychange')));expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
});
it('preserves keyboard focus on the pending play action until its request settles',async()=>{
 let reject!:(error:Error)=>void;vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(()=>new Promise((_resolve,fail)=>{reject=fail;}));await click('영상 미리보기');const play=button('재생');play.focus();await act(async()=>userEvent.keyboard('{Enter}'));expect(document.activeElement===play).toBe(true);await act(async()=>reject(new Error('blocked')));expect(document.activeElement===button('재생')).toBe(true);
});
it('recovers pending-play keyboard focus to retry when the media fails',async()=>{
 vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(()=>new Promise(()=>{}));await click('영상 미리보기');button('재생').focus();await act(async()=>userEvent.keyboard('{Enter}'));await act(async()=>video().dispatchEvent(new Event('error')));expect(document.activeElement===button('다시 시도')).toBe(true);
});

it('decodes and plays the bundled local clip when this browser supports its video host',async(context)=>{
 vi.restoreAllMocks();const probe=document.createElement('video');if(!probe.canPlayType('video/mp4')){context.skip();return;}
 await click('영상 미리보기');const media=video();await expect.poll(()=>media.readyState>=1||media.error!==null,{timeout:5000}).toBe(true);
 if(media.error?.code===4){context.skip();return;}
 expect(media.error).toBeNull();expect(media.duration).toBeGreaterThan(5);expect(media.duration).toBeLessThan(7);
 await act(async()=>{await userEvent.click(button('재생'));await expect.poll(()=>media.currentTime,{timeout:5000}).toBeGreaterThan(0.1);});expect(media.paused).toBe(false);await act(async()=>{button('일시 정지').click();await new Promise(resolve=>media.addEventListener('pause',resolve,{once:true}));});expect(media.paused).toBe(true);await click('영상 닫기');expect(media.hasAttribute('src')).toBe(false);
});
