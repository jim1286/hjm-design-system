import { Modal, Platform, Pressable } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Menu } from "../src/navigation.js";
import * as modalLifecycle from "../src/internal/modal-lifecycle.js";

let renderer: ReactTestRenderer;
let complete: () => void;
const cancel = vi.fn();
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  cancel.mockClear();
  vi.spyOn(modalLifecycle, "scheduleAfterNativeModalTeardown").mockImplementation(callback => {
    if (typeof callback !== "function") throw new TypeError("Expected a teardown callback");
    complete = callback;
    return { cancel };
  });
});
afterEach(() => { act(() => renderer?.unmount()); vi.restoreAllMocks(); Platform.OS = "android"; });
const press = () => renderer.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "Edit")!.props.onPress();
const view = (open: boolean, action: () => void | Promise<void>, owner = "first") => <HjmNativeProvider><Menu key={owner} open={open} onOpenChange={() => {}} triggerLabel="Menu" dismissLabel="Close" items={[{ id: "edit", label: "Edit" }]} onActionAfterDismiss={action} /></HjmNativeProvider>;

it("discards a previous dismissal when the owner reopens before teardown", async () => {
  const action = vi.fn();
  act(() => { renderer = create(view(true, action)); });
  act(press);
  act(() => renderer.update(view(false, action)));
  const stale = complete;
  act(() => renderer.update(view(true, action)));
  await act(async () => stale());
  expect(action).not.toHaveBeenCalled();
  expect(renderer.root.findByType(Modal).props.visible).toBe(true);
  act(press);
  act(() => renderer.update(view(false, action)));
  await act(async () => stale());
  expect(action).not.toHaveBeenCalled();
  await act(async () => complete());
  expect(action).toHaveBeenCalledOnce();
});

it("drops a queued action when its owner is replaced", async () => {
  const oldAction = vi.fn();
  const newAction = vi.fn();
  act(() => { renderer = create(view(true, oldAction)); });
  act(press);
  act(() => renderer.update(view(false, oldAction)));
  const stale = complete;
  act(() => renderer.update(view(true, newAction, "second")));
  await act(async () => stale());
  expect(oldAction).not.toHaveBeenCalled();
  expect(newAction).not.toHaveBeenCalled();
});

it("allows product-owned rejection recovery and a fresh action after reopening", async () => {
  const failure = new Error("Request failed");
  const showError = vi.fn();
  const request = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce(undefined);
  const action = vi.fn(async () => { try { await request(); } catch (error) { showError(error); } });
  act(() => { renderer = create(view(true, action)); });
  act(press);
  expect(action).not.toHaveBeenCalled();
  act(() => renderer.update(view(false, action)));
  await act(async () => complete());
  expect(showError).toHaveBeenCalledExactlyOnceWith(failure);
  act(() => renderer.update(view(true, action)));
  act(press);
  act(() => renderer.update(view(false, action)));
  await act(async () => complete());
  expect(action).toHaveBeenCalledTimes(2);
  expect(request).toHaveBeenCalledTimes(2);
});


it("waits for shown iOS modal dismissal and ignores duplicate completion", async () => {
  Platform.OS = "ios";
  const action = vi.fn();
  act(() => { renderer = create(view(true, action)); });
  act(() => renderer.root.findByType(Modal).props.onShow());
  act(press);
  // A controlled owner can refuse the close; no action runs until acceptance.
  expect(action).not.toHaveBeenCalled();
  act(() => renderer.update(view(false, action)));
  expect(modalLifecycle.scheduleAfterNativeModalTeardown).not.toHaveBeenCalled();
  const dismiss = renderer.root.findByType(Modal).props.onDismiss;
  await act(async () => { dismiss(); dismiss(); });
  expect(action).toHaveBeenCalledOnce();
});

it("header close dismisses a bottom menu without dispatching an item action", () => {
  const action = vi.fn();
  act(() => { renderer = create(<HjmNativeProvider><Menu defaultOpen presentation="bottom" title="Manage" description="Packing · v2" dismissPlacement="header" triggerLabel="Menu" dismissLabel="Close menu" items={[{ id: "edit", label: "Edit" }]} onActionAfterDismiss={action} /></HjmNativeProvider>); });
  const closeButtons = renderer.root.findAllByType(Pressable).filter(node => node.props.accessibilityLabel === "Close menu");
  expect(closeButtons).toHaveLength(2);
  act(() => closeButtons.at(-1)!.props.onPress());
  expect(renderer.root.findByType(Modal).props.visible).toBe(false);
  expect(action).not.toHaveBeenCalled();
});
