import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, Pressable, TextInput } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { DatePicker } from "../src/date-picker.js";
import { DateEntry } from "../src/date-entry.js";
import { Calendar } from "../src/calendar.js";
import { Sheet } from "../src/overlays.js";
import { HjmNativeProvider } from "../src/provider.js";
import type { DatePickerDescriptor } from "@hjmds/design-contracts/components/date-picker";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{act(()=>tree?.unmount());tree=undefined;});
const render=(ui:React.ReactNode)=>act(()=>{const wrapped=<HjmNativeProvider>{ui}</HjmNativeProvider>;if(tree)tree.update(wrapped);else tree=create(wrapped,{createNodeMock:()=>({})});});
const grid={todayDate:"2026-10-01",cells:Array.from({length:7},(_,i)=>({date:`2026-10-0${i+1}`})),weekdayLabels:["Su","Mo","Tu","We","Th","Fr","Sa"] as const};
const base={label:"Date",grid,displayValue:null,placeholder:"Choose"};
const picker=(descriptor:DatePickerDescriptor)=><DatePicker descriptor={descriptor} monthLabel="October" clearLabel="Clear" closeLabel="Close" composeAccessibleName={d=>d.date}/>;
it.each(["readOnly","disabled"] as const)("closes the open Native picker when %s changes",state=>{
 const changed=vi.fn();const opened=vi.fn();render(picker({...base,defaultOpen:true,onSelectionChange:changed,onOpenChange:opened}));render(picker({...base,defaultOpen:true,[state]:true,onSelectionChange:changed,onOpenChange:opened}));
 expect(tree!.root.findByType(Sheet).props.open).toBe(false);expect(changed).not.toHaveBeenCalled();expect(opened).toHaveBeenLastCalledWith(false,"programmatic");
});
it("keeps current-date activation and clear distinct from cancellation",()=>{
 const changed=vi.fn();const opened=vi.fn();const ui=(date:string)=>picker({...base,selectedDate:date,onSelectionChange:changed,displayValue:date,defaultOpen:true,onOpenChange:opened});
 render(ui("2026-10-01"));render(ui("2026-10-02"));
 expect(tree!.root.findByType(Calendar).props.descriptor.selectedDate).toBe("2026-10-02");
 const day=tree!.root.findAllByType(Pressable).find(n=>n.props.accessibilityLabel==="2026-10-02")!;act(()=>day.props.onPress());expect(changed).toHaveBeenLastCalledWith("2026-10-02","activate");expect(opened).toHaveBeenLastCalledWith(false,"selection");
 const clear=tree!.root.findAllByType(Pressable).find(n=>n.props.accessibilityLabel==="Clear")!;act(()=>clear.props.onPress());expect(changed).toHaveBeenLastCalledWith(null,"clear");
 act(()=>tree!.root.findByType(Sheet).props.onOpenChange(false));expect(changed).toHaveBeenCalledTimes(2);
});
it("forwards DateEntry blur once without submitting another value",()=>{
 const changed=vi.fn();const blurred=vi.fn();render(<DateEntry value={{year:"2026",month:"10",day:"13"}} onValueChange={changed} onBlur={blurred} order={["year","month","day"]} labels={{label:"Date",year:"Year",month:"Month",day:"Day"}} parse={()=>({status:"valid",value:"2026-10-13"})} formatIssue={()=>"Invalid"}/>);
 const input=tree!.root.findAllByType(TextInput)[0]!;act(()=>{input.props.onSubmitEditing?.({nativeEvent:{text:"2026"}});input.props.onBlur({});});expect(changed).not.toHaveBeenCalled();expect(blurred).toHaveBeenCalledExactlyOnceWith("year");
});

it("restores accessible trigger focus after clearing a closed Native picker",()=>{
 const focus=vi.spyOn(AccessibilityInfo,"setAccessibilityFocus");
 try {
  render(picker({...base,defaultSelectedDate:"2026-10-01",displayValue:"October 1"}));
  focus.mockClear();
  const clear=tree!.root.findAllByType(Pressable).find(n=>n.props.accessibilityLabel==="Clear")!;
  act(()=>clear.props.onPress());
  expect(tree!.root.findAllByType(Pressable).some(n=>n.props.accessibilityLabel==="Clear")).toBe(false);
  expect(focus).toHaveBeenCalledExactlyOnceWith(1);
 } finally {focus.mockRestore();}
});
