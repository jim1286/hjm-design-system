import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Avatar } from "../src/advanced-display.js";
import { createAnimatedBlobatarFallback } from "../src/avatar-blobatar-motion.js";
import { HjmProvider } from "../src/provider.js";
let host: HTMLDivElement, root: Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
const settle=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,60));});
const render=(active=true,visible=true,reducedMotion=false,seed='public-id',offscreen=false)=>act(async()=>root.render(<HjmProvider reducedMotion={reducedMotion}><div style={{marginTop:offscreen?10000:0}}><Avatar name="Person" renderFallback={createAnimatedBlobatarFallback({seed,active,visible,expression:'thinking'})}/></div></HjmProvider>));
it('runs actual Blobatar CSS only while visible and foreground, preserving its decorative name boundary',async()=>{
 await render();await settle();expect(host.querySelector('.mo-root')).not.toBeNull();const animations=()=>host.getAnimations({subtree:true});await expect.poll(()=>animations().length).toBeGreaterThan(0);const initial=animations()[0]!;await expect.poll(()=>Number(initial.currentTime)).toBeGreaterThan(0);
 expect(host.querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('Person');expect(host.querySelector('span[aria-hidden="true"]')).not.toBeNull();
 await render(true,true,false,'public-id',true);await settle();expect(host.querySelector('.mo-root')).toBeNull();expect(animations()).toHaveLength(0);
 await render();await settle();expect(host.querySelector('.mo-root')).not.toBeNull();const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true);await act(async()=>{document.dispatchEvent(new Event('visibilitychange'));});expect(host.querySelector('.mo-root')).toBeNull();
 hidden.mockReturnValue(false);await act(async()=>{document.dispatchEvent(new Event('visibilitychange'));});expect(host.querySelector('.mo-root')).not.toBeNull();
 await render(true,true,true);expect(animations()).toHaveLength(0);const old=host.querySelector('img')!.src;await render(false,true,true,'new-id');expect(host.querySelector('img')!.src).not.toBe(old);
 await render();await settle();const running=animations();await act(async()=>root.render(null));expect(running.every(animation=>animation.playState!=='running')).toBe(true);
});
it('retains static artwork when IntersectionObserver is unavailable',async()=>{
 vi.stubGlobal('IntersectionObserver',undefined);await render();await settle();expect(host.querySelector('img')).not.toBeNull();expect(host.getAnimations({subtree:true})).toHaveLength(0);
});
