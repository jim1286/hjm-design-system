import "../src/styles.css";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { StatisticGroup } from "../src/advanced-display.js";
import { HjmProvider } from "../src/provider.js";

it("keeps narrow count bars in one equal row with values above labels", async () => {
 (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
 const host = document.createElement("div"); host.style.width = "300px"; document.body.append(host); const root = createRoot(host);
 const descriptor = { items: [{ id: "a", label: "A", value: "0" }, { id: "b", label: "B", value: "2" }, { id: "c", label: "C", value: "3" }] };
 try {
  for (const theme of ["light", "dark"] as const) {
   await act(async () => root.render(<HjmProvider theme={theme}><StatisticGroup label="Counts" arrangement="bar" descriptor={descriptor}
    getValueColor={() => "#ff4458"} renderLeading={(_item, context) => <svg aria-hidden="true" width={context.size} height={context.size} stroke={context.color}><path d="M0 0L8 8"/></svg>} /></HjmProvider>));
   const cells = [...host.querySelectorAll<HTMLElement>('[role="listitem"]')];
   expect(cells.map(cell => Math.round(cell.getBoundingClientRect().width))).toEqual([100, 100, 100]);
   expect(cells.every(cell => cell.getBoundingClientRect().top === cells[0]!.getBoundingClientRect().top)).toBe(true);
   const value=host.querySelector<HTMLElement>(".hjm-statistic__value")!, label=host.querySelector<HTMLElement>(".hjm-statistic__label")!;
   expect(value.textContent).toBe("0"); expect(value.getBoundingClientRect().top).toBeLessThan(label.getBoundingClientRect().top);
   expect(getComputedStyle(value).color).toBe("rgb(255, 68, 88)");
   expect(host.querySelector("article")?.getAttribute("aria-label")).toBe("Counts, A, 0");
  }
 } finally { await act(async()=>root.unmount()); host.remove(); }
});
