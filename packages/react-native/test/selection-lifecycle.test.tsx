import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { Select } from "../src/forms.js";
import { CheckboxGroup } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{act(()=>tree?.unmount());tree=undefined;});
const render=(ui:React.ReactNode)=>act(()=>{const wrapped=<HjmNativeProvider>{ui}</HjmNativeProvider>;if(tree)tree.update(wrapped);else tree=create(wrapped);});
const items=[{id:"a",label:"Alpha",textValue:"Alpha"},{id:"b",label:"Beta",textValue:"Beta"}];
it("reconciles a removed Native Select default without validating it again",()=>{
 const changed=vi.fn();
 const ui=(next:typeof items)=><Select label="Pick" items={next} defaultSelectedKey="b" disallowEmptySelection onSelectionChange={changed} placeholder="Choose" dismissLabel="Close"/>;
 render(ui(items));render(ui([items[0]!]));expect(changed).toHaveBeenLastCalledWith("a");
});
it("retries a controlled Native Select open request rejected by its owner",()=>{
 const opened=vi.fn();render(<Select label="Pick" items={items} open={false} onOpenChange={opened} placeholder="Choose" dismissLabel="Close"/>);
 const trigger=tree!.root.findByType(Pressable);act(()=>trigger.props.onPress());act(()=>trigger.props.onPress());expect(opened).toHaveBeenCalledTimes(2);
});
it("reconciles Native group removal and blocks actions after readOnly changes",()=>{
 const changed=vi.fn();const ui=(next:typeof items,locked=false)=><CheckboxGroup label="Group" items={next} defaultValue={new Set(["b"])} onValueChange={changed} readOnly={locked}/>;
 render(ui(items));render(ui([items[0]!]));expect(changed).toHaveBeenLastCalledWith(new Set());render(ui([items[0]!],true));
 act(()=>tree!.root.findByType(Pressable).props.onPress());expect(changed).toHaveBeenCalledTimes(1);
});
