import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, View, Pressable } from "react-native";
import { expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { Rating } from "../src/rating.js";
import { ImageComparison } from "../src/image-comparison.js";
import { ContentTransition } from "../src/content-transition.js";
import { Slider } from "../src/slider.js";
import { HjmNativeProvider } from "../src/provider.js";
import { startedAnimatedTimings } from "./react-native.mock.js";
function render(child:ReactNode,reducedMotion=false){let tree:ReactTestRenderer;act(()=>{tree=create(<HjmNativeProvider theme="dark" direction="rtl" textScale={2} reducedMotion={reducedMotion}>{child}</HjmNativeProvider>);});return tree!;}
const label=(n:number|null)=>n===null?"미평가":`${n}점`;
it("exposes native radio states, forwards a score and prevents disabled activation",()=>{
 const change=vi.fn();const tree=render(<Rating label="평가" value={2} getValueLabel={label} onValueChange={change}/>);
 const radio=tree.root.findAllByType(Pressable).find(n=>n.props.accessibilityLabel==="3점")!;
 act(()=>radio.props.onPress());expect(change).toHaveBeenCalledExactlyOnceWith(3);
 act(()=>tree.update(<HjmNativeProvider><Rating label="평가" value={2} getValueLabel={label} onValueChange={change} disabled/></HjmNativeProvider>));
 change.mockClear();act(()=>tree.root.findAllByType(Pressable)[0]!.props.onPress());expect(change).not.toHaveBeenCalled();act(()=>tree.unmount());
});
it("renders average as one named image without interactive stars",()=>{const tree=render(<Rating label="평균" value={3.5} getValueLabel={label} readOnly/>);expect(tree.root.findAllByType(Pressable)).toHaveLength(0);expect(tree.root.findAllByType(View).some(v=>v.props.accessibilityLabel==="평균: 3.5점")).toBe(true);act(()=>tree.unmount());});
it("reuses adjustable slider host actions and preserves full image geometry",()=>{
 const change=vi.fn();const image={src:"photo.jpg",width:640,height:360,label:"사진"};const tree=render(<ImageComparison label="비교" before={image} after={image} value={50} onValueChange={change} getValueText={n=>`${n}%`} decrementLabel="줄이기" incrementLabel="늘리기"/>);
 const stage=tree.root.findAllByType(View).find(v=>v.props.style?.aspectRatio)!;act(()=>stage.props.onLayout({nativeEvent:{layout:{width:320,height:180}}}));
 const slider=tree.root.findByType(Slider);expect(slider.props.decrementLabel).toBe("줄이기");act(()=>slider.props.onValueChange(100));expect(change).toHaveBeenCalledWith(100);
 expect(tree.root.findAllByType(View).some(v=>v.props.style?.width===160&&v.props.style?.overflow==="hidden")).toBe(true);act(()=>tree.unmount());
});
it("reserves first height without animation, animates later layout and honors reduced motion",()=>{
 const tree=render(<ContentTransition stateKey="a" animateHeight><View/></ContentTransition>);
 const measure=()=>tree.root.findAllByType(View).find(v=>v.props.onLayout)!;
 startedAnimatedTimings.length=0;act(()=>measure().props.onLayout({nativeEvent:{layout:{height:60}}}));expect(startedAnimatedTimings).toHaveLength(0);
 act(()=>measure().props.onLayout({nativeEvent:{layout:{height:180}}}));expect(startedAnimatedTimings.length).toBeGreaterThan(0);
 const outer=tree.root.findAllByType(Animated.View)[0]!;expect(outer.props.style.overflow).toBe("hidden");
 act(()=>tree.update(<HjmNativeProvider reducedMotion><ContentTransition stateKey="a" animateHeight><View/></ContentTransition></HjmNativeProvider>));startedAnimatedTimings.length=0;
 act(()=>measure().props.onLayout({nativeEvent:{layout:{height:90}}}));expect(startedAnimatedTimings).toHaveLength(0);act(()=>tree.unmount());
});
