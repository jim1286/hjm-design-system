import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { afterEach, expect, it } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { TextArea, TextField } from "../src/inputs.js";
import { NumberField } from "../src/number-field.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
afterEach(() => act(() => tree?.unmount()));
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;
it('uses the product handwriting font for the editable value', () => {
  act(() => { tree = create(<HjmNativeProvider><TextArea label="Draft" contentFontFamily="DiairyHand" /></HjmNativeProvider>); });
  const input = tree.root.find(node => node.props.accessibilityLabel === 'Draft' && !!node.props.onChangeText);
  expect(flatten(input.props.style).fontFamily).toBe('DiairyHand');
});
it.each(["single", "multiline", "number"] as const)("%s keeps invalid thickness when disabled and restores the normal frame on recovery", kind => {
  const ui = (invalid: boolean, disabled = false) => <HjmNativeProvider theme="light">
    {kind === "multiline" ? <TextArea label="Draft" invalid={invalid} disabled={disabled} /> : kind === "number" ? <NumberField label="Draft" min={0} max={10} incrementLabel="Increase" decrementLabel="Decrease" disabled={disabled} {...(invalid ? { error: "Invalid" } : {})} /> : <TextField label="Draft" invalid={invalid} disabled={disabled} />}
  </HjmNativeProvider>;
  act(() => { tree = create(ui(false)); });
  const control = () => tree.root.findAllByType(View).find(node => typeof flatten(node.props.style).minHeight === "number" && typeof flatten(node.props.style).borderWidth === "number")!;
  expect(flatten(control().props.style).borderWidth).toBe(1);
  act(() => tree.update(ui(true)));
  expect(flatten(control().props.style).borderWidth).toBe(2);
  act(() => tree.update(ui(true, true)));
  expect(flatten(control().props.style).borderWidth).toBe(2);
  act(() => tree.update(ui(false)));
  expect(flatten(control().props.style).borderWidth).toBe(1);
});
