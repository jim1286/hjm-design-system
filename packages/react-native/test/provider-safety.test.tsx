import { type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HjmNativeProvider, useHjmNativeTheme } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function Probe(): ReactNode {
  const { environment } = useHjmNativeTheme();
  return (
    <View
      testID="motion-preference"
      accessibilityLabel={environment.reducedMotion ? "reduce" : "animate"}
    />
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HjmNativeProvider safety defaults", () => {
  it("keeps a live motion preference when the initial snapshot resolves later", async () => {
    let resolvePreference!: (value: boolean) => void;
    let changePreference!: (value: boolean) => void;
    vi.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(
      new Promise<boolean>((resolve) => { resolvePreference = resolve; }),
    );
    // The host mock needs only the boolean event and remove handle used by Provider.
    vi.spyOn(AccessibilityInfo, "addEventListener").mockImplementation(((event: string, listener: (value: boolean) => void) => {
      if (event === "reduceMotionChanged") changePreference = listener;
      return { remove: vi.fn() };
    }) as unknown as typeof AccessibilityInfo.addEventListener);
    let renderer!: ReactTestRenderer;
    act(() => { renderer = create(<HjmNativeProvider><Probe /></HjmNativeProvider>); });
    act(() => { changePreference(true); });
    await act(async () => { resolvePreference(false); await Promise.resolve(); });
    expect(renderer.root.findByProps({ testID: "motion-preference" }).props.accessibilityLabel).toBe("reduce");
    act(() => renderer.unmount());
  });

  it("retains the safe default when reading the OS motion preference fails", async () => {
    vi.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockRejectedValue(new Error("host unavailable"));
    let renderer!: ReactTestRenderer;
    await act(async () => { renderer = create(<HjmNativeProvider><Probe /></HjmNativeProvider>); });
    expect(renderer.root.findByProps({ testID: "motion-preference" }).props.accessibilityLabel).toBe("reduce");
    act(() => renderer.unmount());
  });

  it("suppresses first-frame animation until the async OS preference resolves", async () => {
    let resolvePreference!: (value: boolean) => void;
    vi.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolvePreference = resolve;
      }),
    );
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <HjmNativeProvider theme="light">
          <Probe />
        </HjmNativeProvider>,
      );
    });
    expect(renderer!.root.findByProps({ testID: "motion-preference" }).props.accessibilityLabel)
      .toBe("reduce");

    await act(async () => {
      resolvePreference(false);
      await Promise.resolve();
    });
    expect(renderer!.root.findByProps({ testID: "motion-preference" }).props.accessibilityLabel)
      .toBe("animate");
    act(() => renderer!.unmount());
  });
});
