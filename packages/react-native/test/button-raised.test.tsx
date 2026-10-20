import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Pressable, StyleSheet, Text as NativeText } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { pretendardNativeFaces } from "@hjmds/design-contracts/foundations";
import { Button, type ButtonProps } from "../src/actions.js";
import { HjmNativeProvider, useHjmNativeTheme } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT=true;
let tree: ReactTestRenderer | undefined;
const profile=defineHjmDesignProfile({ controls:{button:{appearance:'raised',shape:'pill'}} });
afterEach(()=>{ act(()=>tree?.unmount()); tree=undefined; });
function render(props: Partial<ButtonProps> = {}) {
 const node=<HjmNativeProvider minimumVisualTarget designProfile={profile}><Button {...props}>Send</Button></HjmNativeProvider>;
 act(()=>{if(tree)tree.update(node);else tree=create(node);}); return tree!.root.findByType(Pressable);
}
const rootStyle=(button: ReturnType<typeof render>)=>StyleSheet.flatten(button.props.style({pressed:false}));
it('keeps the press target fixed while the raised face sinks and passes real press events',()=>{
 const press=vi.fn(),pressIn=vi.fn(),pressOut=vi.fn();const button=render({onPress:press,onPressIn:pressIn,onPressOut:pressOut,fullWidth:true});
 expect(rootStyle(button)).toMatchObject({paddingBottom:4,width:'100%'});
 expect(rootStyle(button).transform).toBeUndefined();
 const event={nativeEvent:{pageX:10,pageY:20}};
 act(()=>button.props.onPressIn(event));
 const face=tree!.root.findByType(Animated.View);
 expect(StyleSheet.flatten(face.props.style).transform[0].translateY.current).toBe(4);
 expect(pressIn).toHaveBeenCalledWith(event);
 act(()=>button.props.onPress(event));expect(press).toHaveBeenCalledWith(event);
 act(()=>button.props.onPressOut(event));
 expect(StyleSheet.flatten(face.props.style).transform[0].translateY.current).toBe(0);
 expect(pressOut).toHaveBeenCalledWith(event);
});
it('keeps busy discoverable, suppresses both press paths, and retains its text slot',()=>{
 const press=vi.fn(),long=vi.fn();const button=render({loading:true,disabled:true,onPress:press,onLongPress:long});
 expect(button.props.disabled).toBe(false);expect(button.props.accessibilityState.busy).toBe(true);expect(button.props.accessibilityState.disabled).toBe(true);
 act(()=>{button.props.onPress();button.props.onLongPress();});expect(press).not.toHaveBeenCalled();expect(long).not.toHaveBeenCalled();
 expect(tree!.root.findAllByType(NativeText).some(node=>node.props.children==='Send')).toBe(true);
});
it('keeps ghost paint flat and honors an explicit appearance override',()=>{
 let button=render({tone:'ghost'});expect(rootStyle(button).paddingBottom).toBeUndefined();
 button=render({appearance:'flat'});expect(rootStyle(button).paddingBottom).toBeUndefined();
});
it('preserves loaded Pretendard for a controls-only profile and respects a custom UI font',()=>{
 let family: readonly string[]=[];
 function Probe(){family=useHjmNativeTheme().tokens.fontFamily.ui;return null;}
 act(()=>{tree=create(<HjmNativeProvider fonts="pretendard" designProfile={profile}><Probe/></HjmNativeProvider>);});
 expect(family).toEqual([pretendardNativeFaces['400']]);
 const custom=defineHjmDesignProfile({tokens:{fontFamily:{ui:['Georgia']}}});
 act(()=>tree!.update(<HjmNativeProvider fonts="pretendard" designProfile={custom}><Probe/></HjmNativeProvider>));
 expect(family).toEqual(['Georgia']);
});
