import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Tree } from "../src/tree.js";
import { Select } from "../src/select.js";
import { CheckboxGroup, RadioGroup } from "../src/selection.js";
import { HjmProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let host:HTMLDivElement; let root:Root;
beforeEach(()=>{host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=async(ui:React.ReactNode)=>act(async()=>root.render(<HjmProvider>{ui}</HjmProvider>));
const nodes=[{id:"a",label:"Alpha",textValue:"Alpha"},{id:"b",label:"Beta",textValue:"Beta"}];
const item=(id:string)=>host.querySelector<HTMLElement>(`[data-hjm-tree-node="${id}"]`)!;
const key=async(target:HTMLElement,key:string)=>act(async()=>target.dispatchEvent(new KeyboardEvent("keydown",{key,bubbles:true,cancelable:true})));
it("drops removed uncontrolled Tree selections before the item is inserted again",async()=>{
 const changed=vi.fn();
 const ui=(items:typeof nodes)=><Tree label="Tree" nodes={items} composeAccessibleName={n=>n.label} selection={{mode:"multiple",defaultSelectedKeys:new Set(["b"]),onSelectionChange:changed}}/>;
 await render(ui(nodes)); await render(ui([nodes[0]!]));
 expect(changed).toHaveBeenLastCalledWith(new Set());
 await act(async()=>item("a").click());
 expect(changed).toHaveBeenLastCalledWith(new Set(["a"]));
 await render(ui(nodes)); expect(item("b").getAttribute("aria-selected")).toBe("false");
});
it("recovers Tree focus to a surviving ancestor on external collapse without stealing outside focus",async()=>{
 const branches=[{...nodes[0]!,children:[nodes[1]!]}];
 const ui=(expanded:boolean)=><><Tree label="Tree" nodes={branches} expandedKeys={new Set(expanded?["a"]:[])} composeAccessibleName={n=>n.label}/><button>Outside</button></>;
 await render(ui(true));await act(async()=>item("b").focus());await render(ui(false));
 expect(document.activeElement).toBe(item("a"));
 await act(async()=>host.querySelector("button")!.focus());await render(ui(true));await render(ui(false));
 expect(document.activeElement).toBe(host.querySelector("button"));
});
it("reconciles removed group values and respects dynamic readOnly and disabled",async()=>{
 const changed=vi.fn();
 const ui=(items:typeof nodes,locked=false)=><CheckboxGroup label="Group" items={items} defaultValue={new Set(["b"])} onValueChange={changed} readOnly={locked}/>;
 await render(ui(nodes));await render(ui([nodes[0]!]));expect(changed).toHaveBeenLastCalledWith(new Set());
 await render(ui([nodes[0]!],true));await act(async()=>host.querySelector<HTMLInputElement>("input")!.click());expect(changed).toHaveBeenCalledTimes(1);
 await render(<RadioGroup label="Radio" items={[{value:"a",label:"Alpha"},{value:"b",label:"Beta",disabled:true}]} defaultValue="a" disabled onValueChange={changed}/>);
 await act(async()=>host.querySelector<HTMLInputElement>('input[value="b"]')!.click());expect(changed).toHaveBeenCalledTimes(1);
});
it("retries rejected Select opening and avoids committing highlights on blur",async()=>{
 const changed=vi.fn();const opened=vi.fn();
 const ui=(open:boolean)=><Select label="Pick" items={nodes} open={open} onOpenChange={opened} onSelectionChange={changed} placeholder="Choose" emptySelectionLabel="Clear"/>;
 await render(ui(false));const trigger=host.querySelector<HTMLElement>('[role="combobox"]')!;
 await key(trigger,"ArrowDown");await key(trigger,"ArrowDown");expect(opened).toHaveBeenCalledTimes(2);
 await render(ui(true));await key(trigger,"ArrowDown");await act(async()=>trigger.dispatchEvent(new FocusEvent("focusout",{bubbles:true,relatedTarget:document.body})));
 expect(changed).not.toHaveBeenCalled();
});
it("closes an uncontrolled Select popup when the field becomes readonly",async()=>{
 const changed=vi.fn();const opened=vi.fn();
 const ui=(readOnly:boolean)=><Select label="Pick" items={nodes} defaultOpen readOnly={readOnly} onOpenChange={opened} onSelectionChange={changed} placeholder="Choose" emptySelectionLabel="Clear"/>;
 await render(ui(false));expect(document.querySelector('[role="listbox"]')).not.toBeNull();
 await render(ui(true));expect(document.querySelector('[role="listbox"]')).toBeNull();
 expect(changed).not.toHaveBeenCalled();expect(opened).toHaveBeenLastCalledWith(false,"programmatic");
});

it("clears a removed single Tree selection and prevents disabled row activation",async()=>{
 const changed=vi.fn();
 const ui=(next:readonly (typeof nodes[number] & {disabled?:boolean})[])=><Tree label="Tree" nodes={next} composeAccessibleName={n=>n.label} selection={{mode:"single",defaultSelectedKey:"b",onSelectionChange:changed}}/>;
 await render(ui(nodes));await render(ui([nodes[0]!]));expect(changed).toHaveBeenLastCalledWith(null);
 await render(ui([{...nodes[0]!,disabled:true}]));await act(async()=>item("a").focus());await key(item("a"),"Enter");expect(changed).toHaveBeenCalledTimes(1);
});
it("keeps readonly RadioGroup selection during real keyboard navigation",async()=>{
 const changed=vi.fn();
 const ui=(readOnly:boolean)=><RadioGroup label="Radio" items={[{value:"a",label:"Alpha"},{value:"b",label:"Beta"}]} defaultValue="a" onValueChange={changed} readOnly={readOnly}/>;
 await render(ui(false));await act(async()=>host.querySelector<HTMLInputElement>('input[value="a"]')!.focus());await render(ui(true));
 await act(async()=>userEvent.keyboard("{ArrowRight}"));
 expect(changed).not.toHaveBeenCalled();expect(host.querySelector<HTMLInputElement>('input[value="a"]')!.checked).toBe(true);
});
