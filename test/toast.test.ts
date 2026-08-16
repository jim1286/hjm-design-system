import { describe, expect, it, vi } from "vitest";
import {
  ACCENTS,
  THEMES,
  accentFill,
  behaviorRegistry,
  componentCatalog,
  control,
  createToastSession,
  createToastStore,
  resolveColorReference,
  resolveToastAnnouncement,
  resolveToastDescriptor,
  resolveToastDuration,
  toastBehaviorDefaults,
  toastRecipe,
  validateToastDescriptor,
  type ToastDescriptor,
} from "../src/index.js";

function makeToast(
  id: string,
  overrides: Omit<Partial<ToastDescriptor>, "id"> = {},
): ToastDescriptor {
  return {
    id,
    description: `Message ${id}`,
    closeLabel: "Dismiss notification",
    ...overrides,
  } as ToastDescriptor;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return (
    0.2126 * (channels[0] ?? 0) +
    0.7152 * (channels[1] ?? 0) +
    0.0722 * (channels[2] ?? 0)
  );
}

function contrast(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("Toast descriptor and announcement contract", () => {
  it("rejects unstable identity, inaccessible copy, and invalid timing", () => {
    const invalid = [
      makeToast(""),
      makeToast(" padded "),
      makeToast("description", { description: " " }),
      makeToast("close-label", { closeLabel: "" }),
      makeToast("title", { title: " " }),
      makeToast("announcement", { announcement: "\n" }),
      makeToast("zero", { durationMs: 0 }),
      makeToast("infinite", { durationMs: Number.POSITIVE_INFINITY }),
      makeToast("action", { action: { label: " ", onAction() {} } }),
      makeToast("action-accessibility", {
        action: { label: "Undo", accessibilityLabel: "", onAction() {} },
      }),
      makeToast("tone", { tone: "positive" as never }),
      makeToast("priority", { priority: "urgent" as never }),
    ];

    for (const descriptor of invalid) {
      expect(() => validateToastDescriptor(descriptor)).toThrow();
    }
  });

  it("applies the accessible timeout floor and persistent actionable default", () => {
    expect(resolveToastDuration(makeToast("default"))).toBe(5000);
    expect(resolveToastDuration(makeToast("clamped", { durationMs: 250 }))).toBe(5000);
    expect(resolveToastDuration(makeToast("long", { durationMs: 8000 }))).toBe(8000);
    expect(resolveToastDuration(makeToast("persistent", { durationMs: null }))).toBeNull();
    expect(
      resolveToastDuration(
        makeToast("action", { action: { label: "Undo", onAction() {} } }),
      ),
    ).toBeNull();
    expect(
      resolveToastDuration(
        makeToast("timed-action", {
          durationMs: 6000,
          action: { label: "Undo", onAction() {} },
        }),
      ),
    ).toBe(6000);
    expect(toastBehaviorDefaults.minimumDurationMs).toBe(5000);
    expect(toastBehaviorDefaults.maxVisible).toBe(1);
    expect(toastRecipe.defaults.durationMs).toBe(
      toastBehaviorDefaults.minimumDurationMs,
    );
    expect(toastRecipe.defaults.placement).toBe("bottom");
    expect(toastRecipe.placements.top.inlineEdge).toBe("center");
    expect(toastRecipe.placements.bottom.inlineEdge).toBe("center");
  });

  it("resolves tone, priority, action labels, and deterministic announcement copy", () => {
    const descriptor = makeToast("saved", {
      title: "Saved",
      description: "Your changes are available.",
      action: { label: "Undo", onAction() {} },
    });
    const resolved = resolveToastDescriptor(descriptor);
    expect(resolved.tone).toBe("neutral");
    expect(resolved.priority).toBe("normal");
    expect(resolved.announcement).toBe("Saved. Your changes are available.");
    expect(resolved.action?.accessibilityLabel).toBe("Undo");
    expect(resolved.action?.dismissOnAction).toBe(true);
    expect(resolveToastAnnouncement(descriptor)).toEqual({
      message: "Saved. Your changes are available.",
      priority: "normal",
    });
    expect(
      resolveToastAnnouncement(
        makeToast("failure", {
          tone: "danger",
          priority: "high",
          announcement: "Upload failed. Open uploads for details.",
        }),
      ),
    ).toEqual({
      message: "Upload failed. Open uploads for details.",
      priority: "high",
    });
  });
});

describe("Toast session lifecycle", () => {
  it("keeps subscription snapshots referentially stable until state changes", () => {
    const session = createToastSession(makeToast("session-snapshot"));
    const before = session.getSnapshot();
    expect(session.getSnapshot()).toBe(before);

    session.show();
    const visible = session.getSnapshot();
    expect(visible).not.toBe(before);
    expect(session.getSnapshot()).toBe(visible);
  });

  it("starts only when visible and supports nested pause and resume reasons", () => {
    const dismissed: string[] = [];
    const session = createToastSession(
      makeToast("timer", { onDismiss: (reason) => dismissed.push(reason) }),
    );

    expect(session.getSnapshot().timer).toMatchObject({
      status: "waiting",
      durationMs: 5000,
      remainingMs: 5000,
    });
    expect(session.advanceTime(10_000)).toBe(false);
    expect(session.getSnapshot().timer.remainingMs).toBe(5000);

    expect(session.show()).toBe(true);
    expect(session.show()).toBe(false);
    expect(session.advanceTime(2000)).toBe(true);
    expect(session.getSnapshot().timer.remainingMs).toBe(3000);
    expect(session.pause("pointer")).toBe(true);
    expect(session.pause("focus")).toBe(true);
    expect(session.advanceTime(5000)).toBe(false);
    expect(session.resume("pointer")).toBe(true);
    expect(session.getSnapshot().timer.status).toBe("paused");
    expect(session.resume("focus")).toBe(true);
    expect(session.getSnapshot().timer.status).toBe("running");

    expect(session.advanceTime(3000)).toBe(true);
    expect(session.getSnapshot()).toMatchObject({
      phase: "closing",
      dismissReason: "timeout",
    });
    expect(dismissed).toEqual([]);
    expect(session.dismiss("escape")).toBe(false);
    expect(session.completeExit()).toBe(true);
    expect(session.completeExit()).toBe(false);
    expect(dismissed).toEqual(["timeout"]);
  });

  it("invokes an action and its resulting dismiss exactly once", () => {
    const action = vi.fn();
    const dismiss = vi.fn();
    const session = createToastSession(
      makeToast("undo", {
        action: { label: "Undo", onAction: action },
        onDismiss: dismiss,
      }),
    );

    expect(session.getSnapshot().timer.status).toBe("persistent");
    expect(session.invokeAction()).toBe(false);
    session.show();
    expect(session.invokeAction()).toBe(true);
    expect(session.invokeAction()).toBe(false);
    expect(action).toHaveBeenCalledTimes(1);
    expect(session.getSnapshot().dismissReason).toBe("action");
    expect(dismiss).not.toHaveBeenCalled();
    expect(session.completeExit()).toBe(true);
    expect(session.completeExit()).toBe(false);
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(dismiss).toHaveBeenCalledWith("action");
  });

  it("supports non-closing one-shot actions and explicit programmatic close", () => {
    const action = vi.fn();
    const dismiss = vi.fn();
    const session = createToastSession(
      makeToast("background-action", {
        action: { label: "Refresh", dismissOnAction: false, onAction: action },
        onDismiss: dismiss,
      }),
    );
    session.show();
    expect(session.invokeAction()).toBe(true);
    expect(session.invokeAction()).toBe(false);
    expect(session.getSnapshot().phase).toBe("visible");
    expect(session.dismiss("programmatic")).toBe(true);
    expect(session.dismiss("programmatic")).toBe(false);
    expect(session.completeExit()).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(dismiss).toHaveBeenCalledWith("programmatic");
  });

  it("does not let a synchronous action close a newer stable-id revision", () => {
    let session!: ReturnType<typeof createToastSession>;
    const replacementAction = vi.fn();
    session = createToastSession(
      makeToast("replace-during-action", {
        action: {
          label: "Refresh",
          onAction() {
            session.update(
              makeToast("replace-during-action", {
                description: "New revision",
                action: { label: "Open", onAction: replacementAction },
              }),
              "restart",
            );
          },
        },
      }),
    );
    session.show();
    expect(session.invokeAction()).toBe(true);
    expect(session.getSnapshot()).toMatchObject({
      revision: 1,
      phase: "visible",
      actionInvoked: false,
      descriptor: { description: "New revision" },
    });
    expect(session.invokeAction()).toBe(true);
    expect(replacementAction).toHaveBeenCalledTimes(1);
  });

  it("updates a stable session with explicit preserve or restart timer policy", () => {
    const session = createToastSession(makeToast("progress", { durationMs: 7000 }));
    session.show();
    session.advanceTime(3000);
    expect(
      session.update(
        makeToast("progress", { description: "Halfway", durationMs: 7000 }),
        "preserve",
      ),
    ).toBe(true);
    expect(session.getSnapshot()).toMatchObject({
      revision: 1,
      descriptor: { description: "Halfway" },
      timer: { remainingMs: 4000 },
    });
    expect(
      session.update(
        makeToast("progress", { description: "Almost done", durationMs: 7000 }),
        "restart",
      ),
    ).toBe(true);
    expect(session.getSnapshot().timer.remainingMs).toBe(7000);
    expect(() => session.update(makeToast("different"))).toThrow(/stable id/);
  });

  it("interrupts queued, visible, or closing sessions once", () => {
    for (const phase of ["queued", "visible", "closing"] as const) {
      const dismiss = vi.fn();
      const session = createToastSession(makeToast(phase, { onDismiss: dismiss }));
      if (phase !== "queued") session.show();
      if (phase === "closing") session.dismiss("escape");
      expect(session.interrupt()).toBe(true);
      expect(session.interrupt()).toBe(false);
      expect(session.getSnapshot().dismissReason).toBe("interrupted");
      expect(dismiss).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalledWith("interrupted");
    }
  });

  it.each(["close-action", "escape", "swipe"] as const)(
    "settles an immediate reduced-motion %s exit exactly once",
    (reason) => {
      const dismiss = vi.fn();
      const session = createToastSession(makeToast(reason, { onDismiss: dismiss }));
      session.show();
      expect(session.dismiss(reason)).toBe(true);
      // A reduced-motion renderer may have no elapsed exit animation at all.
      expect(session.completeExit()).toBe(true);
      expect(session.completeExit()).toBe(false);
      expect(dismiss).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalledWith(reason);
    },
  );
});

describe("bounded FIFO Toast store", () => {
  it("keeps external-store snapshots stable until the queue changes", () => {
    const store = createToastStore();
    const empty = store.getSnapshot();
    expect(store.getSnapshot()).toBe(empty);

    store.publish(makeToast("store-snapshot"));
    const populated = store.getSnapshot();
    expect(populated).not.toBe(empty);
    expect(store.getSnapshot()).toBe(populated);

    store.pause("store-snapshot", "focus");
    const paused = store.getSnapshot();
    expect(paused).not.toBe(populated);
    expect(store.getSnapshot()).toBe(paused);
  });

  it("keeps visible slots through exit and promotes queued items in FIFO order", () => {
    const store = createToastStore({ maxVisible: 1, maxQueued: 3 });
    expect(store.publish(makeToast("a"))).toMatchObject({ position: "visible" });
    expect(store.publish(makeToast("b"))).toMatchObject({ position: "queued" });
    expect(store.publish(makeToast("c"))).toMatchObject({ position: "queued" });
    expect(store.getSnapshot().visible.map((entry) => entry.descriptor.id)).toEqual(["a"]);
    expect(store.getSnapshot().queued.map((entry) => entry.descriptor.id)).toEqual(["b", "c"]);

    store.advanceTime(5000);
    expect(store.getSnapshot().visible[0]).toMatchObject({
      phase: "closing",
      dismissReason: "timeout",
    });
    expect(store.getSnapshot().queued[0]?.timer.status).toBe("waiting");
    expect(store.getSnapshot().queued[0]?.timer.remainingMs).toBe(5000);
    expect(store.completeExit("a")).toBe(true);
    expect(store.getSnapshot().visible[0]).toMatchObject({
      phase: "visible",
      descriptor: { id: "b" },
      timer: { status: "running", remainingMs: 5000 },
    });
    expect(store.getSnapshot().queued.map((entry) => entry.descriptor.id)).toEqual(["c"]);
  });

  it("updates duplicate ids in place without reordering and preserves elapsed time", () => {
    const store = createToastStore({ maxVisible: 1, maxQueued: 2 });
    store.publish(makeToast("same", { durationMs: 7000 }));
    store.publish(makeToast("next"));
    store.advanceTime(2000);
    expect(
      store.publish(
        makeToast("same", { description: "Updated", durationMs: 7000 }),
      ),
    ).toEqual({ outcome: "updated", id: "same", position: "visible" });
    expect(store.getSnapshot().visible[0]).toMatchObject({
      revision: 1,
      descriptor: { description: "Updated" },
      timer: { remainingMs: 5000 },
    });
    expect(store.getSnapshot().queued[0]?.descriptor.id).toBe("next");
    expect(
      store.publish(makeToast("same"), { duplicatePolicy: "ignore" }),
    ).toEqual({ outcome: "ignored", id: "same", reason: "duplicate" });
  });

  it("bounds pending work and reports both overflow policies exactly once", () => {
    const oldestDismiss = vi.fn();
    const newestDismiss = vi.fn();
    const oldestStore = createToastStore({ maxVisible: 1, maxQueued: 1 });
    oldestStore.publish(makeToast("visible"));
    oldestStore.publish(makeToast("old", { onDismiss: oldestDismiss }));
    oldestStore.publish(makeToast("new"));
    expect(oldestDismiss).toHaveBeenCalledTimes(1);
    expect(oldestDismiss).toHaveBeenCalledWith("queue-overflow");
    expect(oldestStore.getSnapshot().queued[0]?.descriptor.id).toBe("new");

    const newestStore = createToastStore({
      maxVisible: 1,
      maxQueued: 1,
      overflowPolicy: "discard-newest",
    });
    newestStore.publish(makeToast("visible"));
    newestStore.publish(makeToast("old"));
    expect(
      newestStore.publish(makeToast("new", { onDismiss: newestDismiss })),
    ).toEqual({ outcome: "discarded", id: "new", reason: "queue-overflow" });
    expect(newestDismiss).toHaveBeenCalledTimes(1);
    expect(newestStore.getSnapshot().queued[0]?.descriptor.id).toBe("old");
  });

  it("reserves an overflow replacement before reentrant dismiss callbacks", () => {
    const store = createToastStore({ maxVisible: 1, maxQueued: 1 });
    store.publish(makeToast("visible", { durationMs: null }));
    store.publish(
      makeToast("old", {
        onDismiss() {
          store.publish(makeToast("reentrant"));
        },
      }),
    );
    expect(store.publish(makeToast("incoming"))).toEqual({
      outcome: "added",
      id: "incoming",
      position: "queued",
    });
    expect(store.getSnapshot().queued).toHaveLength(1);
    expect(store.getSnapshot().queued[0]?.descriptor.id).toBe("incoming");
  });

  it("does not leave an incoming overflow session behind after reentrant disposal", () => {
    const store = createToastStore({ maxVisible: 1, maxQueued: 1 });
    store.publish(makeToast("visible", { durationMs: null }));
    store.publish(
      makeToast("old", {
        onDismiss() {
          store.dispose();
        },
      }),
    );
    expect(() => store.publish(makeToast("incoming"))).toThrow(/disposed/);
    expect(store.getSnapshot()).toEqual({ visible: [], queued: [] });
    expect(() => store.publish(makeToast("ghost"))).toThrow(/disposed/);
  });

  it("notifies subscribers when an overflow dismiss callback throws", () => {
    const store = createToastStore({ maxVisible: 1, maxQueued: 1 });
    const listener = vi.fn();
    store.publish(makeToast("visible", { durationMs: null }));
    store.publish(
      makeToast("old", {
        onDismiss() {
          throw new Error("dismiss failed");
        },
      }),
    );
    const unsubscribe = store.subscribe(listener);
    expect(() => store.publish(makeToast("incoming"))).toThrow("dismiss failed");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().queued).toEqual([]);
    unsubscribe();
  });

  it("carries global pause state into later FIFO promotions", () => {
    const store = createToastStore({ maxVisible: 1, maxQueued: 1 });
    store.publish(makeToast("first", { durationMs: null }));
    store.publish(makeToast("second"));
    expect(store.pauseAll("window")).toBe(1);
    expect(store.close("first")).toBe(true);
    expect(store.completeExit("first")).toBe(true);
    expect(store.getSnapshot().visible[0]).toMatchObject({
      descriptor: { id: "second" },
      timer: { status: "paused", remainingMs: 5000 },
    });
    expect(store.advanceTime(5000)).toBe(0);
    expect(store.resumeAll("window")).toBe(1);
    expect(store.advanceTime(5000)).toBe(1);
    expect(store.getSnapshot().visible[0]?.dismissReason).toBe("timeout");
  });

  it("does not charge an elapsed interval to an item promoted during that tick", () => {
    const store = createToastStore({ maxVisible: 1, maxQueued: 1 });
    store.publish(makeToast("first"));
    store.publish(makeToast("second"));
    const unsubscribe = store.subscribe(() => {
      const current = store.getSnapshot().visible[0];
      if (current?.descriptor.id === "first" && current.phase === "closing") {
        store.completeExit("first");
      }
    });
    expect(store.advanceTime(5000)).toBe(1);
    unsubscribe();
    expect(store.getSnapshot().visible[0]).toMatchObject({
      descriptor: { id: "second" },
      timer: { status: "running", remainingMs: 5000 },
    });
  });

  it("supports programmatic close and provider teardown without duplicate dismissal", () => {
    const firstDismiss = vi.fn();
    const secondDismiss = vi.fn();
    const store = createToastStore({ maxVisible: 1, maxQueued: 1 });
    store.publish(makeToast("first", { durationMs: null, onDismiss: firstDismiss }));
    store.publish(makeToast("second", { durationMs: null, onDismiss: secondDismiss }));
    expect(store.close("first")).toBe(true);
    expect(store.close("first")).toBe(false);
    expect(firstDismiss).not.toHaveBeenCalled();
    expect(store.completeExit("first")).toBe(true);
    expect(firstDismiss).toHaveBeenCalledTimes(1);
    expect(firstDismiss).toHaveBeenCalledWith("programmatic");
    expect(store.dispose()).toBe(true);
    expect(store.dispose()).toBe(false);
    expect(secondDismiss).toHaveBeenCalledTimes(1);
    expect(secondDismiss).toHaveBeenCalledWith("interrupted");
    expect(store.getSnapshot()).toEqual({ visible: [], queued: [] });
    expect(() => store.publish(makeToast("after-dispose"))).toThrow(/disposed/);
  });
});

