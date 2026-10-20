import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { Pressable } from "react-native";
import { HjmNativeProvider } from "../src/provider.js";
import { Steps } from "../src/steps.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT = true;
it("allows every reading step while retaining default linear navigation", () => {
  let tree: ReactTestRenderer;
  const press=vi.fn(), steps=[{id:"a",label:"전체"},{id:"b",label:"화면"},{id:"c",label:"서버"}];
  const common={statusLabels:{pending:"다음",current:"현재",complete:"이전",error:"오류"},composeAccessibleName:({label}:{label:string})=>label,onStepPress:press};
  act(()=>{tree=create(<HjmNativeProvider><Steps {...common} descriptor={{steps,currentStepId:"b"}} /></HjmNativeProvider>)});
  try {
    expect(tree!.root.findAllByType(Pressable)).toHaveLength(1);
    act(()=>tree.update(<HjmNativeProvider><Steps {...common} descriptor={{steps,currentStepId:"b",navigationMode:"free"}} /></HjmNativeProvider>));
    const buttons=tree!.root.findAllByType(Pressable);expect(buttons).toHaveLength(3);
    expect(buttons[1]!.props.accessibilityState.selected).toBe(true);
    act(()=>buttons[2]!.props.onPress());expect(press).toHaveBeenCalledWith("c");
    act(()=>buttons[0]!.props.onPress());expect(press).toHaveBeenCalledWith("a");
  } finally {act(()=>tree!.unmount());}
});
