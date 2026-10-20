import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, ScrollView, View } from "react-native";
import { expect, it, vi } from "vitest";
import { Button } from "../src/actions.js";
import { ShortcutRail } from "../src/shortcut-rail.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const items = [{ id: "seoul", label: "Seoul", value: 1 }, { id: "busan", label: "Busan", value: 2, disabled: true }];
it("keeps shortcut and removal independent, named, and disabled together", () => {
  let tree!: ReactTestRenderer; const open = vi.fn(), remove = vi.fn();
  try {
    act(() => { tree = create(<HjmNativeProvider><ShortcutRail label="Recent cities" items={items} onAction={open}
      onRemove={remove} removeLabel={item => `Remove ${item.label}`} /></HjmNativeProvider>); });
    const buttons = tree.root.findAllByType(Pressable);
    expect(buttons.map(button => button.props.accessibilityLabel)).toEqual(["Seoul", "Remove Seoul", "Busan", "Remove Busan"]);
    expect(buttons.every(button => button.findAllByType(Pressable).length === 1)).toBe(true);
    act(() => buttons[1]!.props.onPress());
    expect(remove).toHaveBeenCalledWith(items[0]); expect(open).not.toHaveBeenCalled();
    act(() => buttons[0]!.props.onPress()); expect(open).toHaveBeenCalledWith(items[0]);
    act(() => { buttons[2]!.props.onPress(); buttons[3]!.props.onPress(); });
    expect(open).toHaveBeenCalledOnce(); expect(remove).toHaveBeenCalledOnce();
    expect(tree.root.findByType(ScrollView).props.keyboardShouldPersistTaps).toBe("handled");
  } finally { act(() => tree.unmount()); }
});

it("reveals a focused shortcut using its complete frame in the physical scroll viewport", () => {
  let tree!: ReactTestRenderer; const scrollTo = vi.fn();
  try {
    act(() => { tree = create(<HjmNativeProvider direction="rtl"><ShortcutRail label="Recent cities" items={items} onAction={() => {}} /></HjmNativeProvider>,
      { createNodeMock: element => element.type === "ScrollView" ? { scrollTo } : null }); });
    const rail = tree.root.findByType(ScrollView);
    act(() => rail.props.onLayout({ nativeEvent: { layout: { width: 200 } } }));
    const frames = tree.root.findAllByType(View).filter(node => node.props.onFocus && node.props.onLayout);
    act(() => frames[0]!.props.onLayout({ nativeEvent: { layout: { x: 220, width: 120 } } }));
    act(() => frames[0]!.props.onFocus()); expect(scrollTo).toHaveBeenCalledWith({ x: 140, animated: false });
    expect(rail.props.contentContainerStyle.flexDirection).toBe("row-reverse");
  } finally { act(() => tree.unmount()); }
});

it("wraps settings actions without nesting another scroller and retains hints and RTL order", () => {
 let tree!: ReactTestRenderer; const open=vi.fn();
 const next=[{id:"sound",label:"A long translated sound preference",description:"Jump to section"}];
 try {
  act(()=>{tree=create(<HjmNativeProvider direction="rtl"><ShortcutRail label="Settings" layout="wrap" items={next} onAction={open}/></HjmNativeProvider>);});
  expect(tree.root.findAllByType(ScrollView)).toHaveLength(0);
  const root=tree.root.findAllByType(View).find(node=>node.props.accessibilityRole==="list")!;
  expect(root.props.style[0]).toMatchObject({flexWrap:"wrap",direction:"rtl"});
  const button=tree.root.findByType(Pressable);
  expect(button.props.accessibilityHint).toBe("Jump to section");
  expect(button.props.style({pressed:false}).minHeight).toBeGreaterThanOrEqual(44);
  act(()=>button.props.onPress());expect(open).toHaveBeenCalledWith(next[0]);
 } finally { act(()=>tree.unmount()); }
});

it.each(["scroll", "wrap"] as const)("retains leading controls with no summaries and removes only eligible items in %s", layout => {
 let tree!: ReactTestRenderer;const open=vi.fn(),change=vi.fn(),remove=vi.fn();
 const mixed=[{id:"season",label:"2026",clear:false},{id:"team",label:"LG",clear:true}];
 const ui=(rows:typeof mixed)=><HjmNativeProvider><ShortcutRail label="Conditions" layout={layout} leading={<Button onPress={open}>Filters</Button>}
   items={rows} onAction={change} onRemove={remove} isRemovable={item=>item.clear} removeLabel={item=>`Clear ${item.label}`}/></HjmNativeProvider>;
 try {
  act(()=>{tree=create(ui([]));});
  const buttons=()=>tree.root.findAllByType(Pressable);
  expect(buttons().map(node=>node.props.accessibilityLabel)).toEqual(["Filters"]);
  act(()=>buttons()[0]!.props.onPress());expect(open).toHaveBeenCalledOnce();
  act(()=>tree.update(ui(mixed)));
  expect(buttons().map(node=>node.props.accessibilityLabel)).toEqual(["Filters","2026","LG","Clear LG"]);
  act(()=>buttons()[2]!.props.onPress());expect(change).toHaveBeenCalledWith(mixed[1]);expect(remove).not.toHaveBeenCalled();
  act(()=>buttons()[3]!.props.onPress());expect(remove).toHaveBeenCalledWith(mixed[1]);expect(open).toHaveBeenCalledOnce();
 }finally{act(()=>tree.unmount());}
});
