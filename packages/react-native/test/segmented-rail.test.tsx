import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, ScrollView, View } from "react-native";
import { expect, it, vi } from "vitest";
import { SegmentedControl } from "../src/inputs.js";
import { Button } from "../src/actions.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("keeps actions outside the scrolled radio group and reveals layout/focus targets", () => {
  const changed = vi.fn(), added = vi.fn(), scrollTo = vi.fn(); let tree!: ReactTestRenderer;
  const ui = (value:string) => <HjmNativeProvider><SegmentedControl label="Place" presentation="pills" overflow="scroll" value={value} onValueChange={changed}
    items={[{value:"a",label:"A",accessibilityLabel:"Alpha metric"},{value:"b",label:"Beta"}]} actions={<Button onPress={added}>Add</Button>} /></HjmNativeProvider>;
  try {
    act(() => { tree = create(ui("b"), {createNodeMock: node => node.type === "ScrollView" ? {scrollTo} : {}}); });
    const rail = tree.root.findByType(ScrollView);
    const radio = tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "radio");
    expect(radio[0]!.props.accessibilityLabel).toBe("Alpha metric");
    expect(radio[1]!.props.accessibilityLabel).toBe("Beta");
    const options = () => tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "radio");
    act(() => {
      rail.props.onLayout({nativeEvent:{layout:{width:120}}});
      options()[0]!.props.onLayout({nativeEvent:{layout:{x:0,y:0,width:90,height:44}}});
      options()[1]!.props.onLayout({nativeEvent:{layout:{x:100,y:0,width:90,height:44}}});
    });
    expect(scrollTo).toHaveBeenLastCalledWith({x:70,animated:false});
    const group = tree.root.findAllByType(View).find(node => node.props.accessibilityRole === "radiogroup")!;
    expect(group.findAllByType(Pressable)).toHaveLength(2);
    act(() => options()[0]!.props.onFocus()); expect(scrollTo).toHaveBeenLastCalledWith({x:0,animated:false});
    act(() => options()[0]!.props.onPress()); expect(changed).toHaveBeenCalledWith("a");
    const action = tree.root.findAllByType(Pressable).find(node => node.props.accessibilityRole !== "radio")!;
    act(() => action.props.onPress()); expect(added).toHaveBeenCalledOnce(); expect(changed).toHaveBeenCalledTimes(1);
  } finally { act(() => tree.unmount()); }
});
