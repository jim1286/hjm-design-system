import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, StyleSheet, Text } from "react-native";
import { afterEach, expect, it } from "vitest";
import { Button, IconButton } from "../src/actions.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
it.each(["light", "dark"] as const)("preserves every button tone background and border when selected in %s", theme => {
  const render = (selected: boolean) => {
    const node = <HjmNativeProvider theme={theme}>
      {(["primary", "secondary", "ghost", "danger"] as const).map(tone => <Button key={tone} tone={tone} selected={selected}>Save</Button>)}
      <Button tone="link" selected={selected}>Save</Button>
      {(["primary", "secondary", "ghost", "danger"] as const).map(tone => <IconButton key={tone} label="Save" tone={tone} selected={selected}><Text>♥</Text></IconButton>)}
    </HjmNativeProvider>;
    act(() => { if (tree) tree.update(node); else tree = create(node); });
    return tree!.root.findAllByType(Pressable);
  };
  const style = (button: ReturnType<typeof render>[number]) => StyleSheet.flatten(typeof button.props.style === "function" ? button.props.style({ pressed: false }) : button.props.style);
  const idle = render(false).map(button => ({ ...style(button) }));
  render(true).forEach((button, index) => {
    const selected = style(button);
    expect(selected.backgroundColor).toBe(idle[index]!.backgroundColor);
    expect(selected.borderColor).toBe(idle[index]!.borderColor);
    expect(selected.borderWidth).toBe(idle[index]!.borderWidth);
    expect(button.props.accessibilityState.selected).toBe(true);
  });
});
