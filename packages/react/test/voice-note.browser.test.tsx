import {act} from "react";import{createRoot}from"react-dom/client";import{expect,it,vi}from"vitest";
import{VoiceNote}from"../src/voice-note.js";import{HjmProvider}from"../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const base={descriptor:{title:"Memo",state:"paused" as const,duration:84,position:12},labels:{play:"Play",pause:"Pause",seek:"Position",loading:"Loading",error:"Failed",retry:"Retry",backward:"Back",forward:"Forward"},formatTime:(seconds:number)=>`${seconds}s`};

it("keeps player state controlled and supports loading/error/retry",async()=>{
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);const play=vi.fn(),seek=vi.fn(),retry=vi.fn();
 const render=(state:"paused"|"loading"|"error"="paused")=>root.render(<HjmProvider><VoiceNote {...base} descriptor={{...base.descriptor,state}} onPlayingChange={play} onSeek={seek} onRetry={retry}/></HjmProvider>);
 try{await act(()=>render());await act(()=>host.querySelector('button')!.click());expect(play).toHaveBeenCalledWith(true);expect(host.querySelector('button')!.textContent).toContain("Play");expect(host.querySelector('input')!.value).toBe("12");
 await act(()=>host.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));expect(seek).toHaveBeenCalled();
 await act(()=>render("loading"));expect(host.querySelector('input')!.disabled).toBe(true);expect(host.querySelector('button')!.disabled).toBe(true);
 await act(()=>render("error"));expect(host.querySelector('[role="alert"]')!.textContent).toBe("Failed");await act(()=>host.querySelectorAll('button')[1]!.click());expect(retry).toHaveBeenCalledOnce();
 }finally{await act(()=>root.unmount());host.remove();}
});
