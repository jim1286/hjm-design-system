import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ShortcutRail } from "../src/shortcut-rail.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("removes without opening and restores keyboard focus to the surviving shortcut", async () => {
  const host = document.createElement("div"); host.style.width = "180px"; document.body.append(host);
  const root = createRoot(host), open = vi.fn();
  function Example() {
    const [items, setItems] = useState([{ id: "seoul", label: "Seoul" }, { id: "busan", label: "Busan" }, { id: "tokyo", label: "Tokyo", disabled: true }]);
    return <HjmProvider><ShortcutRail label="Recent cities" items={items} onAction={open}
      onRemove={item => setItems(current => current.filter(row => row.id !== item.id))} removeLabel={item => `Remove ${item.label}`} /></HjmProvider>;
  }
  try {
    await act(async () => root.render(<Example />));
    const buttons = () => [...host.querySelectorAll("button")];
    expect(host.querySelectorAll("button button")).toHaveLength(0);
    expect(buttons().every(button => button.getBoundingClientRect().height >= 44)).toBe(true);
    buttons()[1]!.focus();
    await act(async () => buttons()[1]!.click());
    expect(open).not.toHaveBeenCalled();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Busan");
    await act(async () => buttons()[0]!.click()); expect(open).toHaveBeenCalledWith({ id: "busan", label: "Busan" });
    const disabled = buttons().find(button => button.getAttribute("aria-label") === "Tokyo")!;
    await act(async () => disabled.click()); expect(open).toHaveBeenCalledOnce();
    buttons()[1]!.focus(); await act(async () => buttons()[1]!.click());
    expect(document.activeElement).toBe(host.querySelector("ul"));
  } finally { await act(async () => root.unmount()); host.remove(); }
});

it("retains a leading filter trigger when the last condition clears and restores focus there", async()=>{
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);const opened=vi.fn(),action=vi.fn();
 function Example(){const[items,setItems]=useState([{id:"team",label:"LG",clear:true}]);return <HjmProvider><ShortcutRail label="Conditions"
   leading={<button onClick={opened}>Filters</button>} items={items} onAction={action} isRemovable={item=>item.clear}
   onRemove={()=>setItems([])} removeLabel={item=>`Clear ${item.label}`}/></HjmProvider>;}
 try{
  await act(async()=>root.render(<Example/>));const remove=host.querySelector<HTMLButtonElement>('[aria-label="Clear LG"]')!;
  remove.focus();await act(async()=>remove.click());
  expect(host.querySelectorAll("button")).toHaveLength(1);expect(document.activeElement?.textContent).toBe("Filters");
  await act(async()=>host.querySelector("button")!.click());expect(opened).toHaveBeenCalledOnce();expect(action).not.toHaveBeenCalled();
 }finally{await act(async()=>root.unmount());host.remove();}
});
it("moves focus to the retained default item when its clear action disappears", async()=>{
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);const action=vi.fn();
 function Example(){const[active,setActive]=useState(true);return <HjmProvider><ShortcutRail label="Conditions" items={[{id:"season",label:active?"2025":"2026",active},{id:"scope",label:"All",active:false}]}
   onAction={action} onRemove={()=>setActive(false)} isRemovable={item=>item.active} removeLabel={item=>`Clear ${item.label}`}/></HjmProvider>;}
 try{
  await act(async()=>root.render(<Example/>));expect(host.querySelectorAll('button[aria-label^="Clear"]')).toHaveLength(1);
  const remove=host.querySelector<HTMLButtonElement>('[aria-label="Clear 2025"]')!;remove.focus();await act(async()=>remove.click());
  expect(host.querySelectorAll('button[aria-label^="Clear"]')).toHaveLength(0);
  expect(document.activeElement?.getAttribute("aria-label")).toBe("2026");
  await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="2026"]')!.click());expect(action).toHaveBeenCalledWith({id:"season",label:"2026",active:false});
 }finally{await act(async()=>root.unmount());host.remove();}
});
