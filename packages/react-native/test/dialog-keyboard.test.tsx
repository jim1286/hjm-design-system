import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Keyboard, Platform } from "react-native";
import { afterEach, expect, it } from "vitest";
import { Dialog, AlertDialog } from "../src/overlays.js";
import { HjmNativeProvider } from "../src/provider.js";
import { spacing } from "@hjmds/design-contracts/foundations";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const keyboard = Keyboard as typeof Keyboard & {
  __emit(event: string, height?: number, coordinates?: Record<string, number>): void;
};
let renderer: ReactTestRenderer | undefined;
const tree = (kind: "dialog" | "alert", open = true) => <HjmNativeProvider reducedMotion>
  {kind === "dialog" ? <Dialog open={open} title="Edit" closeLabel="Close" primaryAction={{ label: "Save", onPress() {} }} />
    : <AlertDialog open={open} request={{ mode: "confirm", title: "Leave?", description: "Keep editing or leave.", confirmLabel: "Leave", cancelLabel: "Keep editing" }} />}
</HjmNativeProvider>;
function positioner() {
  return renderer!.root.findAllByType(Animated.View).find(node => node.props.style?.flex === 1)!;
}
afterEach(() => {
  act(() => renderer?.unmount()); renderer = undefined;
  keyboard.__emit("keyboardDidHide");
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
});

it.each(["dialog", "alert"] as const)("keeps %s actions above the docked keyboard and clears the inset on hide", kind => {
  act(() => { renderer = create(tree(kind)); });
  act(() => keyboard.__emit("keyboardDidShow", 200));
  expect(positioner().props.style.paddingBottom).toBe(200 + spacing.md);
  act(() => keyboard.__emit("keyboardDidHide"));
  expect(positioner().props.style.paddingBottom).toBe(spacing.md);
});

it("uses current keyboard metrics on open and measured modal height after Android resize", () => {
  keyboard.__emit("keyboardDidShow", 200);
  act(() => { renderer = create(tree("dialog")); });
  expect(positioner().props.style.paddingBottom).toBe(200 + spacing.md);
  act(() => positioner().props.onLayout({ nativeEvent: { layout: { height: 400 } } }));
  expect(positioner().props.style.paddingBottom).toBe(spacing.md);
});

it("tracks iOS frame changes but leaves floating keyboards out of the centered viewport", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  act(() => { renderer = create(tree("dialog")); });
  act(() => keyboard.__emit("keyboardWillChangeFrame", 260));
  expect(positioner().props.style.paddingBottom).toBe(260 + spacing.md);
  act(() => keyboard.__emit("keyboardWillChangeFrame", 200, { width: 300, screenX: 100 }));
  expect(positioner().props.style.paddingBottom).toBe(spacing.md);
});
