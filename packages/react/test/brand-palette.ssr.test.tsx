import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HjmProvider } from "../src/index.js";
import { useHjmTheme } from "../src/provider.js";

/**
 * brandPalette is the supported brand route (docs/brand-boundary.md). Before
 * 1.5.0 products had to hand-build a full `value`, which stopped the provider
 * from following the OS theme; nested providers must keep the product brand.
 */
describe("HjmProvider brandPalette", () => {
  it("preserves a resolved palette through a value bridge and an ordinary nested provider", () => {
    function Bridge() {
      const value = useHjmTheme();
      return <HjmProvider value={value}><HjmProvider density="compact">nested</HjmProvider></HjmProvider>;
    }
    const html = renderToStaticMarkup(
      <HjmProvider theme="light" brandPalette={{ light: { primary: "#123456" } }}><Bridge /></HjmProvider>,
    );
    expect(html.match(/--hjm-color-primary:#123456/g)).toHaveLength(3);
  });
  it("merges the brand for the resolved theme and keeps it in nested providers", () => {
    const brand = { light: { primary: "#123456" }, dark: { primary: "#abcdef" } } as const;
    const light = renderToStaticMarkup(
      <HjmProvider systemTheme="light" brandPalette={brand}>
        <HjmProvider density="compact">nested</HjmProvider>
      </HjmProvider>,
    );
    expect(light.match(/--hjm-color-primary:#123456/g)).toHaveLength(2);
    const dark = renderToStaticMarkup(<HjmProvider systemTheme="dark" brandPalette={brand}>x</HjmProvider>);
    expect(dark).toContain("--hjm-color-primary:#abcdef");
  });
});
