import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text as NativeText, TextInput } from "react-native";
import { expect, it } from "vitest";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import { Heading } from "../src/heading.js";
import { TextField } from "../src/inputs.js";
import { Card } from "../src/data-display.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const split = defineHjmDesignProfile({ tokens: { fontFamily: { ui: ["Product UI"], display: ["Product Display"], reading: ["Product Reading"] } } });
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : style && typeof style === "object" ? style as Record<string, unknown> : {};

it("uses one role choice on native text hosts while keeping fields on ui and header semantics intact", () => {
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(<HjmNativeProvider designProfile={split}>
      <Heading level="level2" semanticLevel={4}>Title</Heading><Text>Body</Text><Text variant="caption">Caption</Text>
      <Text fontRole="ui">Action hint</Text><Text fontRole="code">const value = 1;</Text>
      <Card title="Card title" description="Card body"><TextField label="Draft" defaultValue="kept" /></Card>
    </HjmNativeProvider>); });
    const text = (copy: string) => tree.root.findAllByType(NativeText).find(node => node.props.children === copy)!;
    expect(flatten(text("Title").props.style).fontFamily).toBe("Product Display");
    expect(text("Title").props.accessibilityRole).toBe("header"); expect(text("Title").props["aria-level"]).toBe(4);
    expect(flatten(text("Body").props.style).fontFamily).toBe("Product Reading");
    expect(flatten(text("Caption").props.style).fontFamily).toBe("Product UI");
    expect(flatten(text("Action hint").props.style).fontFamily).toBe("Product UI");
    expect(flatten(text("const value = 1;").props.style).fontFamily).toMatch(/Menlo|monospace/);
    expect(flatten(text("Card title").props.style).fontFamily).toBe("Product Display");
    expect(flatten(text("Card body").props.style).fontFamily).toBe("Product Reading");
    expect(flatten(tree.root.findByType(TextInput).props.style).fontFamily).toBe("Product UI");
  } finally { if (tree) act(() => tree.unmount()); }
});

it("restores legacy ui fallback without remounting a text input", () => {
  let tree!: ReactTestRenderer;
  const legacy = defineHjmDesignProfile({ tokens: { fontFamily: { ui: ["Legacy UI"] } } });
  const render = (profile: typeof split) => <HjmNativeProvider designProfile={profile}><Text>Body</Text><Heading level="level3">Title</Heading><TextField label="Draft" defaultValue="kept" /></HjmNativeProvider>;
  try {
    act(() => { tree = create(render(split)); }); const input = tree.root.findByType(TextInput);
    act(() => input.props.onChangeText("edited draft"));
    act(() => tree.update(render(legacy)));
    expect(tree.root.findByType(TextInput)).toBe(input); expect(input.props.value).toBe("edited draft");
    for (const copy of ["Title", "Body"]) {
      const text = tree.root.findAllByType(NativeText).find(node => node.props.children === copy)!;
      expect(flatten(text.props.style).fontFamily).toBe("Legacy UI");
    }
  } finally { if (tree) act(() => tree.unmount()); }
});
