import type { ReactNode } from "react";
import type { AlertDialogRequest, AlertDialogResult } from "@hjmds/design-contracts/components/alert-dialog";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Modal, Platform, Pressable, Text } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { AlertDialogQueueProvider, useAlertDialogQueue, type AlertDialogQueueApi } from "../src/alert-dialog-queue.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
  vi.useRealTimers();
});

const ask = (title: string): AlertDialogRequest => ({ mode: "confirm", title, description: "설명", confirmLabel: "확인", cancelLabel: "취소" });
let api!: AlertDialogQueueApi;
function Capture() { api = useAlertDialogQueue(); return null; }
const tree = (scope: string, node: ReactNode = <Capture />) => <HjmNativeProvider reducedMotion theme="light"><AlertDialogQueueProvider scope={scope}>{node}</AlertDialogQueueProvider></HjmNativeProvider>;
const track = (promise: Promise<AlertDialogResult>) => { const box: { result?: AlertDialogResult } = {}; void promise.then((result) => { box.result = result; }); return box; };
const titles = (renderer: ReactTestRenderer) => renderer.root.findAllByType(Modal).filter((modal) => modal.props.visible)
  .flatMap((modal) => modal.findAllByType(Text).map((node) => node.props.children)).filter((text) => typeof text === "string" && text.endsWith("째"));
const press = (renderer: ReactTestRenderer, label: string) => renderer.root.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === label)!.props.onPress();
const settle = async () => { await act(async () => { vi.runOnlyPendingTimers(); await Promise.resolve(); await Promise.resolve(); }); };

it("presents queued questions one at a time and resolves each after its dialog is dismissed", async () => {
  vi.useFakeTimers();
  let renderer!: ReactTestRenderer;
  act(() => { renderer = create(tree("/a"), { createNodeMock: () => ({}) }); });
  let first!: ReturnType<typeof track>; let second!: ReturnType<typeof track>;
  act(() => { first = track(api.open(ask("첫째"))); second = track(api.open(ask("둘째"))); });
  expect(titles(renderer)).toEqual(["첫째"]);
  await act(async () => { press(renderer, "확인"); await Promise.resolve(); });
  // Settled only after the native exit, never while the first dialog is still on screen.
  expect(first.result).toBeUndefined();
  await settle();
  expect(first.result).toEqual({ outcome: "confirmed" });
  expect(titles(renderer)).toEqual(["둘째"]);
  await act(async () => { press(renderer, "취소"); await Promise.resolve(); });
  await settle();
  expect(second.result).toEqual({ outcome: "cancelled", reason: "cancel-action" });
  act(() => renderer.unmount());
});

it("interrupts a departed scope's question and everything when the provider unmounts", async () => {
  let renderer!: ReactTestRenderer;
  act(() => { renderer = create(tree("/a"), { createNodeMock: () => ({}) }); });
  let left!: ReturnType<typeof track>;
  act(() => { left = track(api.open(ask("이전째"))); });
  await act(async () => { renderer.update(tree("/b")); await Promise.resolve(); });
  expect(left.result).toEqual({ outcome: "cancelled", reason: "interrupted" });
  let pending!: ReturnType<typeof track>;
  act(() => { pending = track(api.open(ask("현재째"))); });
  expect(titles(renderer)).toEqual(["현재째"]);
  await act(async () => { renderer.unmount(); await Promise.resolve(); });
  expect(pending.result).toEqual({ outcome: "cancelled", reason: "interrupted" });
});
