import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { expect, it } from "vitest";
import { Tabs } from "../src/navigation.js";
import { HjmNativeProvider } from "../src/provider.js";
import { startedAnimatedTimings } from "./react-native.mock.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("measures real tab bounds and retains selection semantics under reduced motion", () => {
 let tree!: ReactTestRenderer;
 const items=[{id:"one",label:"One"},{id:"two",label:"Two"}];
 const render=(reduced=false)=><HjmNativeProvider reducedMotion={reduced}><Tabs label="Sections" appearance="gooey" items={items}/></HjmNativeProvider>;
 try{
  act(()=>{tree=create(render());});
  const buttons=()=>tree.root.findAllByType(Pressable);
  act(()=>buttons().forEach((button,index)=>button.props.onLayout({nativeEvent:{layout:{x:index*90,width:90}}})));
  startedAnimatedTimings.length=0;
  act(()=>buttons()[1]!.props.onPress());expect(buttons()[1]!.props.accessibilityState.selected).toBe(true);expect(startedAnimatedTimings).toHaveLength(1);
  act(()=>tree.update(render(true)));startedAnimatedTimings.length=0;
  act(()=>buttons()[0]!.props.onPress());expect(buttons()[0]!.props.accessibilityState.selected).toBe(true);expect(startedAnimatedTimings).toHaveLength(0);
 }finally{act(()=>tree.unmount());}
});

import { ScrollView } from 'react-native';
import { vi } from 'vitest';
it.each(['standard','gooey'] as const)('reveals selected overflowing %s tabs after RTL layout and controlled changes',appearance=>{
 let tree!:ReactTestRenderer;const scrollTo=vi.fn();
 const items=[{id:'first',label:'First'},{id:'last',label:'Last'}];
 const render=(value:string)=><HjmNativeProvider textScale={2}><Tabs label="Sections" items={items} value={value} onValueChange={()=>{}} direction="rtl" appearance={appearance}/></HjmNativeProvider>;
 try{
  act(()=>{tree=create(render('first'),{createNodeMock:()=>({scrollTo})});});
  const scroll=tree.root.findByType(ScrollView);
  act(()=>{scroll.props.onLayout({nativeEvent:{layout:{width:200}}});scroll.props.onContentSizeChange(320,48);
   tree.root.findAllByType(Pressable).forEach((button,index)=>button.props.onLayout({nativeEvent:{layout:{x:index===0?160:0,width:160}}}));});
  expect(scrollTo).toHaveBeenLastCalledWith({x:120,animated:false});
  act(()=>tree.update(render('last')));
  expect(scrollTo).toHaveBeenLastCalledWith({x:0,animated:false});
  expect(tree.root.findAllByType(Pressable)[1]!.props.accessibilityState.selected).toBe(true);
  act(()=>scroll.props.onLayout({nativeEvent:{layout:{width:400}}}));
  expect(scrollTo).toHaveBeenLastCalledWith({x:0,animated:false});
 }finally{act(()=>tree.unmount());}
});
