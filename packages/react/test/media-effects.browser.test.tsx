import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { ImageComparison } from "../src/image-comparison.js";
import { EffectSurface } from "../src/effect-surface.js";
import { AnimatedStatistic } from "../src/statistic-motion.js";
import { HjmProvider } from "../src/provider.js";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); });
const render = (node: React.ReactNode, reduced = false) => act(async () => root.render(<HjmProvider reducedMotion={reduced}>{node}</HjmProvider>));
const observerFrame = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
const asset = {src:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="4" height="2"/%3E',width:400,height:200};
it("keeps comparison keyboard bounds, controlled divider, disabled state and updated captions in sync", async () => {
 function View({disabled=false,height=200,label='Before'}:{disabled?:boolean;height?:number;label?:string}) { const [value,setValue]=useState(50); return <ImageComparison before={{...asset,height,label}} after={{...asset,height,label:'After'}} label="Comparison" value={value} onValueChange={setValue} getValueText={value=>`${value}% before`} disabled={disabled}/>; }
 await render(<View/>); const slider=host.querySelector<HTMLInputElement>('input')!; await act(async()=>slider.focus()); await act(async()=>{await userEvent.keyboard('{End}');});
 expect(slider.value).toBe('100'); expect(slider.getAttribute('aria-valuetext')).toBe('100% before');
 expect(host.querySelector<HTMLElement>('[aria-hidden="true"][style*="border-inline-start"]')!.style.left).toBe('100%');
 await act(async()=>{await userEvent.keyboard('{Home}');}); expect(slider.value).toBe('0');
 await render(<View disabled height={400} label="Original"/>); expect(slider.disabled).toBe(true); expect(host.textContent).toContain('Original');
 expect(host.querySelector<HTMLElement>('[style*="aspect-ratio"]')!.style.aspectRatio).toBe('1 / 1');
 await act(async()=>{await userEvent.keyboard('{ArrowRight}');}); expect(slider.value).toBe('0'); await render(<View/>); await act(async()=>slider.focus()); await act(async()=>{await userEvent.keyboard('{ArrowRight}');}); expect(slider.value).toBe('1');
});
it("cancels real atmosphere animations outside the viewport, for reduced motion and on unmount", async () => {
 const view=(offscreen=false)=><EffectSurface descriptor={{active:true,layers:['mesh']}} layoutStyle={{marginTop:offscreen?10000:0}}><button>Usable</button></EffectSurface>;
 await render(view()); await observerFrame(); const layer=host.querySelector('svg')!;
 await expect.poll(()=>layer.getAnimations().length).toBe(1); const running=layer.getAnimations()[0]!; await expect.poll(()=>Number(running.currentTime)).toBeGreaterThan(0);
 await render(view(true)); await observerFrame(); await expect.poll(()=>layer.getAnimations().length).toBe(0);
 await render(view()); await observerFrame(); await expect.poll(()=>layer.getAnimations().length).toBe(1);
 await render(view(),true); expect(layer.getAnimations()).toHaveLength(0);
 await render(view()); await observerFrame(); await expect.poll(()=>layer.getAnimations().length).toBe(1); const last=layer.getAnimations()[0]!;
 await render(null); expect(last.playState).toBe('idle');
});
it("stops and resumes atmosphere on document visibility while retaining static content", async () => {
 await render(<EffectSurface descriptor={{active:true}}>Content</EffectSurface>); await observerFrame(); const layer=host.querySelector('svg')!; await expect.poll(()=>layer.getAnimations().length).toBe(1);
 const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true); await act(async()=>document.dispatchEvent(new Event('visibilitychange'))); expect(layer.getAnimations()).toHaveLength(0); expect(host.textContent).toContain('Content');
 hidden.mockReturnValue(false); await act(async()=>document.dispatchEvent(new Event('visibilitychange'))); expect(layer.getAnimations()).toHaveLength(1);
});
it("renders latest statistic through actual NumberFlow rapid updates and reduced motion", async () => {
 const view=(value:number)=><AnimatedStatistic descriptor={{id:'total',label:'Total'}} value={value} locale="en-US"/>;
 await render(view(10)); await render(view(120));
 const flow=host.querySelector('number-flow-react')!; expect(flow.shadowRoot).not.toBeNull(); await expect.poll(()=>flow.shadowRoot!.getAnimations().length).toBeGreaterThan(0);
 await render(view(5)); await render(view(1234)); expect(host.querySelector('article')!.getAttribute('aria-label')).toContain('1,234');
 await expect.poll(()=>flow.shadowRoot!.getAnimations().length,{timeout:3000}).toBe(0);
 await render(view(9000)); expect(flow.shadowRoot!.getAnimations().length).toBeGreaterThan(0); const retired=flow.shadowRoot!.getAnimations();
 await render(view(42),true); expect(retired.every(animation=>animation.playState!=='running')).toBe(true); expect(host.querySelector('number-flow-react')).toBeNull(); expect(host.textContent).toContain('42');
});
it("settles ongoing statistic animations when hidden or unmounted", async () => {
 const view=(value:number)=><AnimatedStatistic descriptor={{id:'total',label:'Total'}} value={value} locale="en-US"/>;
 await render(view(1)); await render(view(999)); const flow=host.querySelector('number-flow-react')!; await expect.poll(()=>flow.shadowRoot!.getAnimations().length).toBeGreaterThan(0);
 const animations=flow.shadowRoot!.getAnimations(); const state=vi.spyOn(document,'visibilityState','get').mockReturnValue('hidden'); await act(async()=>document.dispatchEvent(new Event('visibilitychange')));
 expect(flow.shadowRoot!.getAnimations().filter(animation=>animation.playState==='running')).toHaveLength(0);
 await render(view(333)); expect(flow.shadowRoot!.getAnimations().filter(animation=>animation.playState==='running')).toHaveLength(0); expect(host.querySelector('article')!.getAttribute('aria-label')).toContain('333');
 state.mockReturnValue('visible'); await act(async()=>document.dispatchEvent(new Event('visibilitychange'))); await render(view(777)); const latest=flow.shadowRoot!.getAnimations(); expect(latest.length).toBeGreaterThan(0); await render(null);
 expect(latest.every(animation=>animation.playState!=='running')).toBe(true); expect(animations.every(animation=>animation.playState!=='running')).toBe(true);
});
it("keeps usable static decoration when the browser animation host rejects creation", async () => {
 const animate=vi.spyOn(SVGElement.prototype,'animate').mockImplementation(()=>{throw new Error('Unsupported host');});
 await render(<EffectSurface descriptor={{active:true}}><button>Continue</button></EffectSurface>);await observerFrame();expect(animate).toHaveBeenCalledOnce();expect(host.querySelector('svg')).not.toBeNull();expect(host.querySelector('button')!.textContent).toBe('Continue');
 await act(async()=>{document.dispatchEvent(new Event('visibilitychange'));});expect(animate).toHaveBeenCalledOnce();
});
it("settles offscreen statistic motion and shows the latest value when it reappears", async () => {
 const view=(value:number,offscreen=false)=><div style={{marginTop:offscreen?10000:0}}><AnimatedStatistic descriptor={{id:'total',label:'Total'}} value={value} locale="en-US"/></div>;
 await render(view(1));await observerFrame();await render(view(100));const flow=host.querySelector('number-flow-react')!;expect(flow.shadowRoot!.getAnimations().length).toBeGreaterThan(0);
 await render(view(100,true));await observerFrame();expect(flow.shadowRoot!.getAnimations().filter(animation=>animation.playState==='running')).toHaveLength(0);
 await render(view(200,true));expect(flow.shadowRoot!.getAnimations().filter(animation=>animation.playState==='running')).toHaveLength(0);expect(host.querySelector('article')!.getAttribute('aria-label')).toContain('200');
 await render(view(200));await observerFrame();await render(view(300));expect(flow.shadowRoot!.getAnimations().length).toBeGreaterThan(0);
});
