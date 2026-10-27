import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Modal, PanResponder, Pressable, ScrollView, type GestureResponderEvent, type PanResponderGestureState } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { Combobox, Select } from "../src/forms.js";
import { CheckboxGroup } from "../src/inputs.js";
import { Sheet } from "../src/overlays.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{act(()=>tree?.unmount());tree=undefined;vi.restoreAllMocks();});
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

it("reveals the selected row after actual modal and list layout, including section offsets",async()=>{
 const scrollTo=vi.fn(); const measure=vi.fn((_content: unknown, done: (...args: number[])=>void)=>done(0,900,200,80));
 const ui=(open:boolean)=><HjmNativeProvider><Select label="Pick" sections={[{id:"group",label:"Group",items}]} selectedKey="b" open={open} onSelectionChange={()=>{}} placeholder="Choose" dismissLabel="Close"/></HjmNativeProvider>;
 act(()=>{tree=create(ui(true),{createNodeMock: node=>node.type==="ScrollView"?{scrollTo}:(node.props as {accessibilityLabel?:string}).accessibilityLabel==="Beta"?{measureLayout:measure}:{} });});
 const scroll=()=>tree!.root.findByType(ScrollView);
 act(()=>{scroll().props.onLayout({nativeEvent:{layout:{height:300}}});scroll().props.onContentSizeChange(200,1200);});
 expect(scrollTo).not.toHaveBeenCalled();
 act(()=>tree!.root.findByType(Modal).props.onShow());
 expect(measure).toHaveBeenCalledOnce(); expect(scrollTo).toHaveBeenCalledWith({y:790,animated:false});
 scrollTo.mockClear();
 act(()=>scroll().props.onContentSizeChange(200,1300));
 expect(scrollTo).not.toHaveBeenCalled();
 act(()=>tree!.update(ui(false)));
 await act(async()=>{await new Promise(resolve=>setTimeout(resolve,400));});
 act(()=>tree!.root.findByType(Modal).props.onDismiss());
 act(()=>tree!.update(ui(true)));
 act(()=>tree!.root.findByType(Modal).props.onShow());
 expect(scrollTo).toHaveBeenCalledOnce();
});

for (const kind of ["select", "combobox"] as const) {
 it(`uses the shared bottom Sheet for ${kind} and commits only after dismissal`, async()=>{
  const committed=vi.fn();
  render(kind === "select"
   ? <Select label="Language" items={items} defaultOpen placeholder="Choose" dismissLabel="Close" onSelectionAfterDismiss={committed}/>
   : <Combobox clearLabel="Clear" label="Language" items={items} defaultOpen placeholder="Choose" dismissLabel="Close" emptyMessage="Empty" loadingMessage="Loading" onCommitAfterDismiss={committed}/>);
  const sheet=tree!.root.findByType(Sheet);
  expect(sheet.props.title).toBe("Language");
  expect(sheet.props.showClose).toBeUndefined();
  expect(tree!.root.findAllByType(Pressable).filter(node=>node.props.accessibilityLabel==="Close").length).toBe(2);
  const alpha=tree!.root.findAllByType(Pressable).find(node=>node.props.accessibilityLabel==="Alpha")!;
  act(()=>alpha.props.onPress());
  expect(committed).not.toHaveBeenCalled();
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,400));});
  act(()=>tree!.root.findByType(Modal).props.onDismiss());
  expect(committed).toHaveBeenCalledWith(...(kind === "select" ? ["a"] : ["a", "selection"]));
 });
}

it("dismisses a collection through the shared downward gesture without changing selection",()=>{
 const responder=vi.spyOn(PanResponder,"create");
 const opened=vi.fn();const changed=vi.fn();
 render(<Select label="Language" items={items} defaultOpen placeholder="Choose" dismissLabel="Close" onOpenChange={opened} onSelectionChange={changed}/>);
 // The Sheet also creates a capture-phase body responder; the handle zone is the bubble one.
 const gesture=responder.mock.calls.map(call=>call[0]).filter(callbacks=>callbacks.onMoveShouldSetPanResponder).at(-1)!;
 const event={} as GestureResponderEvent;
 const motion={dx:0,dy:300,vy:1} as PanResponderGestureState;
 expect(gesture.onMoveShouldSetPanResponder?.(event,motion)).toBe(true);
 act(()=>{gesture.onPanResponderRelease?.(event,motion);});
 expect(opened).toHaveBeenCalledWith(false,"programmatic");
 expect(changed).not.toHaveBeenCalled();
});
