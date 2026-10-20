import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, View } from "react-native";
import { expect, it, vi } from "vitest";
import { BottomCTA } from "../src/actions.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("keeps decorated footer actions independent and blocks only the busy action", () => {
  const run = vi.fn(), remix = vi.fn(); let tree!: ReactTestRenderer;
  const frame = (loading: boolean) => <HjmNativeProvider><BottomCTA
    primaryAction={{ label: "Run", onPress: run, leading: <View testID="run-icon" />, trailing: <View testID="end-icon" /> }}
    secondaryAction={{ label: "Remix", onPress: remix, loading, leading: <View testID="remix-icon" /> }} /></HjmNativeProvider>;
  try {
    act(() => { tree = create(frame(false)); });
    const commands = () => tree.root.findAllByType(Pressable);
    expect(commands()).toHaveLength(2);
    const [secondary, primary] = commands();
    expect(primary!.findAllByProps({testID:"run-icon"}).length).toBeGreaterThan(0);
    expect(primary!.findAllByProps({testID:"end-icon"}).length).toBeGreaterThan(0);
    expect(secondary!.findAllByProps({testID:"remix-icon"}).length).toBeGreaterThan(0);
    act(() => { primary!.props.onPress(); secondary!.props.onPress(); });
    expect(run).toHaveBeenCalledOnce(); expect(remix).toHaveBeenCalledOnce();
    act(() => tree.update(frame(true)));
    act(() => { const [busy, ready] = commands(); busy!.props.onPress(); ready!.props.onPress(); });
    expect(remix).toHaveBeenCalledOnce(); expect(run).toHaveBeenCalledTimes(2);
    expect(commands()[0]!.props.accessibilityState.busy).toBe(true);
  } finally { act(() => tree.unmount()); }
});
