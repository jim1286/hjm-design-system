import {act,useState} from "react";
import {createRoot} from "react-dom/client";
import {page} from "vitest/browser";
import {expect,it} from "vitest";
import {HjmProvider} from "../src/provider.js";
import {PhotoSourceSheet} from "../src/screen-flows.js";
import "../src/styles.css";
// Narrow phone + large text exposed clipped media controls in the native audit.
// This check keeps every source action and Close inside the viewport at those sizes.
it.each([{name:"light",theme:"light" as const,scale:1 as const},{name:"dark",theme:"dark" as const,scale:1 as const},{name:"large",theme:"light" as const,scale:2 as const}])("keeps photo choices visible on a phone: $name",async({name,theme,scale})=>{
 (globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 await page.viewport(390,844);
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
 function Fixture(){const [open,setOpen]=useState(true);return <HjmProvider theme={theme} textScale={scale}><PhotoSourceSheet open={open} onOpenChange={setOpen} onSelect={()=>{}} labels={{title:"사진 추가",library:"앨범에서 선택",camera:"사진 촬영",cancel:"취소"}}/></HjmProvider>;}
 try{
 await act(async()=>root.render(<Fixture/>));
 await expect.element(page.getByRole("button",{name:"사진 촬영",exact:true})).toBeVisible();
 for(const label of ["앨범에서 선택","사진 촬영","취소"]){
 const button=Array.from(document.querySelectorAll("button")).find(node=>node.textContent===label||node.getAttribute("aria-label")===label)!;
 const rect=button.getBoundingClientRect();expect(rect.left).toBeGreaterThanOrEqual(0);expect(rect.right).toBeLessThanOrEqual(390);expect(rect.bottom).toBeLessThanOrEqual(844);
 }
 if((import.meta as ImportMeta & {env:{VITE_PHOTO_EVIDENCE?:string}}).env.VITE_PHOTO_EVIDENCE==="1")await page.screenshot({path:`/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/docs/evidence/photo-source-2026-10-05/${name}.png`});
 }finally{await act(async()=>root.unmount());host.remove();}
});
