import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {page,userEvent} from 'vitest/browser';
import {expect,it} from 'vitest';
import {HjmProvider} from '../src/provider.js';
import {InstagramCommentsPreview} from '../../../showcase/web/src/patterns/instagram-comments-preview.js';
import '../src/styles.css';

// Exercise the public preview and real Menu, not just DOM sibling order: moving
// overflow must preserve reaction, Escape/focus return and the reply target.
it.each([{theme:'light' as const,scale:1 as const},{theme:'dark' as const,scale:1 as const},{theme:'light' as const,scale:2 as const}])('keeps vertical overflow beside the heart and independent from reply: $theme/$scale',async({theme,scale})=>{
 (globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 await page.viewport(320,844);
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 const out=(import.meta as ImportMeta & {env:{VITE_COMMENT_EVIDENCE_DIR?:string}}).env.VITE_COMMENT_EVIDENCE_DIR;
 try{
  await act(async()=>root.render(<HjmProvider theme={theme} textScale={scale}><InstagramCommentsPreview/></HjmProvider>));
  const more=host.querySelector<HTMLButtonElement>('button[aria-label="seoyeon 댓글 더보기"]')!,heart=host.querySelector<HTMLButtonElement>('button[aria-label="seoyeon 댓글 좋아요"]')!;
  const m=more.getBoundingClientRect(),h=heart.getBoundingClientRect();
  expect(Math.abs(m.y-h.y)).toBeLessThan(1);expect(m.x).toBeGreaterThan(h.x);expect(m.right).toBeLessThanOrEqual(320);expect(m.width).toBeGreaterThanOrEqual(44);expect(m.height).toBeGreaterThanOrEqual(44);
  const dots=[...more.querySelectorAll('circle')];expect(dots).toHaveLength(3);expect(new Set(dots.map(dot=>dot.getAttribute('cx'))).size).toBe(1);
  if(out)await page.screenshot({path:`${out}/${theme}-${scale}-ready.png`});
  await page.getByRole('button',{name:'seoyeon 댓글 좋아요',exact:true}).click();
  await expect.element(page.getByText('좋아요 25개',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'seoyeon 댓글 더보기',exact:true}).click();
  await expect.element(page.getByRole('menuitem',{name:'답글 달기',exact:true})).toBeVisible();
  if(out)await page.screenshot({path:`${out}/${theme}-${scale}-menu.png`});
  await userEvent.keyboard('{Escape}');expect(document.activeElement).toBe(more);
  await page.getByRole('button',{name:'seoyeon 댓글 더보기',exact:true}).click();
  await page.getByRole('menuitem',{name:'답글 달기',exact:true}).click();
  await expect.element(page.getByRole('textbox',{name:'seoyeon님에게 답글',exact:true})).toHaveValue('@seoyeon ');
  await expect.element(page.getByText('좋아요 25개',{exact:true})).toBeVisible();
  if(out)await page.screenshot({path:`${out}/${theme}-${scale}-reply.png`});
 }finally{await act(async()=>root.unmount());host.remove();}
});
