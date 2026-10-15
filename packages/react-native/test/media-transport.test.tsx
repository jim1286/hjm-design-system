import { act,create,type ReactTestRenderer } from "react-test-renderer";
import { afterEach,expect,it,vi } from "vitest";
vi.mock("react-native-svg",async()=>{const {View}=await import("react-native");return {default:View,Path:View};});
import { MediaTransport } from "../src/media-transport.js";
import { HjmNativeProvider } from "../src/provider.js";
import { IconButton } from "../src/actions.js";
import { startedAnimatedTimings } from "./react-native.mock.js";
import { Slider } from "../src/slider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const labels={play:"재생",pause:"일시 정지",seek:"위치",decrement:"뒤로",increment:"앞으로",unknownDuration:"미정",error:"제어 실패"};let tree:ReactTestRenderer|undefined;
afterEach(()=>{if(tree)act(()=>tree!.unmount());tree=undefined;});
it("leaves playback controlled by the actual adapter and clamps seeks without a private timer",async()=>{
 const play=vi.fn(),pause=vi.fn(),seek=vi.fn();const render=(playing:boolean,duration:number|null)=><HjmNativeProvider reducedMotion><MediaTransport state={{playing,position:2,duration}} labels={labels} formatTime={String} onPlay={play} onPause={pause} onSeek={seek}/></HjmNativeProvider>;
 act(()=>{tree=create(render(false,6));});await act(async()=>tree!.root.findByType(IconButton).props.onPress());expect(play).toHaveBeenCalledOnce();expect(tree!.root.findByType(IconButton).props.label).toBe("재생");
 act(()=>tree!.update(render(true,6)));expect(tree!.root.findByType(IconButton).props.label).toBe("일시 정지");
 act(()=>tree!.root.findByType(Slider).props.onValueChange(5));expect(seek).not.toHaveBeenCalled();await act(async()=>tree!.root.findByType(Slider).props.onValueChangeEnd(100));expect(seek).toHaveBeenCalledWith(6);
 act(()=>tree!.update(render(true,null)));expect(tree!.root.findAllByType(Slider)).toHaveLength(0);
});
it("preserves the observed state on failure and guards pending playback requests",async()=>{
 let reject!:(reason:Error)=>void;const play=vi.fn(()=>new Promise<void>((_,fail)=>{reject=fail;}));
 act(()=>{tree=create(<HjmNativeProvider reducedMotion><MediaTransport state={{playing:false,position:0,duration:6}} labels={labels} formatTime={String} onPlay={play} onPause={()=>undefined} onSeek={()=>undefined}/></HjmNativeProvider>);});
 act(()=>{tree!.root.findByType(IconButton).props.onPress();tree!.root.findByType(IconButton).props.onPress();});expect(play).toHaveBeenCalledOnce();await act(async()=>reject(new Error("failed")));
 expect(tree!.root.findByType(IconButton).props.label).toBe("재생");expect(tree!.root.findAll(n=>n.props.accessibilityRole==="alert").length).toBeGreaterThan(0);
});

it("settles play/pause changes immediately when reduced motion is requested",()=>{
 const before=startedAnimatedTimings.length;
 const render=(playing:boolean)=><HjmNativeProvider reducedMotion><MediaTransport state={{playing,position:0,duration:6}} labels={labels} formatTime={String} onPlay={()=>undefined} onPause={()=>undefined} onSeek={()=>undefined}/></HjmNativeProvider>;
 act(()=>{tree=create(render(false));});act(()=>tree!.update(render(true)));
 expect(tree!.root.findByType(IconButton).props.label).toBe("일시 정지");expect(startedAnimatedTimings.length).toBe(before);
});
