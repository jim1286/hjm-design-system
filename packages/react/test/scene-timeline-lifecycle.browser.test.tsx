import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import { SceneTimeline } from "../../../showcase/web/src/studio/SceneTimeline.js";
import { initialMockupScene } from "../../../showcase/shared/mockup-scene.js";
import { downloadStudioBlob, mockupPng } from "../../../showcase/web/src/studio/draw-mockup.js";
import { exportSceneVideo } from "../../../showcase/web/src/studio/export-scene-video.js";
vi.mock("../../../showcase/web/src/studio/export-scene-video.js", () => ({ supportedSceneVideoType: () => "video/webm", exportSceneVideo: vi.fn() }));
vi.mock("../../../showcase/web/src/studio/draw-mockup.js", async importOriginal => { const actual=await importOriginal<typeof import("../../../showcase/web/src/studio/draw-mockup.js")>(); return { ...actual, downloadStudioBlob: vi.fn(), mockupPng: vi.fn(actual.mockupPng) }; });
let host:HTMLDivElement, root:Root, image:ImageBitmap, live:boolean;
const deferred=<T,>()=>{let resolve!:(value:T)=>void;const promise=new Promise<T>(done=>{resolve=done;});return {promise,resolve};};
const result={blob:new Blob(["video"],{type:"video/webm"}),extension:"webm"};
beforeEach(async()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;vi.clearAllMocks();host=document.createElement("div");document.body.append(host);root=createRoot(host);live=true;const canvas=document.createElement("canvas");canvas.width=20;canvas.height=30;canvas.getContext("2d")!.fillRect(0,0,20,30);image=await createImageBitmap(canvas);});
afterEach(async()=>{if(live)await act(async()=>root.unmount());host.remove();image.close();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function render(ui:ReactNode){await act(async()=>root.render(<HjmProvider reducedMotion={false}>{ui}</HjmProvider>));}
const button=(label:string)=>[...host.querySelectorAll("button")].find(node=>node.textContent===label)!;
const ui=(source:ImageBitmap|null=image,scene=initialMockupScene)=><SceneTimeline image={source} scene={scene} frame={0} onFrame={()=>{}} onTimeline={()=>{}}/>;
it("locks same-render video clicks and ignores a cancelled encoder completion",async()=>{
 const pending=deferred<typeof result>();vi.mocked(exportSceneVideo).mockReturnValue(pending.promise);await render(ui());
 await act(async()=>{button("영상 내보내기").click();button("영상 내보내기").click();});expect(exportSceneVideo).toHaveBeenCalledTimes(1);
 await act(async()=>button("출력 취소").click());expect(vi.mocked(exportSceneVideo).mock.calls[0]![2].aborted).toBe(true);
 await act(async()=>pending.resolve(result));expect(downloadStudioBlob).not.toHaveBeenCalled();expect(host.textContent).toContain("영상 출력을 취소했어요.");
});
it.each(["image", "scene"] as const)("aborts video on %s replacement and keeps late progress/result from the next operation",async(change)=>{
 const first=deferred<typeof result>(),second=deferred<typeof result>();vi.mocked(exportSceneVideo).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);await render(ui());await act(async()=>button("영상 내보내기").click());
 const other=await createImageBitmap(image);await render(ui(change==='image'?other:image,change==='scene'?{...initialMockupScene,title:'Next'}:initialMockupScene));
 expect(vi.mocked(exportSceneVideo).mock.calls[0]![2].aborted).toBe(true);expect(button("영상 내보내기").disabled).toBe(false);
 await act(async()=>button("영상 내보내기").click());await act(async()=>{vi.mocked(exportSceneVideo).mock.calls[0]![3](1);first.resolve(result);});
 expect(downloadStudioBlob).not.toHaveBeenCalled();expect(button("영상 내보내기").disabled).toBe(true);expect(host.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow')).toBe('0');await act(async()=>vi.mocked(exportSceneVideo).mock.calls[1]![3](0.5));expect(host.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow')).toBe('50');
 await act(async()=>second.resolve(result));expect(downloadStudioBlob).toHaveBeenCalledTimes(1);other.close();
});
it("locks duplicate poster saves and discards the encoded result after image removal",async()=>{
 const pending=deferred<Blob>();vi.mocked(mockupPng).mockReturnValueOnce(pending.promise);await render(ui());
 await act(async()=>{button("포스터 PNG 저장").click();button("포스터 PNG 저장").click();});expect(mockupPng).toHaveBeenCalledTimes(1);
 await render(ui(null));await act(async()=>pending.resolve(new Blob(['png'])));expect(downloadStudioBlob).not.toHaveBeenCalled();
});
it("downloads a real PNG with the scene dimensions and releases the poster lock",async()=>{
 const actual=await vi.importActual<typeof import("../../../showcase/web/src/studio/draw-mockup.js")>("../../../showcase/web/src/studio/draw-mockup.js");vi.mocked(mockupPng).mockImplementation(actual.mockupPng);await render(ui());await act(async()=>{button("포스터 PNG 저장").click();await expect.poll(()=>vi.mocked(downloadStudioBlob).mock.calls.length).toBe(1);});
 const [blob,name]=vi.mocked(downloadStudioBlob).mock.calls[0]!;expect(name).toBe('hjm-poster.png');expect(blob.type).toBe('image/png');const decoded=await createImageBitmap(blob);expect([decoded.width,decoded.height]).toEqual([1080,1440]);decoded.close();expect(button('포스터 PNG 저장').disabled).toBe(false);
});
it("aborts pending video and ignores poster completion after unmount",async()=>{
 const video=deferred<typeof result>(),poster=deferred<Blob>();vi.mocked(exportSceneVideo).mockReturnValueOnce(video.promise);vi.mocked(mockupPng).mockReturnValueOnce(poster.promise);await render(ui());await act(async()=>{button('영상 내보내기').click();button('포스터 PNG 저장').click();});await act(async()=>root.unmount());live=false;expect(vi.mocked(exportSceneVideo).mock.calls[0]![2].aborted).toBe(true);await act(async()=>{video.resolve(result);poster.resolve(new Blob(['png']));});expect(downloadStudioBlob).not.toHaveBeenCalled();
});
it("keeps playback time across callback rerenders and cancels scheduled frames on source change",async()=>{
 let now=0,id=0;const frames=new Map<number,FrameRequestCallback>();vi.spyOn(performance,'now').mockImplementation(()=>now);vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>{frames.set(++id,callback);return id;});vi.stubGlobal('cancelAnimationFrame',(key:number)=>frames.delete(key));const onFrame=vi.fn();
 const view=(source:ImageBitmap|null=image)=><SceneTimeline scene={initialMockupScene} image={source} frame={0} onFrame={value=>onFrame(value)} onTimeline={()=>{}}/>;
 await render(view());await act(async()=>button('재생').click());
 for(now=10;now<=80;now+=10){await render(view());const next=[...frames.entries()][0]!;frames.delete(next[0]);await act(async()=>next[1](now));}
 expect(onFrame).toHaveBeenLastCalledWith(2);await render(view(null));expect(frames.size).toBe(0);expect(button('재생').disabled).toBe(true);
});
it.each(['abort','hidden','encoding error'] as const)("releases the encoder track and bitmap after %s",async(reason)=>{
 const actual=await vi.importActual<typeof import('../../../showcase/web/src/studio/export-scene-video.js')>('../../../showcase/web/src/studio/export-scene-video.js');
 const bitmap=await createImageBitmap(image),close=vi.spyOn(bitmap,'close'),stop=vi.fn(),requestFrame=vi.fn();vi.stubGlobal('createImageBitmap',vi.fn().mockResolvedValue(bitmap));
 class Recorder extends EventTarget {static isTypeSupported(){return true;} state='inactive';mimeType='video/webm';start(){this.state='recording';}stop(){this.state='inactive';this.dispatchEvent(new Event('stop'));}}
 class Track {requestFrame(){}}
 vi.stubGlobal('MediaRecorder',Recorder);vi.stubGlobal('CanvasCaptureMediaStreamTrack',Track);vi.spyOn(HTMLCanvasElement.prototype,'captureStream').mockReturnValue({getVideoTracks:()=>[{requestFrame}],getTracks:()=>[{stop}]} as unknown as MediaStream);
 const controller=new AbortController();const progress=vi.fn(()=>{if(reason==='abort')controller.abort();if(reason==='hidden'){vi.spyOn(document,'hidden','get').mockReturnValue(true);document.dispatchEvent(new Event('visibilitychange'));}});
 if(reason==='encoding error')vi.spyOn(Recorder.prototype,'start').mockImplementation(function(this:Recorder){this.state='recording';this.dispatchEvent(new Event('error'));});
 await expect(actual.exportSceneVideo(initialMockupScene,image,controller.signal,progress)).rejects.toMatchObject(reason==='encoding error'?{message:'Video encoding failed'}:{name:'AbortError'});expect(stop).toHaveBeenCalledTimes(1);expect(close).toHaveBeenCalledTimes(1);
});
