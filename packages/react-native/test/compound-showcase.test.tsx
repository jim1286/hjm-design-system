import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { Switch } from "@hjmds/react-native/inputs";
import { NotificationBell } from "@hjmds/react-native/notification-bell";
import { Confirm, Notifications } from "../../../showcase/native/src/compound-previews";
import { compoundCopy as copy } from "../../../showcase/shared/compound-controls";
vi.mock("lucide-react-native", () => ({ Bell: () => null }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
beforeEach(() => vi.useFakeTimers());
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.useRealTimers(); });
const button = (label: string) => tree!.root.findAllByType(Button).find(node => node.props.children === label)!;
const press = (label: string) => act(() => button(label).props.onPress());
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(600); });

it("preserves the submitted failure choice and uses the next choice only on retry", async () => {
  act(() => { tree = create(<HjmNativeProvider reducedMotion><Confirm /></HjmNativeProvider>); });
  press(copy.confirm.label); press(copy.confirm.confirmLabel);
  act(() => tree!.root.findByType(Switch).props.onCheckedChange(true)); await tick();
  expect(button(copy.confirm.confirmLabel) === undefined).toBe(true);
  press(copy.reset); press(copy.confirm.label); press(copy.confirm.confirmLabel);
  act(() => tree!.root.findByType(Switch).props.onCheckedChange(false)); await tick();
  expect(button(copy.confirm.confirmLabel) !== undefined).toBe(true);
  press(copy.confirm.confirmLabel); await tick(); expect(button(copy.confirm.confirmLabel) === undefined).toBe(true);
});

it("ignores an old confirmation after reset while preserving the new attempt", async () => {
  act(() => { tree = create(<HjmNativeProvider reducedMotion><Confirm /></HjmNativeProvider>); });
  press(copy.confirm.label); press(copy.confirm.confirmLabel); press(copy.reset);
  press(copy.confirm.label); await tick(); expect(button(copy.confirm.confirmLabel) !== undefined).toBe(true);
});

it("counts every queued arrival and starts again from the latest read state", () => {
  act(() => { tree = create(<HjmNativeProvider reducedMotion><Notifications /></HjmNativeProvider>); });
  const add = tree!.root.findByType(Button).props.onPress;
  act(() => { add(); add(); }); expect(tree!.root.findByType(NotificationBell).props.count).toBe(5);
  const read = tree!.root.findByType(NotificationBell).props.onPress;
  act(() => { read(); add(); }); expect(tree!.root.findByType(NotificationBell).props.count).toBe(1);
});
