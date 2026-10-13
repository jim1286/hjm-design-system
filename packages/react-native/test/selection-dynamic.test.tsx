import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, ScrollView } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { ToggleGroup } from "../src/toggle-group.js";
import { TransferList } from "../src/transfer-list.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{act(()=>tree?.unmount());tree=undefined;});
const render=(ui:React.ReactNode)=>act(()=>{const node=<HjmNativeProvider>{ui}</HjmNativeProvider>;if(tree)tree.update(node);else tree=create(node);});
const items=[{id:"a",label:"Alpha",textValue:"Alpha"},{id:"b",label:"Beta",textValue:"Beta"}];
const labels={source:"Source",target:"Target",toTarget:"Add",toSource:"Remove",selectAll:"All",empty:"Empty"};
const named=(name:string)=>tree!.root.findAllByType(Pressable).find(n=>n.props.accessibilityLabel===name)!;
it("does not revive removed uncontrolled Native toggle values",()=>{
 const changed=vi.fn();const ui=(next:typeof items)=><ToggleGroup descriptor={{accessibilityLabel:"Tools",items:next}} defaultPressedIds={new Set(["b"])} onPressedIdsChange={changed}/>;
 render(ui(items));render(ui([items[0]!]));render(ui(items));expect(tree!.root.findAllByType(Pressable)[1]!.props.accessibilityState.selected).toBe(false);expect(changed).toHaveBeenLastCalledWith(new Set());
});
it("reconciles removed uncontrolled Native TransferList target keys",()=>{
 const changed=vi.fn();const ui=(next:typeof items)=><TransferList items={next} labels={labels} defaultTargetKeys={new Set(["b"])} onTargetKeysChange={changed}/>;
 render(ui(items));render(ui([items[0]!]));render(ui(items));expect(changed).toHaveBeenLastCalledWith(new Set());expect(tree!.root.findAllByType(ScrollView).find(n=>n.props.accessibilityLabel==="Source")!.findAllByType(Pressable).some(n=>n.props.accessibilityLabel==="Beta")).toBe(true);
});
it("does not restore stale Native TransferList checks after reinsertion",()=>{
 const ui=(next:typeof items)=><TransferList items={next} labels={labels}/>;
 render(ui(items));act(()=>named("Beta").props.onPress());render(ui([items[0]!]));render(ui(items));expect(named("Beta").props.accessibilityState.checked).toBe(false);
});
it("keeps refused Native transfer selection retryable",()=>{
 const changed=vi.fn();render(<TransferList items={items} labels={labels} targetKeys={new Set<string>()} onTargetKeysChange={changed}/>);
 act(()=>named("Alpha").props.onPress());act(()=>named("Add").props.onPress());expect(named("Alpha").props.accessibilityState.checked).toBe(true);expect(named("Add").props.disabled).toBe(false);act(()=>named("Add").props.onPress());expect(changed).toHaveBeenCalledTimes(2);
});
it("disables Native transfer after its checked row becomes disabled",()=>{
 render(<TransferList items={items} labels={labels}/>);act(()=>named("Alpha").props.onPress());render(<TransferList items={[{...items[0]!,disabled:true},items[1]!]} labels={labels}/>);expect(named("Add").props.disabled).toBe(true);
});
it("keeps controlled Native toggles unchanged through refused retries",()=>{
 const changed=vi.fn();render(<ToggleGroup descriptor={{accessibilityLabel:"Tools",items}} pressedIds={new Set(["a"])} onPressedIdsChange={changed}/>);
 const beta=()=>tree!.root.findAllByType(Pressable)[1]!;
 act(()=>beta().props.onPress());act(()=>beta().props.onPress());expect(beta().props.accessibilityState.selected).toBe(false);expect(changed).toHaveBeenCalledTimes(2);
});
it("disables Native select-all when no row can be selected",()=>{
 render(<TransferList items={[{...items[0]!,disabled:true}]} labels={labels}/>);expect(named("Source, All").props.disabled).toBe(true);expect(named("Target, All").props.disabled).toBe(true);
});
