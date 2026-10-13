import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { ImageComparison } from "../src/image-comparison.js";
import { Image } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
const image={src:'asset',width:400,height:200};
const change=vi.fn();
function render(value:number,disabled=false,height=200,label='Before') { act(()=> { const view=<HjmNativeProvider reducedMotion><ImageComparison before={{...image,height,label}} after={{...image,height,label:'After'}} label="Comparison" value={value} onValueChange={change} getValueText={v=>`${v}% before`} disabled={disabled} decrementLabel="Less" incrementLabel="More"/></HjmNativeProvider>; if(tree)tree.update(view);else tree=create(view); }); }
const slider=()=>tree!.root.findAllByType(View).find(node=>node.props.accessibilityLabel==='Comparison')!;
const frame=()=>tree!.root.findAllByType(View).find(node=>node.props.style?.aspectRatio)!;
it('updates measured image coordinates, zero/full clipping, aspect ratio and captions together',()=>{
 render(25); act(()=>frame().props.onLayout({nativeEvent:{layout:{width:320}}})); expect(tree!.root.findAllByType(Image).map(node=>[node.props.width,node.props.height])).toEqual([[320,160],[320,160]]);
 const divider=()=>tree!.root.findAllByType(View).find(node=>node.props.style?.borderLeftWidth===2)!;
 expect(divider().props.style.left).toBe(80); render(100,false,400,'Original'); expect(divider().props.style.left).toBe(320); expect(tree!.root.findAllByType(Image)[1]!.props).toMatchObject({height:320,accessibilityLabel:'Original'});
 act(()=>frame().props.onLayout({nativeEvent:{layout:{width:160}}})); expect(divider().props.style.left).toBe(160); render(0); expect(divider().props.style.left).toBe(0); expect(slider().props.accessibilityValue).toMatchObject({now:0,text:'0% before'});
});
it('honors controlled bounds and removes interaction during disabled transitions',()=>{
 change.mockClear(); render(99); act(()=>slider().props.onAccessibilityAction({nativeEvent:{actionName:'increment'}})); expect(change).toHaveBeenLastCalledWith(100);
 render(100); change.mockClear(); act(()=>slider().props.onAccessibilityAction({nativeEvent:{actionName:'increment'}})); expect(change).not.toHaveBeenCalled();
 render(100,true); expect(slider().props.accessibilityState.disabled).toBe(true); expect(slider().props.onAccessibilityAction).toBeUndefined();
 render(0); act(()=>slider().props.onAccessibilityAction({nativeEvent:{actionName:'decrement'}})); expect(change).not.toHaveBeenCalled(); act(()=>slider().props.onAccessibilityAction({nativeEvent:{actionName:'increment'}})); expect(change).toHaveBeenCalledExactlyOnceWith(1);
});
