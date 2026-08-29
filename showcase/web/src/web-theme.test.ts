import { describe, expect, it } from "vitest";

import {
  THEMES,
  control,
  fontFamily,
  fontWeight,
  heading,
  letterSpacing,
  motion,
  numeric,
  radius,
  resolveDesignSystemProviderValue,
  spacing,
  typography,
} from "@hjmds/design-contracts";
import { createWebThemeStyle } from "./runtime/web-theme";

describe("Showcase Web theme adapter", () => {
  it("exposes canonical colors and foundation scales as CSS variables", () => {
    const style = createWebThemeStyle(
      resolveDesignSystemProviderValue(
        { direction: "ltr", reducedMotion: false, textScale: 1, theme: "light" },
        { systemTheme: "light" },
      ),
    );
    expect(style["--hjm-primary"]).toBe(THEMES.light.primary);
    expect(style["--hjm-space-md"]).toBe(`${spacing.md}px`);
    expect(style["--hjm-radius-lg"]).toBe(`${radius.lg}px`);
    expect(style["--hjm-type-body-size-base"]).toBe("0.875rem");
    expect(style["--hjm-type-body-size"]).toBe(
      "calc(0.875rem * var(--hjm-text-scale))",
    );
    expect(style["--hjm-font-family-ui"]).toBe(fontFamily.ui.join(", "));
    expect(style["--hjm-font-weight-bold"]).toBe(fontWeight.bold);
    expect(style["--hjm-letter-spacing-tight-base"]).toBe("-0.0125rem");
    expect(style["--hjm-numeric-tabular"]).toBe(numeric.tabular);
    expect(style["--hjm-heading-level1-size-base"]).toBe("2.5rem");
    expect(style["--hjm-control-min-touch-target"]).toBe(`${control.minTouchTarget}px`);
    expect(style["--hjm-motion-normal"]).toBe(`${motion.normal}ms`);
    expect(style["--hjm-motion-strategy-instant-duration"]).toBe(`${motion.fast}ms`);
    expect(style["--hjm-motion-strategy-static-play-state"]).toBe("running");
    expect(style["--hjm-shadow-overlay"]).toContain("rgba(");
  });

  it("resolves dark theme and effective reduced-motion durations", () => {
    const style = createWebThemeStyle(
      resolveDesignSystemProviderValue(
        { direction: "rtl", reducedMotion: true, textScale: 2, theme: "dark" },
        { systemTheme: "light" },
      ),
    );
    expect(style["--hjm-bg"]).toBe(THEMES.dark.bg);
    expect(style["--hjm-text-scale"]).toBe(2);
    expect(style["--hjm-motion-scale"]).toBe(0);
    expect(style["--hjm-motion-preset-micro-effective-duration"]).toBe("0ms");
    expect(style["--hjm-motion-preset-enter-effective-duration"]).toBe(
      `${motion.normal}ms`,
    );
    expect(style["--hjm-motion-preset-context-effective-duration"]).toBe(
      `${motion.slow}ms`,
    );
    expect(style["--hjm-motion-strategy-instant-duration"]).toBe("0ms");
    expect(style["--hjm-motion-strategy-opacity-duration"]).toBe(`${motion.normal}ms`);
    expect(style["--hjm-motion-strategy-static-play-state"]).toBe("paused");
    expect(style["--hjm-type-body-size"]).toBe(
      "calc(0.875rem * var(--hjm-text-scale))",
    );
    expect(style["--hjm-space-md"]).toBe(`${spacing.md}px`);
    expect(style["--hjm-control-min-touch-target"]).toBe(`${control.minTouchTarget}px`);
  });
});
