import { describe, expect, it } from "vitest";

import {
  designSystemEnvironmentDefaults,
  resolveDesignSystemEnvironment,
  validateDesignSystemEnvironmentInput,
} from "../src/design-system-provider.js";

describe("DesignSystemEnvironment validation", () => {
  it("accepts a fully-specified input", () => {
    expect(() =>
      validateDesignSystemEnvironmentInput({
        theme: "dark",
        direction: "rtl",
        textScale: 1.5,
        reducedMotion: true,
      }),
    ).not.toThrow();
  });

  it("accepts an empty input — every field is optional until resolved", () => {
    expect(() => validateDesignSystemEnvironmentInput({})).not.toThrow();
  });

  it("rejects an unsupported theme, including a bare light/dark typo", () => {
    expect(() => validateDesignSystemEnvironmentInput({ theme: "auto" as never })).toThrow(
      /theme/,
    );
  });

  it("rejects an unsupported direction", () => {
    expect(() =>
      validateDesignSystemEnvironmentInput({ direction: "top" as never }),
    ).toThrow(/direction/);
  });

  it("rejects a non-positive or non-finite textScale", () => {
    expect(() => validateDesignSystemEnvironmentInput({ textScale: 0 })).toThrow(
      /textScale/,
    );
    expect(() => validateDesignSystemEnvironmentInput({ textScale: -1 })).toThrow(
      /textScale/,
    );
    expect(() =>
      validateDesignSystemEnvironmentInput({ textScale: Number.POSITIVE_INFINITY }),
    ).toThrow(/textScale/);
    expect(() => validateDesignSystemEnvironmentInput({ textScale: 2.35 })).not.toThrow();
  });

  it("rejects a non-boolean reducedMotion", () => {
    expect(() =>
      validateDesignSystemEnvironmentInput({ reducedMotion: "true" as never }),
    ).toThrow(/reducedMotion/);
  });
});

describe("DesignSystemEnvironment resolution", () => {
  it("fills every missing field with the documented defaults", () => {
    expect(resolveDesignSystemEnvironment({}, { systemTheme: "light" })).toEqual({
      theme: "light",
      direction: "ltr",
      textScale: 1,
      reducedMotion: false,
    });
    expect(designSystemEnvironmentDefaults.theme).toBe("system");
  });

  it("resolves an explicit theme without consulting systemTheme", () => {
    expect(
      resolveDesignSystemEnvironment({ theme: "dark" }, { systemTheme: "light" }),
    ).toMatchObject({ theme: "dark" });
  });

  it("falls back to the renderer-supplied systemTheme only when theme is \"system\" or absent", () => {
    expect(
      resolveDesignSystemEnvironment({ theme: "system" }, { systemTheme: "dark" }),
    ).toMatchObject({ theme: "dark" });
    expect(resolveDesignSystemEnvironment({}, { systemTheme: "dark" })).toMatchObject({
      theme: "dark",
    });
  });

  it("preserves a continuous textScale rather than snapping to a fixed set", () => {
    expect(
      resolveDesignSystemEnvironment({ textScale: 1.34 }, { systemTheme: "light" }),
    ).toMatchObject({ textScale: 1.34 });
  });

  it("rejects a malformed input before resolving", () => {
    expect(() =>
      resolveDesignSystemEnvironment({ textScale: -5 }, { systemTheme: "light" }),
    ).toThrow(/textScale/);
  });

  it("rejects an unsupported systemTheme", () => {
    expect(() =>
      resolveDesignSystemEnvironment({}, { systemTheme: "system" as never }),
    ).toThrow(/systemTheme/);
  });
});
