import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { expect, it } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { SegmentedControl } from "../src/inputs.js";
(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("uses one controlled radio group and preserves large-text targets",()=>{
 function Fixture(){const[value,setValue]=useState("all");return <HjmNativeProvider theme="dark" textScale={2}><SegmentedControl label="카테고리" presentation="pills" value={value} onValueChange={setValue} items={[{value:"all",label:"전체"},{value:"place",label:"장소"},{value:"off",label:"준비 중",disabled:true}]}/></HjmNativeProvider>}
 let tree!:ReactTestRenderer;act(()=>{tree=create(<Fixture/>)});const radios=tree.root.findAllByType(Pressable);expect(radios.map(r=>r.props.accessibilityRole)).toEqual(["radio","radio","radio"]);act(()=>radios[1]!.props.onPress());expect(radios[1]!.props.accessibilityState.checked).toBe(true);expect(radios[0]!.props.accessibilityState.checked).toBe(false);expect(radios[2]!.props.disabled).toBe(true);const style=radios[1]!.props.style({pressed:false})[0];expect(style.minHeight).toBeGreaterThanOrEqual(44);expect(style.maxWidth).toBe("100%");expect(style.width).toBe("100%");expect(tree.root.findAllByType(View).some(v=>v.props.accessibilityRole==="radiogroup")).toBe(true);act(()=>tree.unmount());
});
