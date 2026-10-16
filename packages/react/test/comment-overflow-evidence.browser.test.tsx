import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {page,userEvent} from 'vitest/browser';
import {expect,it} from 'vitest';
import {HjmProvider} from '../src/provider.js';
import {InstagramCommentsPreview} from '../../../showcase/web/src/patterns/instagram-comments-preview.js';
import '../src/styles.css';

// 2026-10-16: the per-comment overflow menu was replaced by the long-press hold menu (Instagram comment
// sheet). Exercise the public preview: the heart keeps a 44px target with the bare count under it, and the
// hold menu's reply action fills the composer reply target without touching the like state.
it.each([{theme:'light' as const,scale:1 as const},{theme:'dark' as const,scale:1 as const},{theme:'light' as const,scale:2 as const}])('opens the comment hold menu and keeps like state independent from reply: $theme/$scale',async({theme,scale})=>{
 (globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 await page.viewport(320,844);
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 const out=(import.meta as ImportMeta & {env:{VITE_COMMENT_EVIDENCE_DIR?:string}}).env.VITE_COMMENT_EVIDENCE_DIR;
 try{
  await act(async()=>root.render(<HjmProvider theme={theme} textScale={scale}><InstagramCommentsPreview/></HjmProvider>));
  const heart=host.querySelector<HTMLButtonElement>('button[aria-label^="seoyeon 댓글 좋아요"]')!;
  const h=heart.getBoundingClientRect();expect(h.width).toBeGreaterThanOrEqual(44);expect(h.height).toBeGreaterThanOrEqual(44);expect(h.right).toBeLessThanOrEqual(320);
  if(out)await page.screenshot({path:`${out}/${theme}-${scale}-ready.png`});
  await act(async()=>heart.click());
  await expect.element(page.getByText('25',{exact:true})).toBeVisible();
  const trigger=[...host.querySelectorAll<HTMLElement>('.hjm-comment-row__reactions')].find(node=>node.textContent?.includes('seoyeon'))!;
  await act(async()=>{trigger.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));});
  await expect.element(page.getByRole('button',{name:'답글 달기',exact:true}).last()).toBeVisible();
  await expect.element(page.getByRole('button',{name:'신고',exact:true})).toBeVisible();
  if(out)await page.screenshot({path:`${out}/${theme}-${scale}-menu.png`});
  await page.getByRole('button',{name:'답글 달기',exact:true}).last().click();
  await expect.element(page.getByRole('textbox',{name:'seoyeon님에게 답글',exact:true})).toHaveValue('@seoyeon ');
  await expect.element(page.getByText('25',{exact:true})).toBeVisible();
  if(out)await page.screenshot({path:`${out}/${theme}-${scale}-reply.png`});
 }finally{await act(async()=>root.unmount());host.remove();}
});
