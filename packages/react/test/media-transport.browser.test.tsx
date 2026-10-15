import { act, Profiler, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach,beforeEach,expect,it,vi } from "vitest";
import { MediaTransport } from "../src/media-transport.js";
import { HjmProvider } from "../src/provider.js";
import { compositionBrandFixtures } from "../../../showcase/shared/composition-brand-fixtures.js";
import "../src/styles.css";
const labels={play:"재생",pause:"일시 정지",seek:"재생 위치",decrement:"뒤로",increment:"앞으로",unknownDuration:"길이 미정",error:"제어 실패"};
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");host.style.width="375px";document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
it("follows actual HTML media events, duration and playback rather than a timer",async()=>{
 function Demo(){const video=useRef<HTMLVideoElement>(null),[playing,setPlaying]=useState(false),[position,setPosition]=useState(0),[duration,setDuration]=useState<number|null>(null);
 return <><video ref={video} src={new URL("../../../showcase/shared/assets/reference-video/preview.mp4",import.meta.url).href} muted playsInline onLoadedMetadata={()=>setDuration(video.current!.duration)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={()=>setPosition(video.current!.currentTime)}/><MediaTransport state={{playing,position,duration}} labels={labels} formatTime={n=>n.toFixed(1)} onPlay={()=>video.current!.play()} onPause={()=>video.current!.pause()} onSeek={n=>{video.current!.currentTime=n;}}/></>;
 }
 await act(async()=>root.render(<HjmProvider reducedMotion><Demo/></HjmProvider>));
 await expect.poll(()=>host.querySelector("video")!.readyState).toBeGreaterThanOrEqual(1);
 await act(async()=>page.getByRole("button",{name:"재생",exact:true}).click());
 await expect.poll(()=>host.querySelector("video")!.paused).toBe(false);
 await expect.poll(()=>host.querySelector('button[aria-label="일시 정지"]')).not.toBeNull();
 const video=host.querySelector("video")!;await act(async()=>{video.currentTime=2;});await expect.poll(()=>video.currentTime).toBeGreaterThanOrEqual(2);
 await act(async()=>page.getByRole("button",{name:"일시 정지",exact:true}).click());expect(video.paused).toBe(true);
 expect(host.querySelector('button[aria-label="재생"]')).not.toBeNull();
});
it("does not claim playing after rejected play and suppresses repeated pending requests",async()=>{
 let reject!:(reason:Error)=>void;const play=vi.fn(()=>new Promise<void>((_,fail)=>{reject=fail;}));
 await act(async()=>root.render(<HjmProvider><MediaTransport state={{playing:false,position:0,duration:null}} labels={labels} formatTime={String} onPlay={play} onPause={()=>undefined} onSeek={()=>undefined}/></HjmProvider>));
 const button=host.querySelector<HTMLButtonElement>('button[aria-label="재생"]')!;await act(async()=>{button.click();button.click();});expect(play).toHaveBeenCalledOnce();
 await act(async()=>reject(new Error("blocked")));expect(host.textContent).toContain("제어 실패");expect(button.getAttribute("aria-label")).toBe("재생");expect(host.querySelector('[role="slider"]')).toBeNull();
});
it("inherits two palettes and both themes without overflowing a narrow host",async()=>{
 for(const palette of Object.values(compositionBrandFixtures))for(const theme of ["light","dark"] as const){
 await act(async()=>root.render(<HjmProvider theme={theme} brandPalette={palette} reducedMotion><MediaTransport state={{playing:true,position:2,duration:6}} labels={labels} formatTime={n=>`${n}초`} onPlay={()=>undefined} onPause={()=>undefined} onSeek={()=>undefined}/></HjmProvider>));
 expect(host.querySelector('button[aria-label="일시 정지"]')).not.toBeNull();expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
 }
});

it("morphs actual state on SVG hosts without committing React on animation frames",async()=>{
 let commits=0;
 const render=(playing:boolean)=><HjmProvider><Profiler id="transport" onRender={()=>{commits++;}}><MediaTransport state={{playing,position:0,duration:6}} labels={labels} formatTime={String} onPlay={()=>undefined} onPause={()=>undefined} onSeek={()=>undefined}/></Profiler></HjmProvider>;
 await act(async()=>root.render(render(false)));await act(async()=>root.render(render(true)));
 await expect.poll(()=>host.querySelector('svg[viewBox="0 0 24 24"] path')?.getAttribute("d")).toBe("M6 4L10 4L10 20L6 20Z");
 expect(commits).toBe(2);
});
