import { readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import * as forms from "../src/forms-public.js";
import * as root from "../src/index.js";
import { HjmProvider } from "../src/provider.js";
import { Slider } from "../src/slider.js";

describe("Slider server rendering", () => {
  it("is public from the root, forms family, and dedicated package subpath", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as { exports: Record<string, unknown> };
    expect(root.Slider).toBe(Slider);
    expect(forms.Slider).toBe(Slider);
    expect(packageJson.exports["./slider"]).toMatchObject({
      types: "./dist/slider.d.ts",
      import: "./dist/slider.js",
      default: "./dist/slider.js",
    });
  });

  it("renders native range semantics, product value text, and one 44px interaction layer", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider direction="rtl" systemTheme="light">
        <Slider
          defaultValue={0.35}
          getValueText={(value) => `${Math.round(value * 100)}퍼센트`}
          label="강도"
          max={1}
          min={0}
          name="intensity"
          step={0.05}
        />
      </HjmProvider>,
    );

    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain('type="range"');
    expect(markup).toContain('name="intensity"');
    expect(markup).toContain('min="0"');
    expect(markup).toContain('max="1"');
    expect(markup).toContain('step="any"');
    expect(markup).toContain('value="0.35"');
    expect(markup).toContain('aria-orientation="horizontal"');
    expect(markup).toContain('aria-valuenow="0.35"');
    expect(markup).toContain('aria-valuetext="35퍼센트"');
    expect(markup).toContain(">35퍼센트</output>");
    expect(markup).toContain("--hjm-slider-fill:35%");
    expect(markup.match(/type="range"/g)).toHaveLength(1);
  });

  it("starts at min when neither controlled value nor defaultValue is supplied", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Slider label="점수" max={10} min={3} step={2} />
      </HjmProvider>,
    );
    expect(markup).toContain('value="3"');
    expect(markup).toContain('aria-valuenow="3"');
    expect(markup).toContain("--hjm-slider-fill:0%");
  });
});
