import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { RadioGroup } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
// Exercise the renderer's Expo-web host props without claiming a native OS Tab key.
vi.mock("../src/internal/web-a11y.js",async importOriginal=>({
 ...await importOriginal<object>(),webOnly:(props:object)=>props,
}));
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{act(()=>tree?.unmount());tree=undefined;});
it("retains a disabled checked radio but moves the web tab stop to an enabled item",()=>{
 const changed=vi.fn();const ui=(disabled:boolean)=><HjmNativeProvider><RadioGroup label="Options" defaultValue="a" items={[{value:"a",label:"Alpha",disabled},{value:"b",label:"Beta"}]} onValueChange={changed}/></HjmNativeProvider>;
 act(()=>{tree=create(ui(false));});act(()=>tree!.update(ui(true)));
 const rows=tree!.root.findAllByType(Pressable);
 expect(rows[0]!.props.accessibilityState.checked).toBe(true);expect(rows[0]!.props.tabIndex).toBe(-1);
 expect(rows[1]!.props.tabIndex).toBe(0);expect(changed).not.toHaveBeenCalled();
});
