// Native SVG drawing is a host boundary; real preview state and navigation callbacks execute below.
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { AccessibilityInfo, Platform } from "react-native";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { BottomNavigation } from "@hjmds/react-native/navigation";
import { Button, IconButton } from "@hjmds/react-native/actions";
import { NavigationBehaviorPreview } from "../../../showcase/native/src/reference-navigation-bars.js";
import { navigationBarReferences, navigationBehaviorGroups } from "../../../showcase/shared/navigation-bar-references.js";
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Svg: View, Circle: View, Path: View, G: View, Rect: View, Line: View, Polyline: View, Polygon: View, Ellipse: View }; });
let tree:ReactTestRenderer;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(()=>{if(tree)act(()=>tree.unmount());});
it.each(navigationBehaviorGroups)("keeps $id destination, preset and primary action states separate",group=>{
 act(()=>{tree=create(<HjmNativeProvider reducedMotion><NavigationBehaviorPreview behavior={group.id}/></HjmNativeProvider>);});
 for(const id of group.references){const reference=navigationBarReferences.find(item=>item.id===id)!;if(group.references.length>1)act(()=>tree.root.findAllByType(Button).find(item=>(Array.isArray(item.props.children)?item.props.children.join(""):item.props.children)===`${reference.source} 표현`)!.props.onPress());
 const navigation=()=>tree.root.findByType(BottomNavigation).props;expect(navigation().descriptor.selectedKey).toBe(id==="project"?"1":"0");const target=String(reference.items.length-1);act(()=>navigation().onActivate({key:target,reason:"navigate"}));expect(navigation().descriptor.selectedKey).toBe(target);act(()=>navigation().onActivate({key:target,reason:"reselect"}));expect(navigation().descriptor.selectedKey).toBe(target);
 if("action" in reference){act(()=>{const action=tree.root.findByType(IconButton).props.onPress;action();action();});expect(navigation().descriptor.selectedKey).toBe(target);expect(JSON.stringify(tree.toJSON())).toContain(`${reference.items[Number(target)]} 선택 · ${reference.action} 2회`);}
 }
});

it("announces the primary action result on iOS without announcing the initial preview",()=>{
 const initialOS=Platform.OS;Object.defineProperty(Platform,"OS",{value:"ios",configurable:true,writable:true});const announce=vi.spyOn(AccessibilityInfo,"announceForAccessibilityWithOptions");
 try {act(()=>{tree=create(<HjmNativeProvider reducedMotion><NavigationBehaviorPreview behavior="center"/></HjmNativeProvider>);});expect(announce).not.toHaveBeenCalled();act(()=>tree.root.findByType(IconButton).props.onPress());expect(announce).toHaveBeenCalledWith("홈 선택 · 전원 전환 1회",{queue:true});}
 finally {announce.mockRestore();Object.defineProperty(Platform,"OS",{value:initialOS,configurable:true,writable:true});}
});
