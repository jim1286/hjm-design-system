import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { PieChart } from "../src/chart.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("excludes slices and updates the real total independently from emphasis selection", async () => {
 const host=document.createElement("div"); document.body.append(host);const root=createRoot(host);
 function Demo() { const [excluded,setExcluded]=useState<readonly string[]>([]); return <PieChart data={[{id:"a",label:"A",value:60},{id:"b",label:"B",value:30}]} accessibilityLabel="비중" formatValue={String} selectedId="b"
 exclusion={{excludedIds:excluded,onExcludedIdsChange:setExcluded,label:(d,included)=>`${d.label} ${included?"포함":"제외"}`}} centerContent={s=><span data-total>{s.total}</span>} />; }
 try {
 await act(async()=>root.render(<HjmProvider><Demo/></HjmProvider>));
 const originalColor=host.querySelector('path[data-id="b"]')!.getAttribute("fill");
 await act(async()=>host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[0]!.click());
 expect(host.querySelector('[data-total]')!.textContent).toBe("30");expect(host.querySelector('path[data-id="a"]')).toBeNull();
 expect(host.querySelector('path[data-id="b"]')!.getAttribute("fill")).toBe(originalColor);
 expect(host.querySelector('path[data-id="b"]')!.getAttribute("data-selected")).toBe("true");expect(host.textContent).toContain("100%");
 await act(async()=>host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1]!.click());
 expect(host.querySelector('[data-total]')!.textContent).toBe("0");expect(host.querySelectorAll("path")).toHaveLength(0);
 await act(async()=>host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[0]!.click());expect(host.querySelector('[data-total]')!.textContent).toBe("60");
 } finally { await act(async()=>root.unmount());host.remove(); }
});
