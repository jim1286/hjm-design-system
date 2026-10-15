import { act,create,type ReactTestRenderer } from "react-test-renderer";
import { expect,it,vi } from "vitest";
vi.mock("react-native-svg",async()=>{const {View}=await import("react-native");return {default:View,Path:View,Circle:View};});
import { BezierEditor,authoringToolsCapabilities } from "../src/authoring-tools.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { Slider } from "../src/slider.js";
import { startedAnimatedTimings } from "./react-native.mock.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("edits second control point, previews real easing and exposes unsupported native shortcut registration",()=>{
 const change=vi.fn();let tree!:ReactTestRenderer;act(()=>{tree=create(<HjmNativeProvider reducedMotion={false}><BezierEditor value={[.2,0,.8,1]} onValueChange={change} labels={{coordinates:["x1","y1","x2","y2"],preview:"preview",curve:"curve",decrement:"less",increment:"more"}} formatCoordinate={String}/></HjmNativeProvider>);});
 expect(tree.root.findAllByType(Slider)).toHaveLength(4);expect(tree.root.findAll(n=>n.props.accessibilityRole==="image")[0]!.props.viewBox).toBe("-10 -10 120 120");act(()=>tree.root.findAllByType(Slider)[3]!.props.onValueChange(1.5));expect(change).toHaveBeenCalledWith([.2,0,.8,1.5]);const before=startedAnimatedTimings.length;act(()=>tree.root.findByType(Button).props.onPress());expect(startedAnimatedTimings.length).toBe(before+1);expect(startedAnimatedTimings.at(-1)).toMatchObject({duration:1000});expect(authoringToolsCapabilities.shortcutRecorder).toBe(false);act(()=>tree.unmount());
});
