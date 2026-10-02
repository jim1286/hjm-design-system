import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { TextInput } from "react-native";
import { afterEach, expect, it } from "vitest";
import { Field, TextField, HjmNativeProvider, Text } from "../src/index.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const trees: ReactTestRenderer[] = [];
afterEach(() => { act(() => trees.splice(0).forEach(tree => tree.unmount())); });
const flatten = (value: unknown): Record<string, unknown> => Array.isArray(value) ? Object.assign({}, ...value.map(flatten)) : value as Record<string, unknown> ?? {};
it("custom and built-in fields share label/error presentation while preserving host accessible names", () => {
  for (const builtIn of [false, true]) {
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<HjmNativeProvider theme="light" textScale={2}>
      {builtIn ? <TextField label="Name" required description="Help" error="Required" />
        : <Field label="Name" required description="Help" error="Required">{props => <TextInput {...props} />}</Field>}
    </HjmNativeProvider>); });
    trees.push(tree);
    const error = tree.root.findAllByType(Text).find(node => node.props.children === "Required")!;
    expect(error.props).toMatchObject({ variant: "label", accessibilityLiveRegion: "assertive" });
    expect(tree.root.findAllByType(Text).some(node => node.props.children === "Help")).toBe(false);
    const label = tree.root.findAllByType(Text).find(node => Array.isArray(node.props.children) && node.props.children[0] === "Name")!;
    expect(label.props.variant).toBe("body");
    expect(flatten(label.props.style).fontWeight).toBe("600");
    expect(tree.root.findByType(TextInput).props.accessibilityLabel).toBe(builtIn ? "Name" : "Name *");
    expect(tree.root.findByType(TextInput).props.accessibilityHint).toBe("Required");
  }
});
