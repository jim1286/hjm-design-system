import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { StepPlayer } from "../src/step-player.js";
import { HjmProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const base = { descriptor: { steps: [{id:"a",label:"First"},{id:"b",label:"Second"}],currentStepId:"b" }, statusLabels: {pending:"Pending",current:"Current",complete:"Complete",error:"Error"}, composeAccessibleName: ({label}:{label:string})=>label, labels: {play:"Play",pause:"Pause",replay:"Replay",progress:"Playback"}, progress:0.5, playing:false };

it("delegates playback without changing the controlled position and disables actions", async () => {
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
 const change=vi.fn(), replay=vi.fn();
 const render=(playing=false,disabled=false)=>root.render(<HjmProvider><StepPlayer {...base} playing={playing} disabled={disabled} onPlayingChange={change} onReplay={replay}/></HjmProvider>);
 try {
  await act(()=>render());
  expect(host.querySelector('[aria-current="step"]')?.textContent).toContain("Second");
  const progress=host.querySelector('progress')!;expect(progress.value).toBe(0.5);
  await act(()=>host.querySelector('button')!.click());expect(change).toHaveBeenLastCalledWith(true);
  expect(progress.value).toBe(0.5);expect(host.querySelector('button')!.textContent).toBe("Play");
  await act(()=>render(true));await act(()=>host.querySelector('button')!.click());expect(change).toHaveBeenLastCalledWith(false);
  await act(()=>host.querySelectorAll('button')[1]!.click());expect(replay).toHaveBeenCalledOnce();
  await act(()=>render(false,true));change.mockClear();replay.mockClear();
  await act(()=>{for(const button of host.querySelectorAll('button'))button.click();});
  expect(change).not.toHaveBeenCalled();expect(replay).not.toHaveBeenCalled();
 } finally {await act(()=>root.unmount());host.remove();}
});
