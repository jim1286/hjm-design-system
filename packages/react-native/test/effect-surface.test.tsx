import { useState } from "react";
import { Animated, Pressable } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AppState, Text, startedAnimatedTimings } from "./react-native.mock.js";
import { expect, it, vi } from "vitest";
const host = vi.hoisted(() => ({ fail: false }));
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: (props: object) => { if (host.fail) throw new Error("SVG host unavailable"); return <View {...props} />; }, Circle: View, Defs: View, Ellipse: View, RadialGradient: View, Stop: View, Pattern: View, Rect: View }; });
import { EffectSurface } from "../src/effect-surface.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("freezes the actual seeded layers for reduced motion and hidden native hosts", () => {
  let tree!: ReactTestRenderer;
  const render=(reducedMotion: boolean, visible: boolean) => <HjmNativeProvider reducedMotion={reducedMotion}><EffectSurface descriptor={{active:true,layers:['mesh','grain']}} visible={visible}><Text>Content</Text></EffectSurface></HjmNativeProvider>;
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
