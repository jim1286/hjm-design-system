import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SegmentedControl } from "../src/selection.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host=document.createElement("div");document.body.append(host);root=createRoot(host); });
afterEach(async()=>{await act(async()=>root.unmount());host.remove();await page.viewport(1280,720);});
function Fixture({disabled=false,scale=1}:{disabled?:boolean;scale?:number}){const[value,setValue]=useState("all");return <HjmProvider textScale={scale}><SegmentedControl label="카테고리" presentation="pills" disabled={disabled} value={value} onValueChange={setValue} items={[{value:"all",label:"전체"},{value:"place",label:"장소"},{value:"off",label:"준비 중",disabled:true},{value:"daily",label:"일상"}]}/></HjmProvider>}
it("keeps native radio keyboard selection and skips disabled categories",async()=>{
 await act(async()=>root.render(<Fixture/>));const all=host.querySelector<HTMLInputElement>('input[value="all"]')!;all.focus();await act(async()=>{await userEvent.keyboard('{ArrowRight}')});expect(host.querySelector<HTMLInputElement>('input[value="place"]')!.checked).toBe(true);await act(async()=>{await userEvent.keyboard('{ArrowRight}')});expect(host.querySelector<HTMLInputElement>('input[value="daily"]')!.checked).toBe(true);await act(async()=>{await userEvent.keyboard('{ArrowRight}')});expect(all.checked).toBe(true);
});
it("keeps large labels and hit targets within a 320px viewport",async()=>{
 await page.viewport(320,720);await act(async()=>root.render(<Fixture scale={2}/>));for(const label of host.querySelectorAll('label')){const box=label.getBoundingClientRect();expect(box.height).toBeGreaterThanOrEqual(44);expect(box.right).toBeLessThanOrEqual(320);expect(box.left).toBeGreaterThanOrEqual(0);}expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
});
it("disables the whole category group without removing the selected value",async()=>{await act(async()=>root.render(<Fixture disabled/>));expect(host.querySelector('fieldset')!.disabled).toBe(true);expect(host.querySelector<HTMLInputElement>('input[value="all"]')!.checked).toBe(true);});
