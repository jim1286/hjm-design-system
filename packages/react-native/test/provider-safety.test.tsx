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
