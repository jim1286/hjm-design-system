import { useState } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Pressable, TextInput } from "react-native";
import { expect, it } from "vitest";
import { hjmDesignPresets, type HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "../src/provider.js";
import { Tabs, type TabsAppearance } from "../src/navigation.js";
import { TextField } from "../src/inputs.js";
import { Text } from "../src/primitives.js";
import { startedAnimatedTimings } from "./react-native.mock.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
function Draft() {
  const [value, setValue] = useState("initial");
  return <TextField label="Draft" value={value} onValueChange={setValue} />;
}
const items = [{ id: "draft", label: "Draft tab", panel: <Draft /> }, { id: "history", label: "History", panel: <Text>History</Text> }, { id: "details", label: "Details", panel: <Text>Details</Text> }];

it("inherits profiles while keeping editor state, explicit overrides and vertical fallback", () => {
  let tree!: ReactTestRenderer;
  const render = (profile?: HjmDesignProfile, appearance?: TabsAppearance, vertical = false) => <HjmNativeProvider {...(profile ? { designProfile: profile } : {})}>
    <Tabs label="Sections" items={items} mountPolicy="visited" {...(appearance ? { appearance } : {})} orientation={vertical ? "vertical" : "horizontal"} />
  </HjmNativeProvider>;
  const buttons = () => tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityLabel !== undefined && node.props.onLayout);
  try {
    act(() => { tree = create(render()); });
    act(() => buttons().forEach((button, i) => button.props.onLayout({ nativeEvent: { layout: { x: i * 100, width: 100 } } })));
    const editor = tree.root.findByType(TextInput); act(() => editor.props.onChangeText("kept draft"));
    act(() => buttons()[1]!.props.onPress());
    for (const profile of Object.values(hjmDesignPresets)) {
      act(() => tree.update(render(profile)));
      expect(tree.root.findAllByType(Animated.View)).toHaveLength(profile.interactions.selectionMotion === "slide" ? 1 : 0);
      expect(tree.root.findByType(TextInput)).toBe(editor); expect(editor.props.value).toBe("kept draft");
      expect(buttons()[1]!.props.accessibilityState.selected).toBe(true);
    }
    act(() => tree.update(render(hjmDesignPresets.forest, "standard"))); expect(tree.root.findAllByType(Animated.View)).toHaveLength(0);
    act(() => tree.update(render(hjmDesignPresets.paper, "gooey"))); expect(tree.root.findByType(Animated.View).props.style.height).toBe(6);
    act(() => tree.update(render(hjmDesignPresets.forest, "slide", true))); expect(tree.root.findAllByType(Animated.View)).toHaveLength(0);
    act(() => tree.update(render())); expect(tree.root.findAllByType(Animated.View)).toHaveLength(0); expect(editor.props.value).toBe("kept draft");
  } finally { act(() => tree.unmount()); }
});

it("continues from a visible intermediate frame and settles reduced motion without changing selection", () => {
  let tree!: ReactTestRenderer;
  const render = (reduced = false) => <HjmNativeProvider designProfile={hjmDesignPresets.forest} reducedMotion={reduced}><Tabs label="Sections" items={items} /></HjmNativeProvider>;
  const buttons = () => tree.root.findAllByType(Pressable).filter(node => node.props.onLayout);
  try {
    act(() => { tree = create(render()); });
    act(() => buttons().forEach((button, i) => button.props.onLayout({ nativeEvent: { layout: { x: i * 100, width: 100 } } })));
    startedAnimatedTimings.length = 0; act(() => buttons()[1]!.props.onPress()); expect(startedAnimatedTimings).toEqual([{ duration: 200 }]);
    const progress = tree.root.findByType(Animated.View).props.style.left.__animatedValue;
    act(() => progress.setValue(0.5)); act(() => buttons()[2]!.props.onPress());
    expect(tree.root.findByType(Animated.View).props.style.left.configuration.outputRange).toEqual([50, 200]);
    expect(buttons()[2]!.props.accessibilityState.selected).toBe(true);
    act(() => tree.update(render(true))); startedAnimatedTimings.length = 0; act(() => buttons()[0]!.props.onPress());
    expect(startedAnimatedTimings).toHaveLength(0); expect(buttons()[0]!.props.accessibilityState.selected).toBe(true);
    expect(tree.root.findByType(Animated.View).props.accessible).toBe(false);
  } finally { act(() => tree.unmount()); }
});
