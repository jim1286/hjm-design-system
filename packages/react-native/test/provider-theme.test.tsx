import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import * as ReactNative from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HjmNativeProvider, useHjmNativeTheme, type HjmNativeTheme } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

let renderer: ReactTestRenderer | undefined;
const originalPlatform = ReactNative.Platform.OS;

function Probe({ onRender }: { onRender: (value: HjmNativeTheme) => void }) {
  onRender(useHjmNativeTheme());
  return null;
}

afterEach(() => {
  if (renderer) act(() => renderer!.unmount());
  renderer = undefined;
  ReactNative.Platform.OS = originalPlatform;
  vi.restoreAllMocks();
});

describe("native provider theme precedence", () => {
  it.each(["ios", "android"] as const)("uses %s dark mode on the first native render and follows changes", (platform) => {
    ReactNative.Platform.OS = platform;
    const scheme = vi.spyOn(ReactNative, "useColorScheme").mockReturnValue("dark");
    const renders: HjmNativeTheme[] = [];
    const onRender = (value: HjmNativeTheme) => { renders.push(value); };
    act(() => {
      renderer = create(<HjmNativeProvider reducedMotion><Probe onRender={onRender} /></HjmNativeProvider>);
    });
    expect(renders[0]!.environment.theme).toBe("dark");
    expect(renders.at(-1)!.textScaling.mode).toBe("native");
    scheme.mockReturnValue("light");
    act(() => {
      renderer!.update(<HjmNativeProvider reducedMotion><Probe onRender={onRender} /></HjmNativeProvider>);
    });
    expect(renders.at(-1)!.environment.theme).toBe("light");
  });

  it("keeps explicit and inherited environments above the system preference", () => {
    vi.spyOn(ReactNative, "useColorScheme").mockReturnValue("dark");
    const renders: HjmNativeTheme[] = [];
    act(() => {
      renderer = create(
        <HjmNativeProvider theme="light" direction="rtl" textScale={1.5} reducedMotion minimumVisualTarget>
          <HjmNativeProvider><Probe onRender={(value) => renders.push(value)} /></HjmNativeProvider>
        </HjmNativeProvider>,
      );
    });
    expect(renders[0]!.environment).toMatchObject({
      theme: "light", direction: "rtl", textScale: 1.5, reducedMotion: true, minimumVisualTarget: true,
    });
    expect(renders[0]!.textScaling).toEqual({ mode: "controlled", scale: 1.5 });
  });

  it("preserves a supplied environment and palette", () => {
    vi.spyOn(ReactNative, "useColorScheme").mockReturnValue("light");
    const value = resolveDesignSystemProviderValue({ theme: "dark", textScale: 1.5 }, { systemTheme: "light" });
    const renders: HjmNativeTheme[] = [];
    act(() => {
      renderer = create(<HjmNativeProvider value={value}><Probe onRender={(theme) => renders.push(theme)} /></HjmNativeProvider>);
    });
    expect(renders[0]!.environment).toBe(value.environment);
    expect(renders[0]!.palette).toBe(value.palette);
    expect(renders[0]!.colors).toBe(value.palette.theme);
    expect(renders[0]!.textScaling).toEqual({ mode: "controlled", scale: 1.5 });
  });
});

describe("brandPalette prop", () => {
  it("merges the brand over the defaults, follows the theme and reaches nested providers", async () => {
    const { resolveDesignSystemProviderValue } = await import("@hjmds/design-contracts/components/design-system-provider");
    const { HjmNativeProvider: Provider, useHjmNativeTheme: useTheme } = await import("../src/index.js");
    const { act: actRender, create: createRenderer } = await import("react-test-renderer");
    const seen: string[] = [];
    function Probe() {
      seen.push(useTheme().palette.theme.primary);
      return null;
    }
    const brand = { light: { primary: "#123456" }, dark: { primary: "#abcdef" } } as const;
    for (const theme of ["light", "dark"] as const) {
      let renderer: ReturnType<typeof createRenderer> | undefined;
      actRender(() => {
        renderer = createRenderer(
          <Provider theme={theme} brandPalette={brand}>
            <Probe />
            <Provider textScale={1.3}><Probe /></Provider>
          </Provider>,
        );
      });
      actRender(() => { renderer?.unmount(); });
    }
    expect(seen).toEqual(["#123456", "#123456", "#abcdef", "#abcdef"]);
    const defaults = resolveDesignSystemProviderValue({ theme: "light" }, { systemTheme: "light" });
    expect(defaults.palette.theme.primary).not.toBe("#123456");
  });
});
