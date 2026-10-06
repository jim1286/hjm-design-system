import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Rating } from "../src/rating.js";
import { ImageComparison } from "../src/image-comparison.js";
import { ContentTransition } from "../src/content-transition.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host:HTMLDivElement, root:Root;
beforeEach(()=>{(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement("div");host.style.width="360px";document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();});
const label=(n:number|null)=>n===null?"미평가":`${n}점`;
it("uses real radio keyboard selection, form values and explicit clearing",async()=>{
 function Fixture(){const [value,set]=useState<number|null>(null);return <HjmProvider><form><Rating label="평가" value={value} onValueChange={set} getValueLabel={label} clearLabel="지우기" name="rating"/></form></HjmProvider>;}
 await act(async()=>root.render(<Fixture/>));
 await page.getByRole("radio",{name:"2점",exact:true}).click();
 await userEvent.keyboard("{ArrowRight}");
 expect(new FormData(host.querySelector("form")!).get("rating")).toBe("3");
 await page.getByRole("button",{name:"지우기",exact:true}).click();
 expect(host.querySelector("input:checked")).toBeNull();expect(host.textContent).toContain("미평가");
 expect(document.activeElement).toBe(host.querySelector('input[value="1"]'));
 await userEvent.keyboard(" ");
 expect(new FormData(host.querySelector("form")!).get("rating")).toBe("1");
});
it("keeps read-only averages non-interactive and disabled ratings inert",async()=>{
 const change=vi.fn();await act(async()=>root.render(<HjmProvider theme="dark" direction="rtl" textScale={2}><Rating label="평균" value={3.5} readOnly getValueLabel={label}/><Rating label="잠김" value={2} onValueChange={change} disabled getValueLabel={label}/></HjmProvider>));
 expect(host.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("평균: 3.5점");
 expect(host.querySelector('[role="img"] input')).toBeNull();
 expect(host.querySelector("input")?.matches(":disabled")).toBe(true);expect(change).not.toHaveBeenCalled();
});
it("compares full-size images through the existing slider including 0/100 endpoints",async()=>{
 const image={src:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50'/%3E",width:100,height:50,label:"전"};
 function Fixture(){const[value,set]=useState(50);return <HjmProvider><ImageComparison label="전 비율" before={image} after={{...image,label:"후"}} value={value} onValueChange={set} getValueText={n=>`${n}%`}/></HjmProvider>;}
 await act(async()=>root.render(<Fixture/>));const slider=host.querySelector('input[type="range"]')! as HTMLInputElement;
 act(()=>slider.focus());await userEvent.keyboard("{End}");expect(slider.value).toBe("100");expect(host.querySelector('[style*="clip-path"]')?.getAttribute("style")).toContain("inset(0px 0% 0px 0px)");
 await userEvent.keyboard("{Home}");expect(slider.value).toBe("0");expect(host.querySelectorAll("img")).toHaveLength(2);
 const widths=Array.from(host.querySelectorAll("img")).map(img=>img.getBoundingClientRect().width);expect(widths[0]).toBeCloseTo(widths[1]!,1);
});
it("animates panel height without an exiting input clone and settles after rapid updates",async()=>{
 const render=(key:string,height:number,reducedMotion=false)=>act(async()=>root.render(<HjmProvider reducedMotion={reducedMotion}><ContentTransition stateKey={key} animateHeight><div style={{height}}><input aria-label="현재 입력"/></div></ContentTransition></HjmProvider>));
 await render("a",60);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 await render("b",220);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 expect(host.querySelectorAll("input")).toHaveLength(1);
 await render("c",90);await expect.poll(()=>host.querySelector("input")!.parentElement!.getBoundingClientRect().height).toBe(90);
 await expect.poll(()=>host.getAnimations({subtree:true}).filter(a=>a.playState==="running").length).toBe(0);
 await render("d",150,true);await new Promise(r=>requestAnimationFrame(r));expect(host.getAnimations({subtree:true}).filter(a=>a.playState==="running")).toHaveLength(0);
});

it("preserves caller layout while measured height settles", async () => {
 const render = (key: string, height: number) => act(async () => root.render(<HjmProvider><ContentTransition stateKey={key} animateHeight layoutStyle={{ width: 300, marginTop: 12 }}><div style={{height}} data-layout-child /></ContentTransition></HjmProvider>));
 await render("a", 40); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
 await render("b", 120); await expect.poll(() => host.getAnimations({subtree:true}).filter(a=>a.playState==="running").length).toBe(0);
 const child=host.querySelector("[data-layout-child]")!; let frame=child.parentElement; while(frame && frame.style.width!=="300px") frame=frame.parentElement;
 expect(frame?.style.width).toBe("300px"); expect(frame?.style.marginTop).toBe("12px");
});
