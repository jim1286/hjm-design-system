import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { GravityLetters } from "../src/gravity-letters.js";
import { GridReveal } from "../src/grid-reveal.js";
import { HjmProvider } from "../src/provider.js";
let root:Root,host:HTMLDivElement;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();});
it.each(['letters','grid'])('preserves content and cancels partial animations when %s animation creation fails',async kind=>{
 const original=Element.prototype.animate;const created:Animation[]=[];let calls=0;vi.spyOn(Element.prototype,'animate').mockImplementation(function(this:Element,...args:Parameters<Element['animate']>){if(++calls===2)throw new Error('Host animation failed');const animation=original.apply(this,args);created.push(animation);return animation;});
 await act(async()=>root.render(<HjmProvider reducedMotion={false}>{kind==='letters'?<GravityLetters active glyphs={['A','B']}/>:<GridReveal ready><button>Content</button></GridReveal>}</HjmProvider>));
 expect(host.textContent).toContain(kind==='letters'?'AB':'Content');expect(created).toHaveLength(1);expect(created[0]!.playState).toBe('idle');
});
it.each(['letters','grid'])('cancels %s on visibility loss, replacement and unmount',async kind=>{
 const view=(key:number)=><HjmProvider reducedMotion={false}>{kind==='letters'?<GravityLetters active glyphs={['A','B']} replayKey={key}/>:<GridReveal key={key} ready><button>Content</button></GridReveal>}</HjmProvider>;
 await act(async()=>root.render(view(0)));const first=host.getAnimations({subtree:true});expect(first.length).toBeGreaterThan(0);
 const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true);await act(async()=>{document.dispatchEvent(new Event('visibilitychange'));});expect(first.every(a=>a.playState==='idle')).toBe(true);
 hidden.mockReturnValue(false);await act(async()=>root.render(view(1)));const last=host.getAnimations({subtree:true});expect(last.length).toBeGreaterThan(0);await act(async()=>root.render(null));expect(last.every(a=>a.playState==='idle')).toBe(true);
});
