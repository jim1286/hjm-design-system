import { readFile } from "node:fs/promises";
import { URL, fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import * as forms from "../src/forms-public.js";
import * as root from "../src/index.js";
import { HjmProvider } from "../src/provider.js";
import { NumberField } from "../src/number-field.js";

describe("NumberField server rendering", () => {
  it("is available from the root, forms family, and dedicated package subpath", async () => {
    const packageJson = JSON.parse(
      await readFile(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as { exports: Record<string, unknown> };
    expect(root.NumberField).toBe(NumberField);
    expect(forms.NumberField).toBe(NumberField);
    expect(packageJson.exports["./number-field"]).toMatchObject({
      types: "./dist/number-field.d.ts",
      import: "./dist/number-field.js",
      default: "./dist/number-field.js",
    });
  });

  it("renders one spinbutton tab stop with named auxiliary steppers", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <NumberField
          decrementLabel="인원 줄이기"
          description="1명에서 8명"
          getValueText={(value) => `${value}명`}
          incrementLabel="인원 늘리기"
          label="인원"
          max={8}
          min={1}
          step={1}
          defaultValue={3}
        />
      </HjmProvider>,
    );

    expect(markup).toContain('role="spinbutton"');
    expect(markup).toContain('aria-valuemin="1"');
    expect(markup).toContain('aria-valuemax="8"');
    expect(markup).toContain('aria-valuenow="3"');
    expect(markup).toContain('aria-valuetext="3명"');
    expect(markup).toContain('aria-label="인원 줄이기"');
    expect(markup).toContain('aria-label="인원 늘리기"');
    expect(markup.match(/tabindex="-1"/g)).toHaveLength(2);
    expect(markup).not.toMatch(/\s(?:min|max|step)="/);
  });

  it("exposes nullable and read-only states without inventing a numeric value", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <NumberField
          decrementLabel="감소"
          incrementLabel="증가"
          label="수량"
          max={10}
          min={0}
          readOnly
        />
      </HjmProvider>,
    );
    expect(markup).toContain('data-availability="readOnly"');
    expect(markup).toContain('data-value="empty"');
    expect(markup).not.toContain("aria-valuenow");
    expect(markup.match(/disabled=""/g)).toHaveLength(2);
    expect(markup).toContain('readOnly=""');
  });
});
