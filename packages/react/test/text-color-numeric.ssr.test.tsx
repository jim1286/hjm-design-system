import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Text } from "../src/layout.js";

describe("Text product color and numeric spacing", () => {
  it("applies a product color role and tabular digits without changing variant or tone metadata", () => {
    const markup = renderToStaticMarkup(<Text variant="title" tone="muted" color="#c8102e" numeric="tabular">12</Text>);
    expect(markup).toContain('data-variant="title"');
    expect(markup).toContain('data-tone="muted"');
    expect(markup).toContain('data-numeric="tabular"');
    expect(markup).toContain("color:#c8102e");
    expect(markup).toContain("font-variant-numeric:tabular-nums");
  });
  it("leaves the default text unchanged", () => {
    const markup = renderToStaticMarkup(<Text>Body</Text>);
    expect(markup).not.toContain("data-numeric");
    expect(markup).not.toContain("color:");
    expect(markup).not.toContain("font-variant-numeric");
  });
});
