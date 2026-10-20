import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { expect, it, vi } from "vitest";
import { BottomNavigation } from "../src/navigation.js";
import { HjmNativeProvider } from "../src/provider.js";

vi.mock("react-native", async original => {
  const native = await original<typeof import("react-native")>();
  return { ...native, Platform: { ...native.Platform, OS: "web" } };
});
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("announces the current route, moves focus past disabled destinations, and activates explicitly", async () => {
  let tree!: ReactTestRenderer;
  const activate = vi.fn(), focus = vi.fn();
  const descriptor = { accessibilityLabel: "탐색", selectedKey: "home", items: [
    { id: "home", label: "홈", icon: { name: "home" } },
    { id: "disabled", label: "준비 중", icon: { name: "clock" }, disabled: true },
    { id: "games", label: "경기", icon: { name: "calendar" } },
  ] };
  const event = (key: string) => {
    const element = {};
    return { key, repeat: false, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false,
      defaultPrevented: false, target: element, currentTarget: element, preventDefault: vi.fn() };
  };
  try {
    act(() => { tree = create(<HjmNativeProvider><BottomNavigation descriptor={descriptor}
      onActivate={activate} renderIcon={() => null} /></HjmNativeProvider>, { createNodeMock: () => ({ focus }) }); });
    const tabs = () => tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "tab");
    expect(tabs().map(tab => tab.props["aria-selected"])).toEqual([true, false, false]);
    expect(tabs().map(tab => tab.props.tabIndex)).toEqual([0, -1, -1]);
    expect(tabs()[1]!.props["aria-disabled"]).toBe(true);
    await act(async () => { tabs()[0]!.props.onKeyDown(event("ArrowRight")); await Promise.resolve(); });
    expect(focus).toHaveBeenCalledOnce();
    expect(activate).not.toHaveBeenCalled();
    expect(tabs().map(tab => tab.props.tabIndex)).toEqual([-1, -1, 0]);
    act(() => tabs()[2]!.props.onKeyDown(event(" ")));
    expect(activate).toHaveBeenLastCalledWith({ key: "games", reason: "navigate" });
    // A callback cannot change the controlled route until the navigator supplies it.
    expect(tabs()[0]!.props["aria-selected"]).toBe(true);
    act(() => tabs()[0]!.props.onKeyDown(event("Enter")));
    expect(activate).toHaveBeenLastCalledWith({ key: "home", reason: "reselect" });
  } finally { act(() => tree?.unmount()); }
});
