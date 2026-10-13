import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { DatePicker } from "../src/date-picker.js";
import { DateEntry } from "../src/date-entry.js";
import type { DatePickerDescriptor } from "@hjmds/design-contracts/components/date-picker";
import { HjmProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let host:HTMLDivElement;let root:Root;
beforeEach(()=>{host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const render=async(ui:React.ReactNode)=>act(async()=>root.render(<HjmProvider>{ui}</HjmProvider>));
const grid={todayDate:"2026-10-01",cells:Array.from({length:7},(_,i)=>({date:`2026-10-0${i+1}`})),weekdayLabels:["Su","Mo","Tu","We","Th","Fr","Sa"] as const};
const base={label:"Date",grid,displayValue:null,placeholder:"Choose"};
const picker=(descriptor:DatePickerDescriptor)=><DatePicker descriptor={descriptor} monthLabel="October" clearLabel="Clear" closeLabel="Close" composeAccessibleName={d=>d.date}/>;
const trigger=()=>host.querySelector<HTMLButtonElement>(".hjm-date-picker__trigger")!;
it.each(["readOnly","disabled"] as const)("closes an open picker when %s becomes true without committing",async(state)=>{
 const changed=vi.fn();const opened=vi.fn();
 await render(picker({...base,defaultOpen:true,onSelectionChange:changed,onOpenChange:opened}));
 await render(picker({...base,defaultOpen:true,onSelectionChange:changed,onOpenChange:opened,[state]:true}));
 expect(host.querySelector('[role="dialog"]')).toBeNull();expect(changed).not.toHaveBeenCalled();expect(opened).toHaveBeenLastCalledWith(false,"programmatic");
});
it("uses the latest controlled dismissal callback while open",async()=>{
 const old=vi.fn();const latest=vi.fn();
 await render(picker({...base,open:true,onOpenChange:old}));await render(picker({...base,open:true,onOpenChange:latest}));
 await act(async()=>document.body.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true})));
 expect(latest).toHaveBeenCalledWith(false,"outside");expect(old).not.toHaveBeenCalled();
});
it("closes on keyboard focus leaving the popup without taking focus back",async()=>{
 await render(<>{picker({...base,defaultOpen:true})}<button id="outside">Outside</button></>);
 await act(async()=>host.querySelector<HTMLButtonElement>("#outside")!.focus());
 expect(host.querySelector('[role="dialog"]')).toBeNull();expect(document.activeElement).toBe(host.querySelector("#outside"));
});
it("returns focus when clearing a closed picker and keeps a stable field name",async()=>{
 const changed=vi.fn();await render(picker({...base,defaultSelectedDate:"2026-10-01",displayValue:"October 1",onSelectionChange:changed}));
 expect(trigger().getAttribute("aria-label")).toBe("Date, October 1");
 const clear=host.querySelector<HTMLButtonElement>('.hjm-date-picker__clear')!;
 await act(async()=>{clear.focus();clear.click();});expect(changed).toHaveBeenLastCalledWith(null,"clear");expect(document.activeElement).toBe(trigger());
});
it("commits the current controlled date and cancels without changing the updated value",async()=>{
 const changed=vi.fn();const opened=vi.fn();
 const ui=(date:string)=>picker({...base,selectedDate:date,onSelectionChange:changed,displayValue:date,defaultOpen:true,onOpenChange:opened});
 await render(ui("2026-10-01"));await render(ui("2026-10-02"));expect(host.querySelector('[data-date="2026-10-02"]')!.getAttribute("aria-selected")).toBe("true");
 await act(async()=>host.querySelector<HTMLButtonElement>('[data-date="2026-10-02"]')!.click());expect(changed).toHaveBeenLastCalledWith("2026-10-02","activate");expect(document.activeElement).toBe(trigger());
 await act(async()=>trigger().click());await act(async()=>userEvent.keyboard("{Escape}"));expect(changed).toHaveBeenCalledTimes(1);expect(opened).toHaveBeenLastCalledWith(false,"escape");expect(document.activeElement).toBe(trigger());
});
it("does not treat DateEntry Enter or blur as another value edit",async()=>{
 const changed=vi.fn();const blurred=vi.fn();await render(<DateEntry value={{year:"2026",month:"10",day:"13"}} onValueChange={changed} onBlur={blurred} order={["year","month","day"]} labels={{label:"Date",year:"Year",month:"Month",day:"Day"}} parse={()=>({status:"valid",value:"2026-10-13"})} formatIssue={()=>"Invalid"}/>);
 const input=host.querySelector<HTMLInputElement>("input")!;await act(async()=>input.focus());await act(async()=>userEvent.keyboard("{Enter}{Tab}"));expect(changed).not.toHaveBeenCalled();expect(blurred).toHaveBeenCalledExactlyOnceWith("year");
});

it("keeps the outside click target focused after dismissal",async()=>{
 // A text field takes pointer focus on every engine; macOS WebKit buttons do not.
 // This regression checks that dismissing the picker preserves that native focus.
 await render(<>{picker({...base,defaultOpen:true})}<input id="target" aria-label="Outside"/></>);
 await act(async()=>userEvent.click(host.querySelector<HTMLInputElement>("#target")!));
 expect(host.querySelector('[role="dialog"]')).toBeNull();expect(document.activeElement).toBe(host.querySelector("#target"));
});
