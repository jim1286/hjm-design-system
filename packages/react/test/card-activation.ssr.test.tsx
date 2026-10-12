import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card } from "../src/display.js";

describe("whole-card activation", () => {
  it("keeps passive cards as articles and renders active cards as native buttons", () => {
    expect(renderToStaticMarkup(<Card>Summary</Card>)).toMatch(/^<article/u);
    const markup = renderToStaticMarkup(<Card aria-label="Timer" selected disabled onActivate={() => {}}>Timer</Card>);
    expect(markup).toMatch(/^<button/u);
    expect(markup).toContain('type="button"');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('disabled=""');
    expect(markup).toContain('data-state="disabled"');
  });
  it("requires an accessible name and rejects a nested actions region", () => {
    expect(() => renderToStaticMarkup(<Card onActivate={() => {}}>Timer</Card>)).toThrow(/aria-label/u);
    expect(() => renderToStaticMarkup(<Card aria-label="Timer" onActivate={() => {}} actions={<button>Open</button>} />)).toThrow(/no actions/u);
  });
});