describe("Toast visual and behavior identity", () => {
  it("links the recipe and behavior explicitly in the catalog", () => {
    expect(componentCatalog.find((entry) => entry.name === "Toast")).toMatchObject({
      platform: "adaptive",
      status: "beta",
      recipe: "toastRecipe",
      behavior: "toast",
    });
    expect(behaviorRegistry.toast.defaults).toBe(toastBehaviorDefaults);
    expect(behaviorRegistry.toast.defaults.maxVisible).toBe(1);
    expect(toastRecipe.defaults.durationMs).toBe(
      behaviorRegistry.toast.defaults.minimumDurationMs,
    );
    expect(behaviorRegistry.toast.scenarios).toContain(
      "queued-time-never-consumes-auto-dismiss-duration",
    );
    expect(behaviorRegistry.toast.scenarios).toContain(
      "web-hotkey-focuses-the-labelled-viewport-and-last-close-restores-focus",
    );
  });

  it("uses unique non-color marks for every tone", () => {
    const marks = Object.values(toastRecipe.tones).map((tone) => tone.mark);
    expect(new Set(marks).size).toBe(marks.length);
    expect(marks).toEqual([
      "notifications",
      "info",
      "success",
      "warning",
      "alert",
    ]);
  });

  it("keeps text, actions, marks, and boundary contrast in both themes", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const background = resolveColorReference(toastRecipe.surface.background, palette);
      for (const reference of [
        toastRecipe.title.color,
        toastRecipe.description.color,
        toastRecipe.action.color,
        toastRecipe.close.color,
      ]) {
        expect(contrast(resolveColorReference(reference, palette), background)).toBeGreaterThanOrEqual(4.5);
      }
      expect(
        contrast(resolveColorReference(toastRecipe.surface.border, palette), background),
      ).toBeGreaterThanOrEqual(3);
      for (const tone of Object.values(toastRecipe.tones)) {
        expect(
          contrast(resolveColorReference(tone.accent, palette), background),
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("defines adaptive placement, touch targets, and reduced-motion exits", () => {
    expect(Object.keys(toastRecipe.placements)).toEqual([
      "top",
      "top-start",
      "top-end",
      "bottom",
      "bottom-start",
      "bottom-end",
    ]);
    expect(toastRecipe.adaptive).toEqual({
      web: "fixed-viewport",
      native: "safe-area-overlay",
    });
    expect(toastRecipe.action.minHeight).toBeGreaterThanOrEqual(control.minTouchTarget);
    expect(toastRecipe.close.diameter).toBeGreaterThanOrEqual(control.minTouchTarget);
    for (const platform of Object.values(toastRecipe.transition)) {
      expect(["instant", "opacity"]).toContain(platform.enter.reducedMotion);
      expect(["instant", "opacity"]).toContain(platform.exit.reducedMotion);
    }
  });
});
