import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, StyleSheet, View, TextInput } from "react-native";
import { expect, it } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { Card } from "../src/data-display.js";
import { Tabs, BottomNavigation } from "../src/navigation.js";
import { ReactionPicker } from "../src/reaction-picker.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { Combobox } from "../src/forms.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const destinations = { accessibilityLabel: "Capsule", selectedKey: "home", items: [
  { id: "home", label: "Home", icon: { name: "home" } }, { id: "search", label: "Search", icon: { name: "search" } },
] } as const;

it.each(["light", "dark"] as const)("resolves the neutral role in tabs, navigation, reactions and toggles in %s", theme => {
  let tree!: ReactTestRenderer;
  const render = (surfaceSelected?: string) => <HjmNativeProvider theme={theme} reducedMotion {...(surfaceSelected ? { brandPalette: { [theme]: { surfaceSelected } } } : {})}>
    <Button selected tone="ghost" accessibilityLabel="Toggle">Toggle</Button>
    <Button accessibilityLabel="Save">Save</Button>
    <Card selected title="Card" testID="card" />
    <Tabs label="Filled" indicator="filled" items={[{ id: "a", label: "One" }, { id: "b", label: "Two" }]} defaultValue="a" />
    <Tabs label="Solid" indicator="solid" items={[{ id: "a", label: "One" }, { id: "b", label: "Two" }]} defaultValue="a" />
    <BottomNavigation configuration={{ presentation: "capsule" }} descriptor={destinations} onActivate={() => {}} renderIcon={() => null} />
    <ReactionPicker label="Wrap" options={[{ id: "like", label: "Like wrap", emoji: "👍" }]} value="like" onValueChange={() => {}} />
    <ReactionPicker label="Strip" layout="strip" options={[{ id: "like", label: "Like strip", emoji: "👍" }]} value="like" onValueChange={() => {}} />
    <ToggleGroup descriptor={{ accessibilityLabel: "Format", items: [{ id: "bold", label: "Bold" }] }} pressedIds={new Set(["bold"])} />
  </HjmNativeProvider>;
  const style = (node: ReturnType<typeof tree.root.findByType>) => StyleSheet.flatten(typeof node.props.style === "function" ? node.props.style({ pressed: false }) : node.props.style);
  try {
    for (const override of [undefined, theme === "light" ? "#f8f8fa" : "#24282f"]) {
      act(() => { if (tree) tree.update(render(override)); else tree = create(render(override)); });
      const expected = override ?? (theme === "light" ? "#f0f1f3" : "#30343b");
      const controls = tree.root.findAllByType(Pressable);
      for (const label of ["Toggle", "Home", "Like wrap", "Like strip"]) {
        const control = controls.find(node => node.props.accessibilityLabel === label)!;
        expect(control, label).toBeDefined();
        expect(style(control).backgroundColor, label).toBe(expected);
      }
      expect(tree.root.findAllByType(View).filter(node => node.props.testID === "card").map(style).some(value => value.backgroundColor === expected)).toBe(true);
      expect(style(tree.root.findByType(ToggleGroup).findByType(Pressable)).backgroundColor).toBe(expected);
      const tab = controls.find(node => node.props.accessibilityRole === "tab" && node.props.accessibilityState?.selected)!;
      expect(style(tab).backgroundColor).toBe(expected);
      const primary = controls.find(node => node.props.accessibilityLabel === "Save")!;
      expect(style(primary).backgroundColor).not.toBe(expected);
      const solid = tree.root.findAllByType(Tabs)[1]!.findAllByType(Pressable).find(node => node.props.accessibilityState?.selected)!;
      expect(style(solid).backgroundColor).toBe(style(primary).backgroundColor);
    }
  } finally { act(() => tree?.unmount()); }
});

it("does not paint an uncommitted native combobox candidate as a selection", () => {
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(<HjmNativeProvider><Combobox label="City" defaultOpen defaultSelectedKey="seoul" defaultInputValue=""
      items={[{ id: "seoul", label: "Seoul", textValue: "Seoul" }, { id: "busan", label: "Busan", textValue: "Busan" }]}
      emptyMessage="Empty" loadingMessage="Loading" clearLabel="Clear" dismissLabel="Close" /></HjmNativeProvider>); });
    const input = tree.root.findByType(TextInput);
    act(() => input.props.onKeyPress({ nativeEvent: { key: "ArrowDown" } }));
    act(() => input.props.onKeyPress({ nativeEvent: { key: "ArrowDown" } }));
    const choices = tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "radio");
    const paint = (label: string) => { const node = choices.find(item => item.props.accessibilityLabel === label)!; return StyleSheet.flatten(node.props.style({ pressed: false })).backgroundColor; };
    expect(paint("Seoul")).toBe("#f0f1f3");
    expect(paint("Busan")).toBe("#ffffff");
    expect(choices.find(node => node.props.accessibilityLabel === "Busan")!.props.accessibilityState.checked).toBe(false);
  } finally { act(() => tree?.unmount()); }
});
