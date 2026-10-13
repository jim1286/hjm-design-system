import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { Accordion, Card, ListRow, Image, type ImageRenderProps } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
const render = (node: React.ReactNode) => act(() => { const view = <HjmNativeProvider reducedMotion>{node}</HjmNativeProvider>; if(tree) tree.update(view); else tree = create(view); });
const items = ["a", "b", "c"].map(value => ({ value, title: value, content: <View testID={`${value}-panel`} /> }));
it("prunes deleted uncontrolled accordion expansion and does not reopen it after reinsertion", () => {
 const change=vi.fn(); const view=(data:typeof items)=><Accordion label="Details" items={data} defaultExpandedValues={["b"]} onExpandedValuesChange={change} />;
 render(view(items)); render(view([items[0]!,items[2]!])); expect(change).toHaveBeenCalledExactlyOnceWith([]);
 render(view(items)); expect(tree!.root.findAllByProps({testID:"b-panel"})).toHaveLength(0);
});
it("keeps a newly disabled expanded accordion readable and blocks its trigger", () => {
 render(<Accordion label="Details" items={items} defaultExpandedValues={["b"]} />);
 render(<Accordion label="Details" items={items.map(item=>({...item,disabled:item.value==="b"}))} defaultExpandedValues={["b"]} />);
 const trigger=tree!.root.findAllByType(Pressable).find(node=>node.props.accessibilityLabel==="b")!;
 expect(trigger.props.disabled).toBe(true); expect(trigger.props.accessibilityState.expanded).toBe(true);
 expect(tree!.root.findAllByProps({testID:"b-panel"}).length).toBeGreaterThan(0);
});
it("updates Card and ListRow disabled, selected and pending semantics together", () => {
 const action=vi.fn(); const view=(pending:boolean)=><><Card accessibilityLabel="Card" onActivate={action} selected disabled={pending}>Card</Card><ListRow title="Row" onPress={action} selected disabled={pending} accessibilityState={{busy:pending}} /></>;
 render(view(false)); let hosts=tree!.root.findAllByType(Pressable); act(()=>hosts[0]!.props.onPress()); expect(action).toHaveBeenCalledOnce();
 render(view(true)); hosts=tree!.root.findAllByType(Pressable); expect(hosts.map(node=>node.props.disabled)).toEqual([true,true]); expect(hosts[1]!.props.accessibilityState).toMatchObject({busy:true,selected:true,disabled:true});
 act(()=>hosts[0]!.props.onPress()); expect(action).toHaveBeenCalledOnce();
 render(view(false)); hosts=tree!.root.findAllByType(Pressable); act(()=>hosts[1]!.props.onPress()); expect(action).toHaveBeenCalledTimes(2);
});
it("retries a same-src Image through keyed remount without stale adapter reports", () => {
 let image!:ImageRenderProps; const changed=vi.fn();
 const view=(attempt:number)=><Image key={attempt} src="same" width={80} height={40} onLoadStatusChange={changed} renderImage={props=>{image=props;return <View testID="image"/>;}}/>;
 render(view(0)); const retired=image; act(()=>image.reportError()); render(view(1)); expect(image.status).toBe("loading");
 act(()=>image.reportLoad()); act(()=>retired.reportError()); expect(image.status).toBe("loaded"); expect(changed.mock.calls).toEqual([["error"],["loaded"]]);
});
it.each(["default", "controlled"])("rejects invalid initial accordion %s values", kind => {
 expect(()=>render(<Accordion label="Details" items={items} {...(kind === "default" ? {defaultExpandedValues:["missing"]} : {expandedValues:["missing"]})} />)).toThrow(/must match items/);
});
it("retries an unchanged URL when sourceAdapter request headers change", () => {
 let image!:ImageRenderProps; const changed=vi.fn();
 const view=(authorization:string)=><Image src="same" width={80} height={40} sourceAdapter={descriptor=>({uri:descriptor.src,headers:{Authorization:authorization}})} onLoadStatusChange={changed} renderImage={props=>{image=props;return <View testID="adapted-image"/>;}}/>;
 render(view("old")); const retired=image; act(()=>image.reportError());
 render(view("fresh")); expect(tree!.root.findAllByProps({testID:"adapted-image"}).length).toBeGreaterThan(0); expect(image.status).toBe("loading");
 act(()=>image.reportLoad()); act(()=>retired.reportError()); expect(image.status).toBe("loaded"); expect(changed.mock.calls).toEqual([["error"],["loaded"]]);
});
