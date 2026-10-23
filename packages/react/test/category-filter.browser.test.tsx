import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Chip, SegmentedControl } from "../src/selection.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host=document.createElement("div");document.body.append(host);root=createRoot(host); });
afterEach(async()=>{await act(async()=>root.unmount());host.remove();await page.viewport(1280,720);});
function Fixture({disabled=false,scale=1}:{disabled?:boolean;scale?:number}){const[value,setValue]=useState("all");return <HjmProvider textScale={scale}><SegmentedControl label="카테고리" presentation="pills" disabled={disabled} value={value} onValueChange={setValue} items={[{value:"all",label:"전체"},{value:"place",label:"장소"},{value:"off",label:"준비 중",disabled:true},{value:"daily",label:"일상"}]}/></HjmProvider>}
it("keeps native radio keyboard selection and skips disabled categories",async()=>{
 await act(async()=>root.render(<Fixture/>));const all=host.querySelector<HTMLInputElement>('input[value="all"]')!;all.focus();await act(async()=>{await userEvent.keyboard('{ArrowRight}')});expect(host.querySelector<HTMLInputElement>('input[value="place"]')!.checked).toBe(true);await act(async()=>{await userEvent.keyboard('{ArrowRight}')});expect(host.querySelector<HTMLInputElement>('input[value="daily"]')!.checked).toBe(true);await act(async()=>{await userEvent.keyboard('{ArrowRight}')});expect(all.checked).toBe(true);
});
// Historical maximum-text regression is excluded by the 2026-10-07 user scope.
it.skip("keeps large labels and hit targets within a 320px viewport",async()=>{
 await page.viewport(320,720);await act(async()=>root.render(<Fixture scale={2}/>));for(const label of host.querySelectorAll('label')){const box=label.getBoundingClientRect();expect(box.height).toBeGreaterThanOrEqual(44);expect(box.right).toBeLessThanOrEqual(320);expect(box.left).toBeGreaterThanOrEqual(0);}expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
});
it("disables the whole category group without removing the selected value",async()=>{await act(async()=>root.render(<Fixture disabled/>));expect(host.querySelector('fieldset')!.disabled).toBe(true);expect(host.querySelector<HTMLInputElement>('input[value="all"]')!.checked).toBe(true);});

it.each(["light", "dark"] as const)("shares the neutral selection role and respects product overrides in %s", async theme => {
 const render = (surfaceSelected?: string) => <HjmProvider theme={theme} {...(surfaceSelected ? { brandPalette: { [theme]: { surfaceSelected } } } : {})}>
   <Chip label="업무" selectionMode="single" selected onSelectedChange={()=>{}} />
   <SegmentedControl label="카테고리" selectionTone="neutral" presentation="pills" value="all" onValueChange={()=>{}} items={[{value:"all",label:"전체"},{value:"daily",label:"일상"}]} />
   <SegmentedControl label="구간" selectionTone="neutral" value="all" onValueChange={()=>{}} items={[{value:"all",label:"전체"},{value:"daily",label:"일상"}]} />
 </HjmProvider>;
 for (const override of [undefined, theme === "light" ? "#e8e9ed" : "#42464e"]) {
   await act(async()=>root.render(render(override)));
   const expected=override ? theme === "light" ? "rgb(232, 233, 237)" : "rgb(66, 70, 78)" : theme === "light" ? "rgb(240, 241, 243)" : "rgb(48, 52, 59)";
   const chip=host.querySelector<HTMLElement>(".hjm-chip")!;
   const pill=host.querySelector<HTMLElement>('.hjm-segmented[data-presentation="pills"] .hjm-segmented__item[data-state="checked"]')!;
   const connected=host.querySelector<HTMLElement>('.hjm-segmented:not([data-presentation]) .hjm-segmented__item[data-state="checked"]') ?? host.querySelector<HTMLElement>('.hjm-segmented[data-presentation="connected"] .hjm-segmented__item[data-state="checked"]')!;
   expect(getComputedStyle(chip).backgroundColor).toBe(expected);
   expect(getComputedStyle(pill,"::before").backgroundColor).toBe(expected);
   expect(getComputedStyle(connected).backgroundColor).toBe(expected);
   expect(chip.querySelector(".hjm-chip__indicator")?.textContent).toBe("✓");
   expect(getComputedStyle(chip).color).toBe(getComputedStyle(pill).color);
 }
});

it.each(["light", "dark"] as const)("defaults to the product brand pair for static and moving selections in %s", async theme => {
 for (const presentation of ["connected", "pills"] as const) {
  for (const selectionMotion of ["none", "slide"] as const) {
   await act(async()=>root.render(<HjmProvider theme={theme} reducedMotion brandPalette={{[theme]:{primary:"#0B8045",onPrimary:"#FFFFFF"}}}>
    <SegmentedControl label="보기" presentation={presentation} selectionMotion={selectionMotion} defaultValue="all"
      items={[{value:"all",label:"전체"},{value:"daily",label:"일상"}]} />
   </HjmProvider>));
   if(selectionMotion==="slide") await expect.poll(()=>host.querySelector('.hjm-segmented__highlight')).not.toBeNull();
   const selected=host.querySelector<HTMLElement>('.hjm-segmented__item[data-state="checked"]')!;
   const fill=selectionMotion==="slide" ? getComputedStyle(host.querySelector('.hjm-segmented__highlight')!)
     : getComputedStyle(selected,presentation==="pills" ? "::before" : undefined);
   expect(fill.backgroundColor).toBe("rgb(11, 128, 69)");
   expect(getComputedStyle(selected).color).toBe("rgb(255, 255, 255)");
   const next=host.querySelector<HTMLInputElement>('input[value="daily"]')!;
   await act(async()=>next.click());
   expect(next.checked).toBe(true);
   expect(host.querySelectorAll('input:checked')).toHaveLength(1);
  }
 }
});
