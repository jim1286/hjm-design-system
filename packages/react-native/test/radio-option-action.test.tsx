import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, Text as NativeText } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { RadioGroup } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
afterEach(() => act(() => tree?.unmount()));
const action=vi.fn(), change=vi.fn();
function render(disabled=false, readOnly=false) {
  action.mockClear(); change.mockClear();
  act(() => { tree=create(<HjmNativeProvider><RadioGroup accessibilityLabel="Handwriting" defaultValue="a"
    disabled={disabled} readOnly={readOnly} onValueChange={change}
    items={[{value:"a",label:"Default"},{value:"b",label:"Summer",action:{label:"Rename",accessibilityLabel:"Rename Summer",onAction:action}}]}
    renderLabel={item => <NativeText style={{fontFamily:"CustomInk"}}>Ink preview {item.value}</NativeText>} /></HjmNativeProvider>); });
}
it("exposes the stable radio name and a separate action without selecting the option", () => {
  render();
  const pressables=tree.root.findAllByType(Pressable);
  const radio=pressables.find(node=>node.props.accessibilityLabel==="Summer")!;
  const rename=pressables.find(node=>node.props.accessibilityLabel==="Rename Summer")!;
  expect(radio.props.accessibilityRole).toBe("radio");
  expect(radio.props.accessibilityState.checked).toBe(false);
  let parent=rename.parent; while(parent) { expect(parent).not.toBe(radio); parent=parent.parent; }
  act(()=>rename.props.onPress()); expect(action).toHaveBeenCalledOnce(); expect(change).not.toHaveBeenCalled();
  act(()=>radio.props.onPress()); expect(change).toHaveBeenLastCalledWith("b");
});
it("disables both selection and the independent action with the group", () => {
  render(true);
  expect(tree.root.findAllByType(Pressable).every(node=>node.props.disabled)).toBe(true);
});
it("keeps management available while selection is read-only", () => {
  render(false,true);
  const pressables=tree.root.findAllByType(Pressable);
  const radio=pressables.find(node=>node.props.accessibilityLabel==="Summer")!;
  const rename=pressables.find(node=>node.props.accessibilityLabel==="Rename Summer")!;
  act(()=>radio.props.onPress()); expect(change).not.toHaveBeenCalled();
  expect(rename.props.disabled).toBe(false);
  act(()=>rename.props.onPress()); expect(action).toHaveBeenCalledOnce();
});
