import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Circle: View, Defs: View, G: View, Line: View, LinearGradient: View, Path: View, Rect: View, Stop: View, Text: View }; });
import { PieChart } from "../src/chart.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("exposes checked inclusion separately and passes the recalculated total to the center",()=>{
 const change=vi.fn(), center=vi.fn((_summary: { total: number })=>null); let tree!:ReactTestRenderer;
 act(()=>{tree=create(<HjmNativeProvider><PieChart data={[{id:"a",label:"A",value:60},{id:"b",label:"B",value:30}]} accessibilityLabel="비중" formatValue={String} selectedId="b" exclusion={{excludedIds:["a"],onExcludedIdsChange:change,label:(d,included)=>`${d.label} ${included?"포함":"제외"}`}} centerContent={center}/></HjmNativeProvider>);});
 try {expect(center.mock.calls.at(-1)![0]).toMatchObject({total:30});const boxes=tree.root.findAll(n=>typeof n.type === "string" && n.props.accessibilityRole==="checkbox");
 expect(boxes[0]!.props.accessibilityState.checked).toBe(false);act(()=>boxes[0]!.props.onPress());expect(change).toHaveBeenCalledWith([]);
 expect(boxes[1]!.props.accessibilityState.checked).toBe(true);
 }finally{act(()=>tree.unmount());}
});
