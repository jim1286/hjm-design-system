import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { RadioGroup, CheckboxGroup } from "../src/selection.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { TransferList } from "../src/transfer-list.js";
import { HjmProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let host:HTMLDivElement;let root:Root;
beforeEach(()=>{host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=async(ui:React.ReactNode)=>act(async()=>root.render(<HjmProvider>{ui}</HjmProvider>));
const items=[{id:"a",label:"Alpha",textValue:"Alpha"},{id:"b",label:"Beta",textValue:"Beta"}];
const labels={source:"Source",target:"Target",toTarget:"Add",toSource:"Remove",selectAll:"All",empty:"Empty"};
const row=(id:string)=>host.querySelector<HTMLElement>(`[data-hjm-transfer-row="source:${id}"]`)!;
const add=()=>[...host.querySelectorAll("button")].find(n=>n.textContent==="Add")!;
it("does not revive removed uncontrolled ToggleGroup values after reinsertion",async()=>{
 const changed=vi.fn();const ui=(next:typeof items)=><ToggleGroup descriptor={{accessibilityLabel:"Tools",items:next}} defaultPressedIds={new Set(["b"])} onPressedIdsChange={changed}/>;
 await render(ui(items));await render(ui([items[0]!]));await render(ui(items));
 expect([...host.querySelectorAll("button")].find(n=>n.textContent==="Beta")!.getAttribute("aria-pressed")).toBe("false");expect(changed).toHaveBeenLastCalledWith(new Set());
});
it("reconciles removed uncontrolled TransferList targets without throwing or reviving them",async()=>{
 const changed=vi.fn();const ui=(next:typeof items)=><TransferList items={next} labels={labels} defaultTargetKeys={new Set(["b"])} onTargetKeysChange={changed}/>;
 await render(ui(items));await render(ui([items[0]!]));await render(ui(items));expect(row("b")).not.toBeNull();expect(changed).toHaveBeenLastCalledWith(new Set());
});
it("drops removed TransferList checks before items return",async()=>{
 const ui=(next:typeof items)=><TransferList items={next} labels={labels}/>;
 await render(ui(items));await act(async()=>row("b").click());await render(ui([items[0]!]));await render(ui(items));expect(row("b").getAttribute("aria-selected")).toBe("false");expect(add().disabled).toBe(true);
});
it("keeps a refused controlled transfer selected and retryable",async()=>{
 const changed=vi.fn();await render(<TransferList items={items} labels={labels} targetKeys={new Set<string>()} onTargetKeysChange={changed}/>);
 await act(async()=>{row("a").focus();row("a").click();});await act(async()=>add().click());
 expect(row("a").getAttribute("aria-selected")).toBe("true");expect(document.activeElement).toBe(row("a"));
 await act(async()=>add().click());expect(changed).toHaveBeenCalledTimes(2);
});
it("disables transfer actions when the only checked row becomes disabled",async()=>{
 await render(<TransferList items={items} labels={labels}/>);await act(async()=>row("a").click());
 await render(<TransferList items={[{...items[0]!,disabled:true},items[1]!]} labels={labels}/>);expect(add().disabled).toBe(true);
});
it("leaves controlled ToggleGroup display with the owner after a refused change",async()=>{
 const changed=vi.fn();await render(<ToggleGroup descriptor={{accessibilityLabel:"Tools",items}} pressedIds={new Set(["a"])} onPressedIdsChange={changed}/>);
 const beta=[...host.querySelectorAll("button")].find(n=>n.textContent==="Beta")!;await act(async()=>beta.click());await act(async()=>beta.click());expect(beta.getAttribute("aria-pressed")).toBe("false");expect(changed).toHaveBeenCalledTimes(2);
});

it("keeps controlled radio and checkbox state when edits are refused and retries are allowed",async()=>{
 const radioChange=vi.fn();const checkboxChange=vi.fn();
 await render(<><RadioGroup label="Radio" value="a" items={[{value:"a",label:"Alpha"},{value:"b",label:"Beta"}]} onValueChange={radioChange}/><CheckboxGroup label="Checks" items={items} value={new Set<string>()} onValueChange={checkboxChange}/></>);
 const beta=host.querySelector<HTMLInputElement>('input[type="radio"][value="b"]')!;
 await act(async()=>{beta.focus();});await act(async()=>userEvent.keyboard(" "));await act(async()=>userEvent.keyboard(" "));
 expect(beta.checked).toBe(false);expect(radioChange).toHaveBeenCalledTimes(2);
 const check=host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;await act(async()=>check.click());await act(async()=>check.click());expect(check.checked).toBe(false);expect(checkboxChange).toHaveBeenCalledTimes(2);
});
it("recovers the nearest TransferList row when a focused item is deleted externally",async()=>{
 const ui=(next:typeof items)=><TransferList items={next} labels={labels}/>;
 await render(ui(items));await act(async()=>row("a").focus());await render(ui([items[1]!]));expect(document.activeElement).toBe(row("b"));
});
it("makes empty and entirely disabled TransferList select-all controls inert",async()=>{
 await render(<TransferList items={[{...items[0]!,disabled:true}]} labels={labels}/>);
 expect([...host.querySelectorAll<HTMLButtonElement>('[role="checkbox"]')].every(n=>n.disabled)).toBe(true);
});
it("preserves outside focus on TransferList removal and parks row focus in an emptied panel",async()=>{
 const ui=(next:typeof items)=><><TransferList items={next} labels={labels}/><button id="outside">Outside</button></>;
 await render(ui(items));await act(async()=>row("a").focus());await act(async()=>host.querySelector<HTMLButtonElement>("#outside")!.focus());await render(ui([items[1]!]));expect(document.activeElement).toBe(host.querySelector("#outside"));
 await act(async()=>row("b").focus());await render(ui([]));expect(document.activeElement).toBe(host.querySelector('[data-hjm-transfer-empty="source"]'));
});
