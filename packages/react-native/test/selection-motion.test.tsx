import { useState } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, AppState, Pressable } from "react-native";
import { afterEach, expect, it } from "vitest";
import { SegmentedControl } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
import { startedAnimatedTimings } from "./react-native.mock.js";
(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{act(()=>tree?.unmount());tree=undefined;AppState.currentState="active";});
const items=[{value:"day",label:"하루"},{value:"month",label:"한 달"}];
function Fixture({reduced=false,slide=true}:{reduced?:boolean;slide?:boolean}){const[value,set]=useState("day");return <HjmNativeProvider theme="dark" direction="rtl" textScale={2} reducedMotion={reduced}><SegmentedControl label="기간" items={items} value={value} onValueChange={set} selectionMotion={slide?"slide":"none"}/></HjmNativeProvider>;}
function mount(reduced=false){act(()=>{tree=create(<Fixture reduced={reduced}/>);});const radios=tree!.root.findAllByType(Pressable);act(()=>radios.forEach((node,i)=>node.props.onLayout({nativeEvent:{layout:{x:4,y:4+i*64,width:240,height:60}}})));return radios;}
it("keeps radio states and fixed host geometry while only selection artwork animates",()=>{
 const radios=mount();startedAnimatedTimings.length=0;act(()=>radios[1]!.props.onPress());
 expect(tree!.root.findAllByType(Pressable)).toHaveLength(2);expect(radios[1]!.props.accessibilityState.checked).toBe(true);expect(startedAnimatedTimings).toHaveLength(4);
 const marker=tree!.root.findByType(Animated.View);expect(marker.props.pointerEvents).toBe("none");expect(marker.props.accessible).toBe(false);
 startedAnimatedTimings.length=0;act(()=>radios[1]!.props.onLayout({nativeEvent:{layout:{x:4,y:100,width:260,height:90}}}));expect(startedAnimatedTimings).toHaveLength(0);
});
it("settles selection immediately for reduced motion and inactive apps",()=>{
 const radios=mount(true);startedAnimatedTimings.length=0;act(()=>radios[1]!.props.onPress());expect(startedAnimatedTimings).toHaveLength(0);
 act(()=>tree!.update(<Fixture/>));AppState.currentState="background";act(()=>radios[0]!.props.onPress());expect(startedAnimatedTimings).toHaveLength(0);
});
it("does not install layout work or decorative hosts by default",()=>{
 act(()=>{tree=create(<Fixture slide={false}/>);});expect(tree!.root.findAllByType(Animated.View)).toHaveLength(0);for(const item of tree!.root.findAllByType(Pressable))expect(item.props.onLayout).toBeUndefined();
});
