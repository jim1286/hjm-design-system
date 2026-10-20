import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { expect, it, vi } from "vitest";
import { SegmentedControl } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";

vi.mock("react-native", async original => {
  const native = await original<typeof import("react-native")>();
  return { ...native, Platform: { ...native.Platform, OS: "web" } };
});
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("exposes one checked filter and keyboard entry, and Space selects through its existing callback", () => {
  let tree!: ReactTestRenderer;
  const changed = vi.fn();
  try {
    act(() => { tree = create(<HjmNativeProvider><SegmentedControl label="기록" presentation="pills" overflow="scroll"
      defaultValue="batting" onValueChange={changed} items={[{ value: "batting", label: "타자" }, { value: "pitching", label: "투수" }, { value: "disabled", label: "준비 중", disabled: true }]} /></HjmNativeProvider>); });
    const options = () => tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "radio");
    expect(options().map(node => node.props["aria-checked"])).toEqual([true, false, false]);
    expect(options().map(node => node.props.tabIndex)).toEqual([0, -1, -1]);
    expect(options()[2]!.props["aria-disabled"]).toBe(true);
    const element = {}, preventDefault = vi.fn();
    const event = { key: " ", repeat: false, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false,
      defaultPrevented: false, target: element, currentTarget: element, preventDefault };
    act(() => options()[1]!.props.onKeyDown(event));
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(changed).toHaveBeenCalledExactlyOnceWith("pitching");
    expect(options().map(node => node.props["aria-checked"])).toEqual([false, true, false]);
    expect(options().map(node => node.props.tabIndex)).toEqual([-1, 0, -1]);
    act(() => options()[2]!.props.onKeyDown(event));
    expect(changed).toHaveBeenCalledTimes(1);
  } finally { act(() => tree?.unmount()); }
});
