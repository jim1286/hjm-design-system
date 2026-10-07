import { useState } from "react";
import { Animated, Pressable, TextInput } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AppState, Text, startedAnimatedTimings } from "./react-native.mock.js";
import { expect, it, vi } from "vitest";
const host = vi.hoisted(() => ({ fail: false }));
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: (props: object) => { if (host.fail) throw new Error("SVG host unavailable"); return <View {...props} />; }, Circle: View, Defs: View, Ellipse: View, RadialGradient: View, Stop: View, Pattern: View, Rect: View, Mask: View, Image: View }; });
import { EffectSurface } from "../src/effect-surface.js";
import { HjmNativeProvider } from "../src/provider.js";
import { TextField } from "../src/inputs.js";
import { OverviewScreen } from "../src/design-profile.js";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("propagates the paper canvas through the public screen across all reference profiles without replacing its draft", () => {
  let tree!: ReactTestRenderer;
  const presets = ["paper", "forest", "minimal", "editorial", "brutalist", "glass", "aurora", "terminal", "clay", "retro", "neutral"] as const;
  const themed = (preset: typeof presets[number]) => <HjmNativeProvider designProfile={defineHjmDesignProfile({ extends: preset })} reducedMotion><OverviewScreen title="Notes" toolbarLabel="Note tools" toolbar={<TextField label="Draft" defaultValue="initial" />} items={[{ id: "one", children: <Text>One</Text> }]} /></HjmNativeProvider>;
  try {
    act(() => { tree = create(themed("paper")); }); const input = tree.root.findByType(TextInput);
    act(() => input.props.onChangeText("kept"));
    for (const preset of presets) {
      act(() => tree.update(themed(preset)));
      expect(tree.root.findByType(TextInput)).toBe(input); expect(input.props.value).toBe("kept");
      expect(tree.root.findAllByProps({ testID: "hjm-effect-ruled" }).length > 0).toBe(preset === "paper");
    }
  } finally { act(() => tree.unmount()); }
});
it("keeps notebook ruling outside the motion host and retains edited input when spacing changes", () => {
  let tree!: ReactTestRenderer;
  const render = (enabled: boolean, ruledSpacing: number) => <HjmNativeProvider reducedMotion={false}><EffectSurface descriptor={{ layers: enabled ? ["ruled"] : ["grain"], active: enabled, ruledSpacing }}><TextField label="Draft" defaultValue="initial" /></EffectSurface></HjmNativeProvider>;
  try {
    startedAnimatedTimings.splice(0); act(() => { tree = create(render(true, 24)); });
    const ruler = tree.root.findByProps({ testID: "hjm-effect-ruled" }), input = tree.root.findByType(TextInput);
    expect(ruler.props.pointerEvents).toBe("none"); expect(ruler.props.accessibilityElementsHidden).toBe(true);
    expect(ruler.props.style.some((value: { transform?: unknown }) => value?.transform)).toBe(false);
    expect(tree.root.findAll(node => node.props.patternUnits === "userSpaceOnUse" && node.props.height === 24).length).toBeGreaterThan(0);
    act(() => input.props.onChangeText("kept")); act(() => tree.update(render(true, 40)));
    expect(tree.root.findByType(TextInput)).toBe(input); expect(input.props.value).toBe("kept");
    expect(tree.root.findAll(node => node.props.patternUnits === "userSpaceOnUse" && node.props.height === 40).length).toBeGreaterThan(0);
    act(() => tree.update(render(false, 40))); expect(tree.root.findAllByProps({ testID: "hjm-effect-ruled" })).toHaveLength(0); expect(input.props.value).toBe("kept");
    expect(startedAnimatedTimings).toHaveLength(0);
  } finally { act(() => tree.unmount()); }
});
it("freezes the actual seeded layers for reduced motion and hidden native hosts", () => {
  let tree!: ReactTestRenderer;
  const render=(reducedMotion: boolean, visible: boolean) => <HjmNativeProvider reducedMotion={reducedMotion}><EffectSurface descriptor={{active:true,layers:['mesh','grain','noise']}} visible={visible}><Text>Content</Text></EffectSurface></HjmNativeProvider>;
  try {
    startedAnimatedTimings.splice(0);act(()=>{tree=create(render(true,true));});expect(startedAnimatedTimings).toHaveLength(0);
    expect(tree.root.findAll(node=>node.props.pointerEvents==='none').length > 0).toBe(true);
    act(()=>tree.update(render(false,false)));expect(startedAnimatedTimings).toHaveLength(0);
    act(()=>tree.update(render(false,true)));expect(startedAnimatedTimings.length).toBeGreaterThan(0);
    startedAnimatedTimings.splice(0);AppState.currentState='background';
    act(()=>tree.update(render(false,false)));act(()=>tree.update(render(false,true)));expect(startedAnimatedTimings).toHaveLength(0);
  } finally {AppState.currentState='active';act(()=>tree.unmount());}
});

it("isolates a failed decoration while preserving interactive content state and the base surface", () => {
  function Content() { const [count, setCount] = useState(0); return <Pressable onPress={() => setCount(value => value + 1)}><Text>{`Saved ${count}`}</Text></Pressable>; }
  const render = (seed: string) => <HjmNativeProvider><EffectSurface descriptor={{ seed }}><Content /></EffectSurface></HjmNativeProvider>;
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(render("first")); });
    act(() => tree.root.findByType(Pressable).props.onPress());
    host.fail = true;
    act(() => tree.update(render("second")));
    expect(tree.root.findByType(Text).props.children).toBe("Saved 1");
    expect(tree.root.findAll(node => node.props.pointerEvents === "none")).toHaveLength(0);
    expect(tree.root.findAll(node => Array.isArray(node.props.style) && node.props.style[0]?.backgroundColor).length).toBeGreaterThan(0);
    act(() => tree.root.findByType(Pressable).props.onPress());
    expect(tree.root.findByType(Text).props.children).toBe("Saved 2");
  } finally { host.fail = false; act(() => tree.unmount()); error.mockRestore(); }
});

it("retains static decoration when starting motion after foregrounding fails", () => {
  const listeners: ((state: string) => void)[] = [];
  const subscribe = vi.spyOn(AppState, "addEventListener").mockImplementation((_event, callback) => { listeners.push(callback); return { remove() {} }; });
  const timing = vi.spyOn(Animated, "timing").mockImplementation(() => { throw new Error("Animation host unavailable"); });
  let tree!: ReactTestRenderer;
  try {
    AppState.currentState = "background";
    act(() => { tree = create(<HjmNativeProvider reducedMotion={false}><EffectSurface descriptor={{ active: true }}><Text>Content</Text></EffectSurface></HjmNativeProvider>); });
    expect(timing).not.toHaveBeenCalled();
    expect(() => act(() => listeners.forEach(listener => listener("active")))).not.toThrow();
    expect(timing).toHaveBeenCalledTimes(1);
    act(() => listeners.forEach(listener => listener("active")));
    expect(timing).toHaveBeenCalledTimes(1);
    expect(tree.root.findByType(Text).props.children).toBe("Content");
    expect(tree.root.findAll(node => node.props.pointerEvents === "none").length).toBeGreaterThan(0);
  } finally { act(() => tree.unmount()); AppState.currentState = "active"; timing.mockRestore(); subscribe.mockRestore(); }
});
