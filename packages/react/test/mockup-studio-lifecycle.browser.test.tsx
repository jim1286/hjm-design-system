import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import { initialMockupScene, serializeMockupScene } from "../../../showcase/shared/mockup-scene.js";
import { MockupStudio } from "../../../showcase/web/src/studio/MockupStudio.js";
import "../src/styles.css";
let host:HTMLDivElement,root:Root;
const downloads: {name:string;blob:Blob}[]=[];
let blobs: Map<string,Blob>;
beforeEach(async()=>{
 (globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 host=document.createElement("div");document.body.append(host);root=createRoot(host);downloads.length=0;blobs=new Map();
 const create=URL.createObjectURL.bind(URL);
 vi.spyOn(URL,"createObjectURL").mockImplementation(blob=>{const url=create(blob);if(blob instanceof Blob)blobs.set(url,blob);return url;});
 vi.spyOn(HTMLAnchorElement.prototype,"click").mockImplementation(function(this:HTMLAnchorElement){downloads.push({name:this.download,blob:blobs.get(this.href)!});});
 await act(async()=>root.render(<HjmProvider reducedMotion><MockupStudio/></HjmProvider>));
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();for(const url of blobs.keys())URL.revokeObjectURL(url);vi.restoreAllMocks();});
const button=(name:string)=>[...host.querySelectorAll<HTMLButtonElement>("button")].find(n=>n.textContent===name)!;
const click=(name:string)=>act(async()=>button(name).click());
const pngFile=()=>{const canvas=document.createElement("canvas");canvas.width=1;canvas.height=1;const data=canvas.toDataURL("image/png").split(",")[1]!;return new File([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],"capture.png",{type:"image/png"});};
const choose=async(file:File,label="화면 캡처")=>act(async()=>{const input=host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;const transfer=new DataTransfer();transfer.items.add(file);input.files=transfer.files;input.dispatchEvent(new Event("change",{bubbles:true}));});
async function loaded(){
 const decode=createImageBitmap.bind(globalThis);let pending:Promise<ImageBitmap>|undefined;
 const spy=vi.spyOn(globalThis,"createImageBitmap").mockImplementationOnce(source=>{pending=decode(source);return pending;});
 try {await act(async()=>{await choose(pngFile());await pending;});}finally{spy.mockRestore();}
 expect(button("PNG 내보내기").disabled).toBe(false);
}
it("starts a single PNG encoding for repeated clicks in one render",async()=>{
 await loaded();const callbacks:BlobCallback[]=[];vi.spyOn(HTMLCanvasElement.prototype,"toBlob").mockImplementation(callback=>{callbacks.push(callback);});
 await act(async()=>{button("PNG 내보내기").click();button("PNG 내보내기").click();});expect(callbacks).toHaveLength(1);
 await act(async()=>callbacks[0]!(new Blob(["png"],{type:"image/png"})));expect(downloads).toHaveLength(1);
});
it("retires pending PNG results on reset without overwriting the empty editor",async()=>{
 await loaded();let finish!:BlobCallback;vi.spyOn(HTMLCanvasElement.prototype,"toBlob").mockImplementation(callback=>{finish=callback;});
 await click("PNG 내보내기");await click("초기화");await act(async()=>finish(new Blob(["old png"],{type:"image/png"})));
 expect(downloads).toHaveLength(0);expect(host.textContent).toContain("스크린샷을 선택해 시작하세요.");expect(button("PNG 내보내기").disabled).toBe(true);
});
it("keeps the current capture after invalid input and retries a failed PNG as real decodable pixels",async()=>{
 await loaded();await choose(new File(["bad"],"invalid.txt",{type:"text/plain"}));expect(host.textContent).toContain("이전 화면은 유지됩니다");expect(button("PNG 내보내기").disabled).toBe(false);
 const encode=HTMLCanvasElement.prototype.toBlob;let encoded:Promise<void>|undefined;
 vi.spyOn(HTMLCanvasElement.prototype,"toBlob").mockImplementation(function(this:HTMLCanvasElement,callback,type,quality){encoded=new Promise(resolve=>encode.call(this,blob=>{callback(blob);resolve();},type,quality));}).mockImplementationOnce(callback=>callback(null));
 await click("PNG 내보내기");expect(host.textContent).toContain("PNG를 내보내지 못했어요");
 await act(async()=>{button("다시 내보내기").click();button("정사각형").click();await encoded;});expect(downloads).toHaveLength(1);
 expect(downloads[0]!.blob.type).toBe("image/png");const decoded=await createImageBitmap(downloads[0]!.blob);expect([decoded.width,decoded.height]).toEqual([1080,1440]);decoded.close();
});
it("ignores an older decode after a newer image and after reset",async()=>{
 const original=createImageBitmap.bind(globalThis);const first=await original(pngFile()),second=await original(pngFile());
 const finish:((value:ImageBitmap)=>void)[]=[];vi.spyOn(globalThis,"createImageBitmap").mockImplementation(()=>new Promise(resolve=>{finish.push(resolve);}));
 await choose(pngFile());await choose(new File([pngFile()],"new.png",{type:"image/png"}));await act(async()=>finish[1]!(second));
 await act(async()=>finish[0]!(first));expect(host.textContent).toContain("new.png · 1 × 1");expect(first.width).toBe(0);
 await choose(pngFile());await click("초기화");const stale=await original(pngFile());await act(async()=>finish[2]!(stale));expect(stale.width).toBe(0);expect(host.textContent).toContain("스크린샷을 선택해 시작하세요.");
});

it("does not let an old encoding failure unlock or overwrite a replacement export",async()=>{
 await loaded();const finish:BlobCallback[]=[];vi.spyOn(HTMLCanvasElement.prototype,"toBlob").mockImplementation(callback=>finish.push(callback));
 await click("PNG 내보내기");await loaded();await click("PNG 내보내기");expect(finish).toHaveLength(2);
 await act(async()=>finish[0]!(null));expect(button("PNG 내보내기").disabled).toBe(true);expect(host.textContent).not.toContain("PNG를 내보내지 못했어요");
 await act(async()=>finish[1]!(new Blob(["new png"],{type:"image/png"})));expect(downloads).toHaveLength(1);expect(button("PNG 내보내기").disabled).toBe(false);
});
it.each(["stay","outside","blur"] as const)("restores the PNG action after retry unless focus moved outside (%s)",async(outside)=>{
 await loaded();let finish!:BlobCallback;
 vi.spyOn(HTMLCanvasElement.prototype,"toBlob").mockImplementation(callback=>{finish=callback;}).mockImplementationOnce(callback=>callback(null));
 await click("PNG 내보내기");button("다시 내보내기").focus();await click("다시 내보내기");
 const input=host.querySelector<HTMLInputElement>('input:not([type="file"])')!;await act(async()=>{if(outside!=="stay")input.focus();if(outside==="blur")input.blur();});
 await act(async()=>finish(new Blob(["png"],{type:"image/png"})));
 expect(document.activeElement).toBe(outside==="outside"?input:outside==="blur"?document.body:button("PNG 내보내기"));
});

it("shows scene import progress, rejects stale JSON and preserves the editor on invalid JSON",async()=>{
 await loaded();let finish!:(value:string)=>void;
 const contents=serializeMockupScene({...initialMockupScene,title:"가져온 장면"});
 const text=vi.spyOn(File.prototype,"text").mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 const json=()=>new File([contents],"scene.json",{type:"application/json"});
 await choose(json(),"장면 설정 불러오기");expect(host.textContent).toContain("장면 설정을 읽는 중이에요.");expect(button("PNG 내보내기").disabled).toBe(true);
 await loaded();await act(async()=>finish(contents));expect(host.querySelector('canvas')!.getAttribute("aria-label")).not.toContain("가져온 장면");
 text.mockResolvedValueOnce("{");await choose(json(),"장면 설정 불러오기");expect(host.textContent).toContain("장면 설정을 읽지 못했어요");expect(button("PNG 내보내기").disabled).toBe(false);
 text.mockResolvedValueOnce(contents);await choose(json(),"장면 설정 불러오기");expect(host.querySelector('canvas')!.getAttribute("aria-label")).toContain("가져온 장면");expect(button("PNG 내보내기").disabled).toBe(true);expect(host.textContent).toContain("파일을 다시 선택해 주세요");
});
