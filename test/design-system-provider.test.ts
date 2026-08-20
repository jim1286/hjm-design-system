import { describe, expect, expectTypeOf, it } from "vitest";

import {
  designSystemEnvironmentDefaults,
  resolveDesignSystemEnvironment,
  resolveDesignSystemProviderValue,
  validateDesignSystemEnvironmentInput,
  validateResolvedDesignSystemEnvironment,
  type DesignSystemDirection,
} from "../src/design-system-provider.js";
import { ACCENTS, THEMES, accentFill } from "../src/colors.js";
import { componentCatalog } from "../src/catalog.js";
import type { BottomNavigationDirection } from "../src/bottom-navigation.js";
import type { IconDirection } from "../src/icon.js";
import type { SelectionDirection, TabsDirection } from "../src/behaviors.js";
import type { ShowcaseDirection } from "../src/showcase.js";

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

  it("validates resolved parents with a stricter invariant than partial input", () => {
    const resolved = {
      theme: "dark",
      direction: "rtl",
      textScale: 1.5,
      reducedMotion: true,
    } as const;
    expect(() => validateResolvedDesignSystemEnvironment(resolved)).not.toThrow();

    expect(() =>
      validateResolvedDesignSystemEnvironment({
        ...resolved,
        theme: "system",
      } as never),
    ).toThrow(/ResolvedDesignSystemEnvironment theme/);
    expect(() =>
      validateResolvedDesignSystemEnvironment({
        ...resolved,
        direction: "sideways",
      } as never),
    ).toThrow(/parent direction/);
    expect(() =>
      validateResolvedDesignSystemEnvironment({ ...resolved, textScale: 0 }),
    ).toThrow(/parent textScale/);
    expect(() =>
      validateResolvedDesignSystemEnvironment({
        ...resolved,
        reducedMotion: "true",
      } as never),
    ).toThrow(/parent reducedMotion/);
    expect(() =>
      validateResolvedDesignSystemEnvironment({
        theme: "light",
        direction: "ltr",
        textScale: 1,
      } as never),
    ).toThrow(/parent reducedMotion/);
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

  it("uses input, parent, system signals, and defaults in that order", () => {
    const parent = resolveDesignSystemEnvironment(
      { theme: "dark", direction: "rtl", textScale: 1.5, reducedMotion: true },
      { systemTheme: "light" },
    );
    expect(
      resolveDesignSystemEnvironment(
        { direction: "ltr" },
        {
          systemTheme: "light",
          systemDirection: "rtl",
          systemTextScale: 2,
          systemReducedMotion: false,
          parent,
        },
      ),
    ).toEqual({
      theme: "dark",
      direction: "ltr",
      textScale: 1.5,
      reducedMotion: true,
    });

    expect(
      resolveDesignSystemEnvironment(
        { theme: "light", textScale: 2, reducedMotion: false },
        { systemTheme: "dark", parent },
      ),
    ).toEqual({
      theme: "light",
      direction: "rtl",
      textScale: 2,
      reducedMotion: false,
    });

    expect(
      resolveDesignSystemEnvironment(
        {},
        {
          systemTheme: "dark",
          systemDirection: "rtl",
          systemTextScale: 1.25,
          systemReducedMotion: true,
        },
      ),
    ).toEqual({
      theme: "dark",
      direction: "rtl",
      textScale: 1.25,
      reducedMotion: true,
    });
  });

  it("lets an explicit system theme escape an inherited theme", () => {
    const parent = resolveDesignSystemEnvironment(
      { theme: "dark" },
      { systemTheme: "dark" },
    );
    expect(
      resolveDesignSystemEnvironment(
        { theme: "system" },
        { systemTheme: "light", parent },
      ).theme,
    ).toBe("light");
  });

  it("rejects an unresolved parent instead of resolving it a second time", () => {
    expect(() =>
      resolveDesignSystemEnvironment(
        {},
        {
          systemTheme: "light",
          parent: {
            theme: "system",
            direction: "ltr",
            textScale: 1,
            reducedMotion: false,
          } as never,
        },
      ),
    ).toThrow(/ResolvedDesignSystemEnvironment theme/);
  });

  it("validates optional renderer system signals", () => {
    expect(() =>
      resolveDesignSystemEnvironment(
        {},
        { systemTheme: "light", systemDirection: "sideways" as never },
      ),
    ).toThrow(/systemDirection/);
    expect(() =>
      resolveDesignSystemEnvironment(
        {},
        { systemTheme: "light", systemTextScale: 0 },
      ),
    ).toThrow(/systemTextScale/);
    expect(() =>
      resolveDesignSystemEnvironment(
        {},
        { systemTheme: "light", systemReducedMotion: "true" as never },
      ),
    ).toThrow(/systemReducedMotion/);
  });

  it("binds the resolved theme to the canonical color-reference palette", () => {
    const value = resolveDesignSystemProviderValue(
      { theme: "dark", direction: "rtl" },
      { systemTheme: "light" },
    );
    expect(value.environment).toMatchObject({ theme: "dark", direction: "rtl" });
    expect(value.palette.theme).toBe(THEMES.dark);
    expect(value.palette.statusAccents).toBe(ACCENTS.dark);
    expect(value.palette.statusAccentFills).toBe(accentFill);
  });
});

describe("canonical direction aliases", () => {
  it("keeps existing public direction names source-compatible", () => {
    expectTypeOf<BottomNavigationDirection>().toEqualTypeOf<DesignSystemDirection>();
    expectTypeOf<IconDirection>().toEqualTypeOf<DesignSystemDirection>();
    expectTypeOf<SelectionDirection>().toEqualTypeOf<DesignSystemDirection>();
    expectTypeOf<TabsDirection>().toEqualTypeOf<DesignSystemDirection>();
    expectTypeOf<ShowcaseDirection>().toEqualTypeOf<DesignSystemDirection>();
  });
});

describe("DesignSystemProvider maturity", () => {
  it("is beta after real Web and Native adapters consume the provider value", () => {
    expect(
      componentCatalog.find(({ name }) => name === "DesignSystemProvider"),
    ).toMatchObject({
      platform: "shared",
      status: "beta",
      nonVisualEvidence: "provider-adapter",
      roadmap: {
        state: "evidence-needed",
        summary: expect.stringMatching(/두 실제 제품.*Web\/RN.*environment\+palette/),
      },
    });
  });
});
