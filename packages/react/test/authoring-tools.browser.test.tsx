import { act,useState } from "react";
import { createRoot,type Root } from "react-dom/client";
import { afterEach,beforeEach,expect,it,vi } from "vitest";
import { BezierEditor,ShortcutRecorder } from "../src/authoring-tools.js";
import { HjmProvider } from "../src/provider.js";
import type { BezierCoordinates } from "@hjmds/design-contracts/authoring-tools";
import "../src/styles.css";
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");host.style.width="375px";document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const labels={record:"기록",recording:"키를 누르세요",empty:"없음",register:"등록",cancel:"취소",error:"등록 실패",status:(s:string)=>s};
function button(label:string){return [...host.querySelectorAll("button")].find(n=>n.textContent===label)!;}
async function capture(code:string,extra:KeyboardEventInit={}){await act(async()=>button("기록").click());await act(async()=>host.querySelector('[role="group"]')!.dispatchEvent(new KeyboardEvent("keydown",{code,ctrlKey:true,shiftKey:true,bubbles:true,cancelable:true,...extra})));}
it("captures actual keyboard events, blocks reserved/conflict and registers only confirmed draft",async()=>{
 const register=vi.fn();await act(async()=>root.render(<HjmProvider><ShortcutRecorder value={null} platform="windows" conflicts={["Ctrl+Shift+KeyJ"]} labels={labels} formatShortcut={s=>s.code} onRegister={register}/></HjmProvider>));
 await capture("KeyW");expect(host.textContent).toContain("reserved");expect(register).not.toHaveBeenCalled();await capture("KeyJ");expect(host.textContent).toContain("conflict");await capture("KeyK");expect(document.activeElement).toBe(host.querySelector('[role="group"]'));expect(host.textContent).toContain("KeyK");await act(async()=>button("등록").click());expect(register).toHaveBeenCalledWith({code:"KeyK",ctrl:true,shift:true,alt:false,meta:false});expect(host.textContent).toContain("없음");expect(host.textContent).not.toContain("ready");
});
it("preserves failed draft and serializes registration; Escape and Tab leave recording",async()=>{
 let reject!:(error:Error)=>void;const register=vi.fn(()=>new Promise<void>((_,fail)=>{reject=fail;}));await act(async()=>root.render(<HjmProvider><ShortcutRecorder value={null} platform="windows" labels={labels} formatShortcut={s=>s.code} onRegister={register}/></HjmProvider>));
 await capture("KeyK");await act(async()=>{button("등록").click();button("등록").click();});expect(register).toHaveBeenCalledOnce();await act(async()=>reject(new Error("failed")));expect(host.textContent).toContain("등록 실패");expect(host.textContent).toContain("KeyK");await capture("Escape");expect(host.textContent).toContain("cancelled");await act(async()=>button("기록").click());await act(async()=>button("기록").focus());expect(host.querySelector('[role="group"]')!.getAttribute("tabindex")).toBe("-1");
});
it("renders four editable coordinates and previews the actual CSS cubic curve without saving tokens",async()=>{
 const animate=vi.spyOn(Element.prototype,"animate"),change=vi.fn();
 function Demo(){const [value,setValue]=useState<BezierCoordinates>([.2,-.5,.8,1.5]);return <BezierEditor value={value} onValueChange={next=>{change(next);setValue(next);}} labels={{coordinates:["x1","y1","x2","y2"],preview:"미리 보기",curve:"곡선",decrement:"감소",increment:"증가"}} formatCoordinate={String}/>;}
 await act(async()=>root.render(<HjmProvider reducedMotion={false}><Demo/></HjmProvider>));expect(host.querySelectorAll('input[type="range"]')).toHaveLength(4);
 const slider=host.querySelectorAll('input[type="range"]')[2]!;await act(async()=>slider.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true,cancelable:true})));expect(change).toHaveBeenCalled();expect(change.mock.lastCall![0][2]).toBeCloseTo(.81);
 await act(async()=>button("미리 보기").click());expect(animate.mock.lastCall![1]).toMatchObject({easing:"cubic-bezier(0.2,-0.5,0.81,1.5)"});expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);animate.mockRestore();
});

it("fits the visible curve to selected controls and endpoints while preserving overshoot",async()=>{
 const render=(value:BezierCoordinates)=><HjmProvider reducedMotion><BezierEditor value={value} onValueChange={()=>undefined} labels={{coordinates:["x1","y1","x2","y2"],preview:"preview",curve:"curve",decrement:"less",increment:"more"}} formatCoordinate={String}/></HjmProvider>;
 await act(async()=>root.render(render([.25,.1,.25,1])));const svg=host.querySelector("svg")!;expect(svg.getAttribute("viewBox")).toBe("-10 -10 120 120");
 const start=new DOMPoint(0,100).matrixTransform(svg.getScreenCTM()!),end=new DOMPoint(100,0).matrixTransform(svg.getScreenCTM()!);expect(start.y-end.y).toBeGreaterThanOrEqual(149);
 await act(async()=>root.render(render([.25,-.5,.75,1.5])));expect(svg.getAttribute("viewBox")).toBe("-10 -60 120 220");expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
});
