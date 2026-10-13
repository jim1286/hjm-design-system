import { describe, expect, it, vi } from "vitest";
import { createToastSession, createToastStore, resolveToastDescriptor, type ToastDescriptor } from "../src/toast.js";

const message = (extra: Partial<ToastDescriptor> = {}): ToastDescriptor => ({
  id: "reply", description: "새 답장이 도착했어요", closeLabel: "알림 닫기", ...extra,
});

describe("whole-card Toast activation", () => {
  it("requires a localized name and callback, and persists like other actionable notices", () => {
    const press = { accessibilityLabel: "답장 열기", onPress: vi.fn() };
    expect(resolveToastDescriptor(message({ press }))).toMatchObject({ press, durationMs: null });
    expect(resolveToastDescriptor(message({ press, durationMs: 4000 })).durationMs).toBe(4000);
    expect(() => resolveToastDescriptor(message({ press: { ...press, accessibilityLabel: " " } }))).toThrow();
    expect(() => resolveToastDescriptor(message({ press: { ...press, onPress: undefined as never } }))).toThrow();
  });

  it("runs the callback before closing, once, and promotes FIFO only after exit", () => {
    const store = createToastStore(), events: string[] = [];
    store.publish(message({ press: { accessibilityLabel: "열기", onPress: () => {
      events.push(store.getSnapshot().visible[0]!.phase);
      expect(store.invokePress("reply")).toBe(false);
    } }, onDismiss: reason => events.push(reason) }));
    store.publish(message({ id: "next" }));
    expect(store.invokePress("reply")).toBe(true);
    expect(store.invokePress("reply")).toBe(false);
    expect(events).toEqual(["visible"]);
    expect(store.getSnapshot().visible[0]!.phase).toBe("closing");
    store.completeExit("reply");
    expect(events).toEqual(["visible", "press"]);
    expect(store.getSnapshot().visible[0]!.descriptor.id).toBe("next");
  });

  it("keeps secondary action independent and prevents reentrant cross-control invocation", () => {
    const press = vi.fn(), action = vi.fn(() => { expect(session.invokePress()).toBe(false); });
    const session = createToastSession(message({
      press: { accessibilityLabel: "열기", onPress: press },
      action: { label: "읽음", onAction: action, dismissOnAction: false },
    }));
    session.show(); session.invokeAction(); session.invokeAction();
    expect(press).not.toHaveBeenCalled(); expect(action).toHaveBeenCalledOnce();
    session.invokePress(); expect(press).toHaveBeenCalledOnce();
    expect(session.getSnapshot().dismissReason).toBe("press");
  });

  it("does not close a new revision published inside the press callback", () => {
    const next = vi.fn(), store = createToastStore();
    store.publish(message({ press: { accessibilityLabel: "열기", onPress: () => {
      store.publish(message({ description: "다음 결과", press: { accessibilityLabel: "다음 열기", onPress: next } }));
      expect(store.invokePress("reply")).toBe(false);
    } } }));
    store.invokePress("reply");
    expect(store.getSnapshot().visible[0]!.phase).toBe("visible");
    store.invokePress("reply"); expect(next).toHaveBeenCalledOnce();
  });

  it("finishes dismissal even if navigation throws, without executing it twice", () => {
    const onPress = vi.fn(() => { throw new Error("navigation failed"); });
    const session = createToastSession(message({ press: { accessibilityLabel: "열기", onPress } }));
    session.show(); expect(() => session.invokePress()).toThrow("navigation failed");
    expect(session.getSnapshot().dismissReason).toBe("press");
    expect(session.invokePress()).toBe(false); expect(onPress).toHaveBeenCalledOnce();
  });

  it.each(["swipe", "close-action", "timeout", "programmatic"] as const)("never activates after %s dismissal", reason => {
    const onPress = vi.fn(), session = createToastSession(message({ press: { accessibilityLabel: "열기", onPress } }));
    expect(session.invokePress()).toBe(false);
    session.show(); session.dismiss(reason);
    expect(session.invokePress()).toBe(false); expect(onPress).not.toHaveBeenCalled();
  });

  it("lets navigation dispose the provider without a second dismiss or opening the next item", () => {
    const store = createToastStore(), dismissed = vi.fn(), next = vi.fn();
    store.publish(message({ press: { accessibilityLabel: "열기", onPress: () => { store.dispose(); } }, onDismiss: dismissed }));
    store.publish(message({ id: "next", press: { accessibilityLabel: "다음", onPress: next } }));
    store.invokePress("reply");
    expect(dismissed).toHaveBeenCalledExactlyOnceWith("interrupted"); expect(next).not.toHaveBeenCalled();
  });
});
