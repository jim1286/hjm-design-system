import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, View } from "react-native";
import { expect, it, vi } from "vitest";
import { NotificationRow } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("owns one named command, blocks disabled dispatch and keeps passive-host compatibility", () => {
  const open = vi.fn(); let tree!: ReactTestRenderer;
  const frame = (disabled: boolean, interactive = true) => <HjmNativeProvider><NotificationRow
    avatar={<View />} preview="A friend followed you" metadata="1 minute ago" separator unread
    {...(interactive ? { action: { label: "A friend followed you. 1 minute ago", onActivate: open, disabled } } : {})} /></HjmNativeProvider>;
  try {
    act(() => { tree = create(frame(false)); });
    expect(tree.root.findAllByType(Pressable)).toHaveLength(1);
    const button = tree.root.findByType(Pressable);
    expect(button.props.accessibilityLabel).toBe("A friend followed you. 1 minute ago");
    expect(button.props.accessibilityRole).toBe("button");
    act(() => button.props.onPress()); expect(open).toHaveBeenCalledOnce();
    act(() => tree.update(frame(true)));
    const disabled = tree.root.findByType(Pressable);
    act(() => disabled.props.onPress()); expect(open).toHaveBeenCalledOnce();
    expect(disabled.props.accessibilityState.disabled).toBe(true);
    act(() => tree.update(frame(false, false)));
    expect(tree.root.findAllByType(Pressable)).toHaveLength(0);
  } finally { act(() => tree.unmount()); }
});
