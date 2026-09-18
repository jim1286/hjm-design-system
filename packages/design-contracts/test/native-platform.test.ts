import { describe, expect, it } from "vitest";
import { behaviorRegistry } from "../src/behaviors.js";
import {
  hapticIntents,
  keyboardAvoidanceDefaults,
  nativePlatformBehavior,
  resolveKeyboardAvoidanceBehavior,
  resolveKeyboardInset,
  shouldPlayHaptic,
} from "../src/native-platform.js";

describe("keyboard avoidance", () => {
  it("picks the behavior each platform actually needs", () => {
    expect(resolveKeyboardAvoidanceBehavior("ios")).toBe("padding");
    expect(resolveKeyboardAvoidanceBehavior("android")).toBe("height");
  });

  it("counts the safe area once instead of stacking it on the keyboard", () => {
    const safeAreaBottom = 34;
    const closed = resolveKeyboardInset(0, { safeAreaBottom });
    expect(closed).toBe(safeAreaBottom);
    const open = resolveKeyboardInset(300, { safeAreaBottom, offset: 12 });
    // 300 + 12 total, not 300 + 12 + 34: the keyboard already covers the inset.
    expect(open).toBe(312);
  });

  it("uses the shared spacing default and rejects impossible heights", () => {
    expect(keyboardAvoidanceDefaults.offset).toBeGreaterThan(0);
    expect(resolveKeyboardInset(100)).toBe(100 + keyboardAvoidanceDefaults.offset);
    expect(() => resolveKeyboardInset(-1)).toThrow(RangeError);
  });
});

describe("haptics", () => {
  it("names intents by meaning, not by strength", () => {
    expect([...hapticIntents]).toEqual(["selection", "success", "warning", "error"]);
  });

  it("stays silent when the user did not start it or turned haptics off", () => {
    expect(shouldPlayHaptic({ userInitiated: true, hapticsEnabled: true })).toBe(true);
    expect(shouldPlayHaptic({ userInitiated: false, hapticsEnabled: true })).toBe(false);
    expect(shouldPlayHaptic({ userInitiated: true, hapticsEnabled: false })).toBe(false);
  });

  it("does not let reduced motion silence haptics", () => {
    // Different settings: someone who turned motion off may rely on touch.
    expect(shouldPlayHaptic({ userInitiated: true, hapticsEnabled: true, reducedMotion: true })).toBe(true);
  });

  it("is registered as a behavior and claims no web surface", () => {
    expect(behaviorRegistry.nativePlatform).toBe(nativePlatformBehavior);
    expect(nativePlatformBehavior.web.roles).toEqual([]);
  });
});
