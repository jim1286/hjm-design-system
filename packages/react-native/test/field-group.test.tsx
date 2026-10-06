import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { StrictMode } from "react";
import { TextInput, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { FieldGroup, type FieldGroupBinding } from "../src/field-group.js";
import { TextField } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const fields = [{ id: "a", label: "주소", description: "건물 번호", error: "개별 오류" }, { id: "b", label: "국가", disabled: true }];
it("keeps inputs individually accessible and combines group context with independent feedback", () => {
  act(() => { tree = create(<HjmNativeProvider><FieldGroup descriptor={{ label: "배송지", description: "받을 곳", fields,
    error: { message: "그룹 오류", fieldIds: ["a"] } }} renderField={({ controlProps }) => <TextField {...controlProps} />} /></HjmNativeProvider>); });
  const inputs = tree!.root.findAllByType(TextInput);
  expect(inputs[0]!.props.accessibilityLabel).toBe("배송지, 주소");
  expect(inputs[0]!.props.accessibilityHint).toBe("받을 곳\n건물 번호\n개별 오류\n그룹 오류");
  expect(inputs[1]!.props.accessibilityHint).toBe("받을 곳");
  expect(tree!.root.findByType(FieldGroup).findAllByType(View).filter(node => node.props.accessible === true)).toHaveLength(0);
});
it("blocks old callbacks after group lock, member removal and unmount", () => {
  const change = vi.fn(); let binding: FieldGroupBinding | undefined;
  const render = (disabled: boolean, removed = false) => <StrictMode><HjmNativeProvider><FieldGroup descriptor={{ label: "배송지", fields: removed ? [] : fields, disabled }}
    renderField={field => { if (field.id === "a") binding = field; return <TextField {...field.controlProps} onValueChange={field.guardChange(change)} />; }} /></HjmNativeProvider></StrictMode>;
  act(() => { tree = create(render(false)); }); const callback = binding!.guardChange(change);
  act(() => tree!.update(render(true))); callback("late"); expect(change).not.toHaveBeenCalled();
  act(() => tree!.update(render(false))); callback("ok"); expect(change).toHaveBeenCalledOnce();
  expect(tree!.root.findAllByType(TextInput)[1]!.props.editable).toBe(false);
  act(() => tree!.update(render(false, true))); callback("removed"); expect(change).toHaveBeenCalledOnce();
  act(() => tree!.update(render(false))); callback("old field"); expect(change).toHaveBeenCalledOnce();
  const current = tree!.root.findAllByType(TextInput)[0]!.props.onChangeText;
  act(() => current("new field")); expect(change).toHaveBeenLastCalledWith("new field");
  expect(change).toHaveBeenCalledTimes(2);
  act(() => tree!.unmount()); tree = undefined; callback("unmounted"); current("unmounted current"); expect(change).toHaveBeenCalledTimes(2);
});
