import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, View } from "react-native";
import { expect, it, vi } from "vitest";
import { QuoteCard } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("keeps the decorative mark hidden and child disclosure independently reachable", () => {
 const open=vi.fn(); let tree!:ReactTestRenderer;
 act(()=>{tree=create(<HjmNativeProvider><QuoteCard attribution="Author · today" renderMark={({size,color})=><View testID="mark" style={{width:size,backgroundColor:color}}/>}>
  <Pressable accessibilityLabel="Read original" onPress={open}/>
 </QuoteCard></HjmNativeProvider>);});
 expect(tree.root.findByProps({testID:"mark"}).parent!.props.accessibilityElementsHidden).toBe(true);
 const command=tree.root.findByType(Pressable); expect(command.props.accessibilityLabel).toBe("Read original");
 act(()=>command.props.onPress());expect(open).toHaveBeenCalledOnce();act(()=>tree.unmount());
});
