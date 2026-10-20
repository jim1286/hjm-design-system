import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { expect, it } from "vitest";
import { Progress } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("hides only the auxiliary visible value while keeping one accessible progress target", () => {
  let tree!:ReactTestRenderer;
  try {
    act(() => {tree=create(<HjmNativeProvider><Progress label="Friends met 1/30" value={1} max={30} showValue={false}/></HjmNativeProvider>);});
    const progress=tree.root.findAllByType(View).find(node=>node.props.accessibilityRole==="progressbar")!;
    expect(progress.props.accessible).toBe(true); expect(progress.props.accessibilityLabel).toBe("Friends met 1/30");
    expect(progress.props.accessibilityValue).toMatchObject({now:3,text:"3%"});
    expect(JSON.stringify(tree.toJSON())).not.toContain('"children":["3%"]');
  } finally {act(()=>tree.unmount());}
});
it('paints five fractional units behind one progress accessibility value', () => {
  let tree!:ReactTestRenderer;
  try {
    act(()=>{tree=create(<HjmNativeProvider><Progress label="Activity days 2.5/5" value={2.5} max={5} segments={5} showValue={false}/></HjmNativeProvider>);});
    const targets=tree.root.findAllByType(View).filter(node=>node.props.accessibilityRole==='progressbar');
    expect(targets).toHaveLength(1);expect(targets[0]!.props.accessibilityValue).toMatchObject({now:50,text:'50%'});
    const fills=tree.root.findAllByType(View).filter(node=>node.props.style?.height==='100%');
    expect(fills.map(node=>node.props.style.width)).toEqual(['100%','100%','50%','0%','0%']);
  } finally {act(()=>tree.unmount());}
});
